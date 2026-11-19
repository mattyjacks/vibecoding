const sectors = ['Specialty distribution', 'Industrial services', 'Healthcare services', 'Vertical software', 'Consumer products'];
const regions = ['Midwest', 'Southeast', 'Northeast', 'West'];
const evidenceSourceNames = ['Fictional CIM','Fictional financial schedule','Fictional customer schedule','Fictional channel interviews'];
const stages = ['Screening', 'Diligence', 'LBO model', 'Committee', 'Decision'];
const tasks = ['Validate EBITDA adjustments against the financial schedule', 'Confirm top customer renewal and concentration', 'Reconcile growth with the independent channel checks'];
const defaults = { min: 4, max: 10, cap: 20, sector: sectors[0], region: 'Any' };
let seed = 812741;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
const pick = list => list[Math.floor(random() * list.length)];
const round = value => Number(value.toFixed(1));
const money = value => (value < 0 ? '-$' : '$') + Math.abs(value).toFixed(1) + 'M';
function seedDeal(id) {
  const ebitda = round(1.5 + random() * 12);
  const growth = Math.floor(3 + random() * 29);
  const sector = pick(sectors);
  return { id, sector, region: pick(regions), ebitda, growth,
    revenue: round(ebitda / (0.10 + random() * 0.17)),
    concentration: Math.floor(9 + random() * 28),
    checkedGrowth: Math.max(-5, growth - Math.floor(random() * 17)),
    adjusted: round(ebitda + random() * 1.5), broker: pick(['Oak Run Advisors','Verge Capital','Marlstone Partners']) };
}
const prefixes = ['Juniper','Slate','Northlight','Silverfern','Cedarline','Redwillow','Osprey','Lakecrest','Foxridge','Birchwell'];
const suffixes = ['Supply','Systems','Equipment','Partners','Works','Group','Holdings','Solutions','Industries','Networks'];
const names = prefixes.flatMap(prefix => suffixes.map(suffix => prefix + ' ' + suffix));
const deals = Array.from({ length: 50 }, (_, index) => ({
  ...seedDeal(index + 1), name: names.splice(Math.floor(random() * names.length), 1)[0]
}));
deals[0] = { id:1, name:'Ridgeline Pump & Valve', sector:sectors[0], region:'Midwest', revenue:42.8, ebitda:6.4, adjusted:7.5, growth:23, checkedGrowth:8, concentration:31, broker:'Oak Run Advisors' };
for (const deal of deals.slice(1, 7)) {
  deal.sector = sectors[0];
  deal.ebitda = round(4 + random() * 3);
  deal.revenue = round(deal.ebitda / (0.12 + random() * 0.10));
  deal.concentration = Math.floor(10 + random() * 11);
  deal.adjusted = round(deal.ebitda + random() * 0.4);
  deal.checkedGrowth = deal.growth - Math.floor(random() * 5);
}
const history = Array.from({length: 80}, (_, index) => {
  const deal = seedDeal(index);
  return { ...deal, pursue: deal.ebitda >= 3 && deal.ebitda <= 7.5 &&
    sectors.indexOf(deal.sector) < 2 && deal.concentration <= 30 && deal.checkedGrowth >= 4 };
});
const intakeDeals = Array.from({length:12},(_,index) => ({
  ...seedDeal(51 + index), name:names.splice(Math.floor(random() * names.length),1)[0]
}));
function historicalFit(deal) {
  const neighbors = history.filter(previous => previous !== deal).map(previous => ({
    pursue: previous.pursue,
    distance: Math.abs(previous.ebitda - deal.ebitda) / 5 +
      Math.abs(previous.concentration - deal.concentration) / 22 +
      Math.abs(previous.checkedGrowth - deal.checkedGrowth) / 30 +
      (previous.sector === deal.sector ? 0 : 1)
  })).sort((first, second) => first.distance - second.distance).slice(0, 7);
  const weight = neighbor => 1 / (0.25 + neighbor.distance);
  return neighbors.reduce((sum, neighbor) => sum + (neighbor.pursue ? weight(neighbor) : 0), 0) /
    neighbors.reduce((sum, neighbor) => sum + weight(neighbor), 0);
}
function evaluate(deal, thesis) {
  const fitted = deal.ebitda >= thesis.min && deal.ebitda <= thesis.max;
  const sector = thesis.sector === 'Any' || deal.sector === thesis.sector;
  const region = thesis.region === 'Any' || deal.region === thesis.region;
  const historical = historicalFit(deal);
  const contributions = [
    {label:'Starting score',points:0.8,max:0.8},
    {label:'Sector fit',points:3.5 * Number(sector),max:3.5},
    {label:'EBITDA fit',points:2.7 * Number(fitted),max:2.7},
    {label:'Region fit',points:Number(region),max:1},
    {label:'Historical pursuit signal',points:2 * historical,max:2}
  ];
  const fit = round(contributions.reduce((total,component) => total + component.points,0));
  const flags = [];
  if (deal.concentration > thesis.cap) flags.push({ title:'Customer concentration exceeds the buy box', detail:'Largest customer represents ' + deal.concentration + '% of revenue against a ' + thesis.cap + '% cap. Confirm contract renewal and downside exposure.', source:2 });
  if (deal.growth - deal.checkedGrowth >= 8) flags.push({ title:'Growth claim needs corroboration', detail:'The CIM claims ' + deal.growth + '% growth. Fictional distributor checks suggest ' + deal.checkedGrowth + '%. Request a revenue bridge by customer and product.', source:3 });
  if (round(deal.adjusted - deal.ebitda) >= 0.6) flags.push({ title:'Unverified EBITDA add-backs', detail:'The CIM claims ' + money(deal.adjusted) + ' adjusted EBITDA. The financial schedule supports ' + money(deal.ebitda) + ' before unsupported add-backs.', source:1 });
  return { fit, historical, contributions, flags, fitted, sector, region, decision: fit < 6 ? 'Pass' : flags.length || fit < 7.5 ? 'Review' : 'Pursue' };
}
function sponsorCostAtExit(initialEquity,years,rate) {
  const yearsHeld = years.length;
  return initialEquity * (1 + rate) ** yearsHeld +
    years.reduce((sum,year) => sum + year.sponsorFunding * (1 + rate) ** (yearsHeld - year.year),0);
}
function sponsorIrr(initialEquity, years, exitEquity) {
  const terminal = exitEquity - years.at(-1).sponsorFunding;
  if (terminal <= 0) return null;
  let low = -1;
  let high = Math.max(1,terminal / initialEquity);
  for (let index = 0; index < 80; index++) {
    const estimate = (low + high) / 2;
    if (sponsorCostAtExit(initialEquity,years,estimate) > exitEquity) high = estimate;
    else low = estimate;
  }
  return (low + high) * 50;
}
function model(deal, terms) {
  const price = deal.ebitda * terms.entry;
  const debt = deal.ebitda * terms.leverage;
  const feeRate = terms.fees ?? 0;
  if (debt >= price || !Number.isFinite(feeRate) || feeRate < 0 || feeRate > 10 ||
      !Number.isInteger(terms.years) || terms.years < 1 || terms.years > 10) return null;
  const fees = price * feeRate / 100;
  const totalUses = price + fees;
  const equity = totalUses - debt;
  let closingDebt = debt;
  let cashBalance = 0;
  let ebitda = deal.ebitda;
  const years = Array.from({length: terms.years}, (_, index) => {
    ebitda *= 1 + terms.growth / 100;
    const interest = closingDebt * terms.interest / 100;
    const cash = ebitda * terms.cash / 100 - interest;
    const availableCash = cashBalance + cash;
    const repayment = Math.min(closingDebt,Math.max(0,availableCash));
    const sponsorFunding = Math.max(0,-availableCash);
    closingDebt -= repayment;
    cashBalance = Math.max(0,availableCash - repayment);
    return {year:index + 1,ebitda,interest,cash,repayment,sponsorFunding,debt:closingDebt,cashBalance};
  });
  const exitEv = ebitda * terms.exit;
  const exitEquity = Math.max(0,exitEv - closingDebt + cashBalance);
  const sponsorFunding = years.reduce((sum,year) => sum + year.sponsorFunding,0);
  const moic = exitEquity / (equity + sponsorFunding);
  return {price,fees,totalUses,debt,equity,years,exitEv,exitEquity,sponsorFunding,moic,irr:sponsorIrr(equity,years,exitEquity)};
}

function targetExitMultiple(returns,targetIrr) {
  const finalYear = returns.years.at(-1);
  const equityNeeded = sponsorCostAtExit(returns.equity,returns.years,targetIrr / 100);
  const enterpriseValue = Math.max(0,equityNeeded + finalYear.debt - finalYear.cashBalance);
  return {enterpriseValue,multiple:enterpriseValue / finalYear.ebitda};
}
function realizeExit({entryEquity,followOn,enterpriseValue,netDebt,fees}) {
  const invested = entryEquity + followOn;
  const proceeds = Math.max(0,enterpriseValue - netDebt - fees);
  return {invested,proceeds,moic:proceeds / invested};
}
