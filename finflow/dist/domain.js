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

const lboPresets = {
  'Conservative (3.0x)': { entry: 8.0, exit: 8.5, leverage: 3.0, growth: 7, interest: 8.0, cash: 65, fees: 2.0, years: 5 },
  'Standard LBO (4.5x)': { entry: 8.5, exit: 9.0, leverage: 4.5, growth: 8, interest: 9.0, cash: 60, fees: 2.0, years: 5 },
  'Aggressive (5.5x)': { entry: 9.0, exit: 9.5, leverage: 5.5, growth: 10, interest: 10.5, cash: 55, fees: 2.5, years: 5 },
  'Growth Equity (0x Debt)': { entry: 10.0, exit: 10.5, leverage: 0, growth: 15, interest: 0, cash: 70, fees: 1.5, years: 5 }
};

function valueCreationBridge(deal, terms, returns) {
  if (!returns || !returns.years?.length) return null;
  const finalYear = returns.years.at(-1);
  const entryEbitda = deal.ebitda;
  const exitEbitda = finalYear.ebitda;
  const entryMultiple = terms.entry;
  const exitMultiple = terms.exit;
  const ebitdaGrowth = (exitEbitda - entryEbitda) * entryMultiple;
  const multipleExpansion = exitEbitda * (exitMultiple - entryMultiple);
  const deleveraging = returns.debt - finalYear.debt + finalYear.cashBalance - returns.fees;
  const rawExitEquity = returns.exitEv - finalYear.debt + finalYear.cashBalance;
  const equityFloorAdjustment = returns.exitEquity - rawExitEquity;
  const totalValueCreated = returns.exitEquity - returns.equity;
  return {
    entryEquity: returns.equity,
    exitEquity: returns.exitEquity,
    entryEbitda,
    exitEbitda,
    entryMultiple,
    exitMultiple,
    ebitdaGrowth,
    multipleExpansion,
    deleveraging,
    equityFloorAdjustment,
    totalValueCreated
  };
}

function creditMetrics(deal, terms, returns) {
  if (!returns || !returns.years?.length) return null;
  const finalYear = returns.years.at(-1);
  const openingLeverage = deal.ebitda > 0 ? returns.debt / deal.ebitda : 0;
  const exitLeverage = finalYear.ebitda > 0 ? finalYear.debt / finalYear.ebitda : 0;
  const exitNetLeverage = finalYear.ebitda > 0 ? (finalYear.debt - finalYear.cashBalance) / finalYear.ebitda : 0;
  const coverages = returns.years.filter(y => y.interest > 0).map(y => y.ebitda / y.interest);
  const minInterestCoverage = coverages.length ? Math.min(...coverages) : Infinity;
  const debtPaydownPct = returns.debt > 0 ? ((returns.debt - finalYear.debt) / returns.debt) * 100 : 100;
  const covenantWarnings = [];
  if (openingLeverage > 5.5) covenantWarnings.push('Opening leverage (' + openingLeverage.toFixed(1) + 'x) exceeds 5.5x senior lender ceiling');
  if (minInterestCoverage < 2.0) covenantWarnings.push('Minimum interest coverage (' + minInterestCoverage.toFixed(2) + 'x) breaches 2.0x covenant floor');
  if (returns.sponsorFunding > 0) covenantWarnings.push('Requires ' + money(returns.sponsorFunding) + ' in follow-on sponsor equity cure');
  return {
    openingLeverage,
    exitLeverage,
    exitNetLeverage,
    minInterestCoverage,
    avgCashConversion: terms.cash,
    debtPaydownPct,
    covenantWarnings
  };
}

function structuredEvidence(deal) {
  const fy25Rev = deal.revenue;
  const fy24Rev = round(fy25Rev / (1 + Math.max(-0.2, deal.growth / 100)));
  const fy23Rev = round(fy24Rev / (1 + Math.max(-0.2, (deal.growth * 0.85) / 100)));
  const fy25Adj = deal.adjusted;
  const fy25Sup = deal.ebitda;
  const marginPct = round((fy25Sup / fy25Rev) * 100);
  const fy24Ebitda = round(fy25Sup * (fy24Rev / fy25Rev) * 0.96);
  const fy23Ebitda = round(fy25Sup * (fy23Rev / fy25Rev) * 0.92);

  const addBackTotal = Math.max(0, round(fy25Adj - fy25Sup));
  const ownerComp = round(addBackTotal * 0.42);
  const erpTransition = round(addBackTotal * 0.35);
  const pricingSynergy = Math.max(0, round(addBackTotal - ownerComp - erpTransition));
  const addBacks = addBackTotal > 0 ? [
    { item: 'Excess founder compensation & perks', amount: ownerComp, status: addBackTotal >= 0.6 ? 'Partially verified' : 'Verified' },
    { item: 'One-time ERP & warehouse migration', amount: erpTransition, status: addBackTotal >= 0.6 ? 'Unverified' : 'Verified' },
    { item: 'Pro-forma run-rate pricing initiative', amount: pricingSynergy, status: 'Unsupported' }
  ].filter(row => row.amount > 0) : [];

  const c1 = deal.concentration;
  const remainingTop = Math.max(4, Math.min(35, Math.round((100 - c1) * 0.36)));
  const c2 = Math.max(2, Math.min(c1 - 1, Math.round(remainingTop * 0.40)));
  const c3 = Math.max(2, Math.min(c2, Math.round(remainingTop * 0.28)));
  const c4 = Math.max(1, Math.min(c3, Math.round(remainingTop * 0.19)));
  const c5 = Math.max(1, Math.min(c4, remainingTop - c2 - c3 - c4));
  const rest = Math.max(0, 100 - (c1 + c2 + c3 + c4 + c5));
  const customerBaseYear = 2026 + (deal.id % 4);
  const customers = [
    { account: 'Anchor Account A (MSA)', share: c1, revenue: round((fy25Rev * c1) / 100), renewal: String(customerBaseYear), risk: c1 > 20 ? 'High' : 'Low' },
    { account: 'Regional Distributor B', share: c2, revenue: round((fy25Rev * c2) / 100), renewal: String(customerBaseYear + 1), risk: 'Low' },
    { account: 'National OEM Partner C', share: c3, revenue: round((fy25Rev * c3) / 100), renewal: String(customerBaseYear + 1), risk: 'Low' },
    { account: 'Enterprise Buyer D', share: c4, revenue: round((fy25Rev * c4) / 100), renewal: String(customerBaseYear + 2), risk: 'Low' },
    { account: 'Mid-Market Account E', share: c5, revenue: round((fy25Rev * c5) / 100), renewal: String(customerBaseYear + 2), risk: 'Low' },
    { account: 'Long-tail base (' + (42 + (deal.id % 35)) + ' accounts)', share: rest, revenue: round((fy25Rev * rest) / 100), renewal: 'Evergreen', risk: 'Low' }
  ];

  const growthGap = deal.growth - deal.checkedGrowth;
  const quotes = [
    {
      source: 'Fictional distributor check #1 (' + deal.region + ')',
      quote: growthGap >= 8
        ? 'Volume grew ~' + deal.checkedGrowth + '% YoY; management price increases drove most of the remaining top-line lift reported in the CIM.'
        : 'Underlying unit demand tracks near ' + deal.checkedGrowth + '%–' + deal.growth + '% with steady reorder cadence across core SKUs.'
    },
    {
      source: 'Fictional customer interview #' + ((deal.id % 5) + 1),
      quote: deal.concentration > 20
        ? 'Primary supplier for ~' + deal.concentration + '% of company volume; upcoming ' + customerBaseYear + ' RFP will benchmark pricing against two regional peers.'
        : 'High switching cost and 98% on-time fulfillment keep retention strong with multi-year contract visibility.'
    },
    {
      source: 'Fictional field diligence call',
      quote: 'Working capital turns are consistent with ' + deal.sector.toLowerCase() + ' benchmarks; management relies on ' + deal.broker + ' for sell-side data room packaging.'
    }
  ];

  return {
    cimHistory: [
      { period: 'FY23A', revenue: fy23Rev, ebitda: fy23Ebitda, margin: round((fy23Ebitda / fy23Rev) * 100) },
      { period: 'FY24A', revenue: fy24Rev, ebitda: fy24Ebitda, margin: round((fy24Ebitda / fy24Rev) * 100) },
      { period: 'FY25E', revenue: fy25Rev, ebitda: fy25Adj, margin: round((fy25Adj / fy25Rev) * 100), supported: fy25Sup, supportedMargin: marginPct }
    ],
    addBacks,
    addBackTotal,
    customers,
    quotes
  };
}

function fundSummary(dealsList, workMap) {
  let activeCount = 0;
  let exitedCount = 0;
  let totalInvested = 0;
  let realizedProceeds = 0;
  let unrealizedNav = 0;
  let pipelineEbitda = 0;
  let activeCommitteeCount = 0;
  let closingCount = 0;

  for (const deal of dealsList) {
    pipelineEbitda += deal.ebitda;
    const record = workMap?.[deal.id];
    if (!record) continue;
    if (record.progress >= 3 && (!record.decision || record.decision === 'Deferred')) activeCommitteeCount++;
    if (record.decision === 'Approved' && !record.closing?.closedAt) closingCount++;
    if (!record.closing?.closedAt) continue;

    const terms = record.terms ?? { entry: 8, exit: 9, leverage: 4, growth: 8, interest: 8, cash: 60, fees: 2, years: 5 };
    const returns = model(deal, terms);
    const entryEquity = returns ? returns.equity : deal.ebitda * 4;
    const quarters = Object.entries(record.portfolio ?? {}).sort(([a], [b]) => b.localeCompare(a));
    const latestQ = quarters[0]?.[1];
    const currentEbitdaRunRate = latestQ ? latestQ.ebitda * 4 : deal.ebitda;
    const netDebt = returns ? returns.debt * 0.8 : deal.ebitda * 3;

    if (record.exit) {
      exitedCount++;
      totalInvested += record.exit.invested ?? entryEquity;
      realizedProceeds += record.exit.proceeds ?? 0;
    } else {
      activeCount++;
      totalInvested += entryEquity;
      const impliedEv = currentEbitdaRunRate * terms.exit;
      unrealizedNav += Math.max(0, impliedEv - netDebt);
    }
  }

  const totalValue = realizedProceeds + unrealizedNav;
  return {
    activeCount,
    exitedCount,
    totalInvested: round(totalInvested),
    realizedProceeds: round(realizedProceeds),
    unrealizedNav: round(unrealizedNav),
    totalValue: round(totalValue),
    dpi: totalInvested > 0 ? realizedProceeds / totalInvested : 0,
    rvpi: totalInvested > 0 ? unrealizedNav / totalInvested : 0,
    tvpi: totalInvested > 0 ? totalValue / totalInvested : 0,
    pipelineEbitda: round(pipelineEbitda),
    activeCommitteeCount,
    closingCount
  };
}

function buildFundSnapshot() {
  const now = new Date().toISOString();
  const futureDate = days => {
    const d = new Date(Date.now() + days * 86400000);
    return d.toISOString().slice(0, 10);
  };
  return {
    thesis: { min: 4, max: 10, cap: 25, sector: 'Any', region: 'Any' },
    watchlist: [1, 2, 3, 5],
    intake: [51],
    customDeals: [],
    work: {
      1: {
        progress: 2,
        lead: 'Amara Bell',
        checked: [0, 1],
        notes: 'Anchor customer RFP is the single gating risk. Operations and gross margin profile are best-in-class for Midwest distribution.',
        issues: [
          { id: 'snap-1-a', title: 'Validate $1.1M ERP & owner comp add-backs in QoE', owner: 'Amara Bell', priority: 'High', dueDate: futureDate(6), resolved: false },
          { id: 'snap-1-b', title: 'Complete top-customer procurement reference call before LOI', owner: 'Eli Mercer', priority: 'High', dueDate: futureDate(-2), resolved: false },
          { id: 'snap-1-c', title: 'Bridge 23% reported growth vs 8% distributor channel check', owner: 'Mina Holt', priority: 'Medium', dueDate: futureDate(10), resolved: true }
        ],
        caseName: 'Base',
        targetIrr: 20,
        terms: { entry: 8.0, exit: 9.0, leverage: 4.0, growth: 8, interest: 8.5, cash: 60, fees: 2.0, years: 5 },
        cases: {
          Base: { entry: 8.0, exit: 9.0, leverage: 4.0, growth: 8, interest: 8.5, cash: 60, fees: 2.0, years: 5 },
          Downside: { entry: 8.0, exit: 8.0, leverage: 4.0, growth: 3, interest: 9.5, cash: 55, fees: 2.0, years: 5 },
          Upside: { entry: 8.0, exit: 10.0, leverage: 4.0, growth: 13, interest: 8.0, cash: 65, fees: 2.0, years: 5 }
        }
      },
      2: {
        progress: 3,
        lead: 'Eli Mercer',
        checked: [0, 1, 2],
        notes: 'Clean specialty distribution platform with low concentration and disciplined add-backs. Ready for partner vote.',
        issues: [
          { id: 'snap-2-a', title: 'Confirm warehouse lease renewal options in Ohio', owner: 'Eli Mercer', priority: 'Low', dueDate: futureDate(14), resolved: true }
        ],
        submittedAt: now,
        caseName: 'Base',
        terms: { entry: 7.5, exit: 8.5, leverage: 3.5, growth: 9, interest: 8.0, cash: 65, fees: 2.0, years: 5 },
        cases: { Base: { entry: 7.5, exit: 8.5, leverage: 3.5, growth: 9, interest: 8.0, cash: 65, fees: 2.0, years: 5 } }
      },
      3: {
        progress: 4,
        lead: 'Mina Holt',
        checked: [0, 1, 2],
        notes: 'IC approved subject to third-party environmental Phase I and R&W insurance binder.',
        issues: [],
        submittedAt: now,
        terms: { entry: 8.0, exit: 9.0, leverage: 4.0, growth: 8, interest: 8.0, cash: 62, fees: 2.0, years: 5 },
        decision: 'Approved',
        decidedAt: now,
        decisionReason: 'Strong recurring aftermarket parts mix and fragmented customer base.',
        votes: [{ outcome: 'Approved', at: now, reason: 'Strong recurring aftermarket parts mix and fragmented customer base.', conditions: ['Clean Phase I environmental report', 'R&W policy bound at 10% retention'] }],
        closing: { checked: ['documents', 'funding'], notes: 'Debt commitment letter signed; awaiting final environmental sign-off.' }
      },
      4: {
        progress: 4,
        lead: 'Theo Rowan',
        checked: [0, 1, 2],
        notes: 'Closed Q4 platform investment. Executing add-on acquisition playbook in Southeast.',
        issues: [],
        terms: { entry: 7.5, exit: 9.0, leverage: 3.5, growth: 10, interest: 8.0, cash: 65, fees: 2.0, years: 5 },
        decision: 'Approved',
        decidedAt: now,
        decisionReason: 'Platform anchor with high cash conversion.',
        votes: [{ outcome: 'Approved', at: now, reason: 'Platform anchor with high cash conversion.', conditions: [] }],
        closing: { closedAt: '2026-01-15T15:00:00Z', checked: ['documents', 'funding', 'conditions', 'handoff'], notes: 'Wire completed cleanly.' },
        portfolio: {
          '2026 Q1': { revenue: 10.4, revenueBudget: 10.0, ebitda: 1.5, ebitdaBudget: 1.4 },
          '2026 Q2': { revenue: 11.1, revenueBudget: 10.6, ebitda: 1.7, ebitdaBudget: 1.5 },
          '2026 Q3': { revenue: 11.8, revenueBudget: 11.2, ebitda: 1.9, ebitdaBudget: 1.7 }
        }
      },
      5: {
        progress: 1,
        lead: 'Mina Holt',
        checked: [0],
        notes: 'Diligence underway on supplier rebates and freight pass-through contracts.',
        issues: [
          { id: 'snap-5-a', title: 'Audit FY25 supplier volume rebates', owner: 'Mina Holt', priority: 'Medium', dueDate: futureDate(5), resolved: false }
        ]
      },
      6: {
        progress: 4,
        lead: 'Amara Bell',
        checked: [0, 1, 2],
        notes: 'Full realization via strategic sale after 34 months of margin expansion.',
        issues: [],
        terms: { entry: 7.0, exit: 9.5, leverage: 3.5, growth: 11, interest: 7.5, cash: 65, fees: 2.0, years: 5 },
        decision: 'Approved',
        decidedAt: '2024-03-10T14:00:00Z',
        decisionReason: 'Clear roll-up opportunity in specialty components.',
        votes: [{ outcome: 'Approved', at: '2024-03-10T14:00:00Z', reason: 'Clear roll-up opportunity in specialty components.', conditions: [] }],
        closing: { closedAt: '2024-05-01T14:00:00Z', checked: ['documents', 'funding', 'conditions', 'handoff'], notes: 'Closed on schedule.' },
        portfolio: {
          '2025 Q3': { revenue: 13.5, revenueBudget: 12.8, ebitda: 2.1, ebitdaBudget: 1.9 },
          '2025 Q4': { revenue: 14.4, revenueBudget: 13.5, ebitda: 2.3, ebitdaBudget: 2.0 }
        },
        exit: { exitDate: '2026-09-30', entryEquity: 22.0, followOn: 0, enterpriseValue: 92.0, netDebt: 11.8, fees: 2.2, invested: 22.0, proceeds: 78.0, moic: 78.0 / 22.0 }
      }
    },
    activity: [
      { at: now, message: 'Loaded Alder Capital Fund III demo snapshot', dealId: null, url: './desk.html' },
      { at: now, message: 'Recorded strategic exit for deal #6', dealId: 6, url: './portfolio.html?deal=6' },
      { at: now, message: 'Sent deal #2 to Investment Committee', dealId: 2, url: './investment-review.html?deal=2&from=committee' },
      { at: now, message: 'Updated LBO Base/Downside/Upside cases', dealId: 1, url: './underwriting.html?deal=1' }
    ]
  };
}
