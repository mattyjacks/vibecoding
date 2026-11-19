const params = new URLSearchParams(location.search);
function isRehearsalSession() {
  const selected = params.get('workspace');
  const modeKey = 'finflow-workspace-mode';
  try {
    if (selected === 'rehearsal') sessionStorage.setItem(modeKey,'rehearsal');
    else if (selected === 'main') sessionStorage.removeItem(modeKey);
    return sessionStorage.getItem(modeKey) === 'rehearsal';
  } catch {
    return selected === 'rehearsal';
  }
}
const rehearsal = isRehearsalSession();
const storageKey = rehearsal ? 'finflow-rehearsal-state' : 'cairn-demo-v1';
const workspaceStorage = () => rehearsal ? sessionStorage : localStorage;
function readWorkspace() {
  try {
    const saved = JSON.parse(workspaceStorage().getItem(storageKey));
    if (saved?.thesis && saved?.work) return saved;
  } catch {}
  return null;
}
let state = readWorkspace() ?? {thesis:{...defaults},work:{}};
deals.push(...intakeDeals.filter(deal => state.intake?.includes(deal.id)));
const persist = () => workspaceStorage().setItem(storageKey,JSON.stringify(state));
const app = document.querySelector('#app');
const sourceDialog = document.querySelector('#source');
const dealPages = ['screening','diligence','underwriting','investment-review','decision'];
const currentPage = document.body.dataset.page;
const dealStep = dealPages.indexOf(currentPage);
const workspacePages = {
  queue:['Deal pipeline',queuePage],
  board:['Pipeline board',pipelineBoard],
  walkthrough:['Demo walkthrough',walkthroughPage],
  watchlist:['Watchlist',watchlistPage],
  packet:['Committee packet',committeePacket],
  desk:['Deal Desk',deskPage],
  'diligence-queue':['Diligence queue',diligenceQueuePage],
  thesis:['Investment thesis',thesisPage],
  compare:['Compare deals',comparisonPage],
  closing:['Closing',closingWorkspace],
  evidence:['Evidence library',evidenceLibrary],
  portfolio:['Portfolio',portfolioWorkspace],
  activity:['Activity',activityPage],
  intake:['Fictional intake',intakePage],
  committee:['Investment committee',committeePage]
};
const page = dealStep >= 0 ? (params.get('from') === 'committee' ? 'committee' : 'queue') :
  Object.hasOwn(workspacePages,currentPage) ? currentPage : 'queue';
const step = Math.max(0, dealStep);
const active = dealStep < 0 ? null : deals.find(deal => String(deal.id) === params.get('deal'));
let filter = 'All';
let query = '';
let sectorFilter = 'All';
let leadFilter = 'All';
const dealLeads = ['Unassigned','Amara Bell','Eli Mercer','Mina Holt','Theo Rowan'];
let stageFilter = 'All';
let queueSort = 'Pipeline order';
const queueSortOrders = ['Pipeline order','Fit highest first','EBITDA highest first','Company A–Z'];
const queueViewStorageKey = rehearsal ? 'finflow-rehearsal-queue-view' : 'finflow-queue-view';
function restoreQueueView() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(queueViewStorageKey));
    if (!saved) return;
    if (typeof saved.query === 'string') query = saved.query.slice(0,100);
    if (['All','Pursue','Review','Pass'].includes(saved.filter)) filter = saved.filter;
    if (sectors.includes(saved.sector)) sectorFilter = saved.sector;
    if (dealLeads.includes(saved.lead)) leadFilter = saved.lead;
    if (stages.includes(saved.stage)) stageFilter = saved.stage;
    if (queueSortOrders.includes(saved.sort)) queueSort = saved.sort;
  } catch {}
}
function saveQueueView() {
  try {
    sessionStorage.setItem(queueViewStorageKey, JSON.stringify({query,filter,sector:sectorFilter,lead:leadFilter,stage:stageFilter,sort:queueSort}));
  } catch {}
}
restoreQueueView();
let noticeTimer;
let screeningStatus;
let batchRunning = false;
const safe = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const pill = status => '<span class="pill ' + status.toLowerCase() + '">' + status + '</span>';
const options = (items, current) => items.map(item => '<option' + (item === current ? ' selected' : '') + '>' + item + '</option>').join('');
const button = (label, action, style = '') => '<button class="button ' + style + '" data-action="' + action + '">' + label + '</button>';
const src = (index, label) => '<button class="source-link" data-source="' + index + '">' + label + '</button>';
const input = (label, key, value, min, max, precision = '0.1') => '<label>' + label + '<input required type="number" name="' + key + '" value="' + value + '" min="' + min + '" max="' + max + '" step="' + precision + '"></label>';
const work = deal => state.work[deal.id] ||= { progress:0, checked:[], notes:'', terms:{entry:8,exit:8,leverage:3.5,growth:7,interest:9,cash:50,years:5} };
const sourceTitles = ['pp. 12–18','FY25','p. 3','p. 2'].map((label,index) => evidenceSourceNames[index] + ' · ' + label);
function sources(deal) {
  return [
    deal.broker + ' reports FY25 sales of ' + money(deal.revenue) + ', adjusted EBITDA of ' + money(deal.adjusted) + ' and year-over-year revenue growth of ' + deal.growth + '%.',
    'FY25 management financials show ' + money(deal.revenue) + ' in revenue and support ' + money(deal.ebitda) + ' in EBITDA. The remaining ' + money(deal.adjusted - deal.ebitda) + ' of proposed adjustments requires supporting documentation.',
    'The largest customer accounts for ' + deal.concentration + '% of FY25 sales. Renewal terms and consent requirements are pending.',
    'Two fictional channel interviews imply roughly ' + deal.checkedGrowth + '% growth. The interviews are directional and cover a subset of regional sales.'
  ];
}
function toast(message) {
  const notice = document.querySelector('#notice');
  notice.textContent = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => notice.textContent = '', 3000);
}
function render() {
  const [label,view] = workspacePages[page];
  if (rehearsal) {
    const badge = document.querySelector('.demo');
    if (badge) badge.textContent = 'Rehearsal tab · Use fictional data';
  }
  document.querySelector('#breadcrumb').textContent = active?.name ?? label;
  const navPage = page === 'packet' ? 'committee' : page === 'diligence-queue' ? 'desk' : page === 'board' ? 'queue' : page;
  document.querySelectorAll('[data-nav]').forEach(link => {
    const selected = link.dataset.nav === navPage;
    link.classList.toggle('active',selected);
    if (selected) link.setAttribute('aria-current',active || navPage !== page ? 'location' : 'page');
    else link.removeAttribute('aria-current');
  });
  app.innerHTML = active ? dealPage() : view();
  if (active && step === 0) {
    app.append(document.querySelector('#openai-assessment').content.cloneNode(true));
    renderSavedAssessment(work(active));
    showScreeningStatus();
  } else if (page === 'watchlist') showScreeningStatus();
}
function isWatched(deal) {
  return (state.watchlist ?? []).includes(deal.id);
}
function watchButton(deal) {
  const watched = isWatched(deal);
  return '<button class="button" type="button" data-watch="' + deal.id + '" aria-pressed="' + watched +
    '" aria-label="Watch ' + safe(deal.name) + '">' + (watched ? 'Watching' : 'Watch deal') + '</button>';
}
function watchedDeals() {
  return (state.watchlist ?? []).map(id => deals.find(deal => deal.id === id)).filter(Boolean);
}
function watchlistBatch(candidates) {
  if (!candidates.length) return '';
  return '<section class="panel"><h2>OpenAI shortlist screening</h2>' +
    '<p class="muted">Run one assessment per fictional deal listed below. This uses up to three OpenAI requests.</p><ul>' +
    candidates.map(deal => '<li><a class="deal-link" href="' + dealUrl(deal.id,0) + '">' + safe(deal.name) + '</a></li>').join('') +
    '</ul><p id="screening-status" class="muted" role="status">Checking OpenAI screening service…</p>' +
    '<form id="batch-openai-form"><div class="actions"><label>Demo password<input name="password" type="password" required disabled maxlength="50" autocomplete="off"></label>' +
    '<button class="button primary" type="submit" disabled>Assess ' + candidates.length + (candidates.length === 1 ? ' watched deal' : ' watched deals') +
    '</button></div></form><p id="batch-result" role="status" aria-live="polite"></p></section>';
}
function watchlistPage() {
  const watched = watchedDeals();
  const compare = new URLSearchParams();
  watched.slice(0,3).forEach(deal => compare.append('deal',deal.id));
  return '<h1>Watchlist</h1><section class="panel"><h2>Saved deals</h2>' +
    (watched.length ?
      '<div class="actions"><a class="button action-link" href="./compare.html?' + safe(compare.toString()) + '">' +
      (watched.length > 3 ? 'Compare three most recently watched' : 'Open in Compare Deals') + '</a></div>' +
      '<div class="scroll"><table><thead><tr><th scope="col">Company</th><th scope="col">Fit / 10</th><th scope="col">Screen</th><th scope="col">Workflow</th><th scope="col">Watchlist</th></tr></thead><tbody>' +
      watched.map(deal => {
        const result = evaluate(deal,state.thesis);
        return '<tr><td><a class="deal-link" href="' + dealUrl(deal.id,0) + '">' + safe(deal.name) + '</a></td><td>' +
          result.fit.toFixed(1) + '</td><td>' + pill(result.decision) + '</td><td>' +
          safe(queueWorkflow(deal)) + '</td><td>' + watchButton(deal) + '</td></tr>';
      }).join('') + '</tbody></table></div>' :
      '<p class="muted">Use Watch deal on a screening page to save it here.</p><a class="button action-link" href="./index.html">View deal pipeline</a>') +
    '</section>' + watchlistBatch(watched.slice(0,3));
}
function walkthroughPage() {
  const featured = deals[0];
  const record = state.work[featured.id];
  const progress = record?.progress ?? 0;
  const stop = (heading,description,link,label) => '<section class="panel"><h2>' + heading +
    '</h2><p class="muted">' + description + '</p>' +
    (link ? '<a class="button action-link" href="' + safe(link) + '">' + label + '</a>' : '') + '</section>';
  return '<section class="hero"><div><div class="kicker">FINFLOW · FICTIONAL DEAL WALKTHROUGH</div><h1>From inbox to investment committee</h1>' +
    '<p>Follow Ridgeline Pump &amp; Valve, a company that fits Alder Capital’s stated mandate and still needs partner review.</p></div>' +
    '<a class="button light action-link" href="' + dealUrl(featured.id,Math.min(progress,4)) + '">Resume featured deal</a></section>' +
    '<section class="panel"><h2>Rehearsal</h2>' +
    (rehearsal ?
      '<p class="muted">This tab has its own fictional workspace. The main workspace keeps its saved work.</p><a class="button action-link" href="./walkthrough.html?workspace=main">Return to main workspace</a>' :
      '<p class="muted">Open a separate tab with a fresh fictional pipeline and default buy box to practice without changing saved work.</p>' +
      '<a class="button action-link" href="./walkthrough.html?workspace=rehearsal" target="_blank" rel="noopener">Start clean rehearsal</a>') +
    '</section>' +
    '<div class="desk-grid">' +
    stop('Screen and verify','Open the customer schedule to see 31% concentration against the default 20% cap. Check the growth claim and the EBITDA add-backs, then run the password-gated Luna assessment.',
      dealUrl(featured.id,0),'Open screening') +
    stop('Run diligence','Assign the renewal question to Commercial. Use the broker follow-up draft to show what evidence the team still needs.',
      progress >= 1 ? dealUrl(featured.id,1) : '', 'Open diligence') +
    stop('Test the investment case','Compare Base, Downside, and Upside. Adjust the exit multiple or EBITDA growth to show how cash flow and sponsor returns move.',
      progress >= 2 ? dealUrl(featured.id,2) : '', 'Open underwriting') +
    stop('Record the committee decision','Defer for evidence, return to diligence, then revisit the vote. Open the printable packet to show the brief and rationale together.',
      progress >= 3 ? dealUrl(featured.id,progress >= 4 ? 4 : 3) : '', 'Open committee record') +
    stop('Close and hand off','Complete the fictional closing milestones. Record quarterly portfolio performance against budget after closing.',
      record?.closing?.closedAt ? portfolioUrl(featured.id) : record?.decision === 'Approved' ? closingUrl(featured.id) : '',
      record?.closing?.closedAt ? 'Open portfolio' : 'Open closing checklist') +
    '</div>';
}
function deskQueues() {
  const records = deals.map(deal => ({deal, record:state.work[deal.id]}));
  const screens = records.filter(({record}) => !record?.progress).flatMap(({deal}) => {
    const result = evaluate(deal,state.thesis);
    return result.decision === 'Review' ? [{deal, detail:result.flags.length + ' screening exceptions', href:dealUrl(deal.id,0)}] : [];
  });
  const diligence = records.flatMap(({deal,record}) => {
    if (!record || record.decision === 'Declined' || record.closing?.closedAt) return [];
    const open = diligenceIssues(record).filter(issue => !issue.resolved);
    const count = open.length;
    const overdue = open.filter(issue => issueOverdue(issue)).length;
    const detail = count + (count === 1 ? ' open issue' : ' open issues') + (overdue ? ' · ' + overdue + ' overdue' : '');
    return count ? [{deal,detail,href:dealUrl(deal.id,1)}] : [];
  });
  const committee = records.filter(({record}) => record?.progress >= 3 && (!record.decision || record.decision === 'Deferred'))
    .map(({deal,record}) => ({deal, detail:record.decision === 'Deferred' ? 'Deferred for follow-up' : 'Awaiting vote',
      href:dealUrl(deal.id,record.decision === 'Deferred' ? 4 : 3,'committee')}));
  const closing = records.filter(({record}) => record?.decision === 'Approved' && !record.closing?.closedAt)
    .map(({deal,record}) => ({deal, detail:(record.closing?.checked.length ?? 0) + ' of ' + closingChecklist(record).length + ' milestones complete', href:closingUrl(deal.id)}));
  return [
    ['Screening reviews',screens,'No deals await screening review.'],
    ['Diligence issues',diligence,'No unresolved diligence issues on active deals.'],
    ['Committee queue',committee,'No pending or deferred deals.'],
    ['Closing checklist',closing,'No approved deals awaiting closing.']
  ];
}
function deskPage() {
  return '<h1>Deal Desk</h1><p class="muted">Review open work for the fictional Alder Capital pipeline.</p>' +
    '<div class="actions vote-actions"><a class="button action-link" href="./diligence-queue.html">Open diligence queue</a>' +
    button('Download deal desk digest','desk-digest') + '</div><div class="desk-grid vote-actions">' +
    deskQueues().map(([title,rows,empty]) => deskQueue(title,rows,empty)).join('') + '</div>';
}
function deskDigest() {
  const counts = Object.fromEntries([...stages,'Closing','Portfolio','Exited'].map(stage => [stage,0]));
  for (const deal of deals) counts[boardStage(deal).lane]++;
  return [
    'FINFLOW · FICTIONAL DEAL DESK DIGEST',
    'Prepared ' + new Date().toLocaleDateString(),
    '',
    'Pipeline · ' + deals.length + ' fictional deals',
    ...Object.entries(counts).map(([stage,count]) => stage + ': ' + count),
    ...deskQueues().flatMap(([title,rows,empty]) => [
      '',title + ' · ' + rows.length,
      ...(rows.length ? rows.map(({deal,detail}) => '- ' + deal.name + ' · ' + detail + ' · Lead: ' + dealLead(deal)) : [empty])
    ])
  ].join('\n');
}
function deskQueue(title,rows,emptyText) {
  return '<section class="panel"><div class="issue-row"><h2>' + title + '</h2><span class="pill">' + rows.length + '</span></div>' +
    (rows.length ? rows.map(({deal,detail,href}) => '<div class="finding"><a class="deal-link" href="' + safe(href) + '">' +
      safe(deal.name) + '</a><p class="muted">' + detail + ' · Lead: ' + safe(dealLead(deal)) + '</p></div>').join('') : '<p class="muted">' + emptyText + '</p>') +
    '</section>';
}
function intakePage() {
  const added = state.intake ?? [];
  const available = intakeDeals.filter(deal => !added.includes(deal.id));
  return '<h1>Fictional intake</h1><section class="panel"><h2>Bundled inbound deals</h2>' +
    '<p class="muted">Select a fictional company to add it to your pipeline and open screening. Each example comes with four fictional sources.</p>' +
    (available.length ? '<div class="scroll"><table><thead><tr><th scope="col">Company</th><th scope="col">Sector</th><th scope="col">Region</th><th scope="col">Introduced by</th><th scope="col">Intake</th></tr></thead><tbody>' +
      available.map(deal => '<tr><td>' + safe(deal.name) + '</td><td>' + safe(deal.sector) + '</td><td>' + safe(deal.region) +
        '</td><td>' + safe(deal.broker) + '</td><td><button class="button primary" data-intake="' + deal.id +
        '" aria-label="Add ' + safe(deal.name) + '">Add and screen</button></td></tr>').join('') +
      '</tbody></table></div>' : '<p>All bundled inbound deals are in your pipeline.</p><a class="button action-link" href="./index.html">View pipeline</a>') +
    '</section>';
}
function globalDealResults(value) {
  const query = value.trim().toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  const matches = deals.filter(deal => {
    const searchable = [deal.name,deal.sector,deal.region,dealLead(deal)].join(' ').toLowerCase();
    return terms.every(term => searchable.includes(term));
  }).sort((left,right) => {
    const priority = deal => deal.name.toLowerCase().startsWith(query) ? 0 :
      deal.name.toLowerCase().includes(query) ? 1 : 2;
    return priority(left) - priority(right) || left.name.localeCompare(right.name);
  });
  const visible = matches.slice(0,8);
  return '<p class="muted" role="status">' + (matches.length ?
    'Showing ' + visible.length + ' of ' + matches.length + ' deals.' : 'No fictional deals match.') + '</p>' +
    (visible.length ? '<ul class="global-deal-list">' + visible.map(deal => {
      const stage = boardStage(deal);
      return '<li class="finding"><a class="deal-link" href="' + safe(stage.href) + '">' + safe(deal.name) +
        '</a><p class="muted">' + safe(deal.sector) + ' · ' + stage.lane + '</p></li>';
    }).join('') + '</ul>' : '');
}
function openGlobalDealSearch() {
  const dialog = document.querySelector('#deal-search-dialog');
  if (!dialog || dialog.open) return;
  const input = document.querySelector('#global-deal-query');
  input.value = '';
  document.querySelector('#global-deal-results').innerHTML = globalDealResults('');
  dialog.showModal();
  input.focus();
}
function boardStage(deal) {
  const record = state.work[deal.id];
  if (record?.exit) return {lane:'Exited',href:portfolioUrl(deal.id)};
  if (record?.closing?.closedAt) return {lane:'Portfolio',href:portfolioUrl(deal.id)};
  if (record?.decision === 'Approved') return {lane:'Closing',href:closingUrl(deal.id)};
  const stage = record?.progress ?? 0;
  return {lane:stages[stage],href:dealUrl(deal.id,stage)};
}
function pipelineBoard() {
  const owners = ['All',...dealLeads];
  const owner = owners.includes(params.get('lead')) ? params.get('lead') : 'All';
  const lanes = Object.fromEntries([...stages,'Closing','Portfolio','Exited'].map(label => [label,[]]));
  const selected = deals.filter(deal => owner === 'All' || dealLead(deal) === owner);
  for (const deal of selected) {
    const slot = boardStage(deal);
    lanes[slot.lane].push({deal,href:slot.href,result:evaluate(deal,state.thesis)});
  }
  return '<div class="actions"><a class="button action-link" href="./index.html">Table view</a></div><h1>Pipeline board</h1>' +
    '<form class="panel" action="./board.html" method="get"><div class="actions"><label>Deal lead<select name="lead">' +
    options(owners,owner) + '</select></label><button class="button">Apply filter</button></div></form>' +
    '<div class="pipeline-board" tabindex="0" role="region" aria-label="Pipeline workflow lanes">' +
    Object.entries(lanes).map(([title,cards]) => '<section class="board-lane"><header><h2>' + title +
      '</h2><span class="pill">' + cards.length + '</span></header><div class="lane-cards">' +
      (cards.length ? cards.map(({deal,href,result}) => '<article class="board-card"><h3><a class="deal-link" href="' +
        safe(href) + '">' + safe(deal.name) + '</a></h3><p class="muted">' + safe(deal.sector) + '</p><div class="issue-row">' +
        pill(state.work[deal.id]?.decision ?? result.decision) + '<span>' + money(deal.ebitda) + ' EBITDA</span></div><p class="muted">' +
        safe(dealLead(deal)) + '</p></article>').join('') : '<p class="muted lane-empty">No deals in this stage.</p>') +
      '</div></section>').join('') + '</div>';
}
function queuePage() {
  const evaluated = deals.map(deal => ({ deal, result: evaluate(deal,state.thesis) }));
  const count = status => evaluated.filter(item => item.result.decision === status).length;
  return '<section class="hero"><div><div class="kicker">ALDER CAPITAL · DEAL OPERATIONS</div><h1>Deal pipeline</h1><p>Screen inbound deals, investigate exceptions, and prepare an investment decision.</p></div>' +
    '<div class="actions">' + button('Open featured deal','featured','light') + '<a class="button light action-link" href="./walkthrough.html">Demo walkthrough</a></div></section><div class="cards">' +
    [[deals.length,'Fictional deals'],[count('Pursue'),'Pursue'],[count('Review'),'Partner review'],[count('Pass'),'Pass']].map(([value,label]) => '<div class="card"><strong>' + value + '</strong><span>' + label + '</span></div>').join('') +
    '</div><section class="panel flush"><div class="panel-head"><div><h2>Decision queue</h2></div>' +
    '<div class="actions"><a class="button action-link" href="./board.html">Board view</a><a class="button action-link" href="./intake.html">Add fictional deal</a>' + button('Export this view','queue-csv') + '</div></div><div class="queue-controls">' +
    '<label>Search<input id="search" maxlength="100" placeholder="Company, sector, or region" value="' + safe(query) + '"></label>' +
    '<label>Recommendation<select id="filter">' + options(['All','Pursue','Review','Pass'],filter) + '</select></label>' +
    '<label>Sector<select id="queue-sector">' + options(['All', ...sectors],sectorFilter) + '</select></label>' +
    '<label>Deal lead<select id="queue-lead">' + options(['All', ...dealLeads],leadFilter) + '</select></label>' +
    '<label>Stage<select id="queue-stage">' + options(['All', ...stages],stageFilter) + '</select></label>' +
    '<label>Sort by<select id="queue-sort">' + options(queueSortOrders,queueSort) + '</select></label>' +
    '</div><div id="queue-rows">' + queueRows() + '</div></section>';
}
function filteredQueue() {
  const search = query.trim().toLowerCase();
  const rows = deals.filter(deal =>
    (sectorFilter === 'All' || deal.sector === sectorFilter) &&
    (leadFilter === 'All' || dealLead(deal) === leadFilter) &&
    (stageFilter === 'All' || stages[state.work[deal.id]?.progress || 0] === stageFilter) &&
    [deal.name, deal.sector, deal.region].join(' ').toLowerCase().includes(search)
  ).map(deal => ({deal, result:evaluate(deal,state.thesis)})).filter(({result}) =>
    filter === 'All' || filter === result.decision
  );
  if (queueSort === 'Fit highest first') rows.sort((a,b) => b.result.fit - a.result.fit || a.deal.id - b.deal.id);
  if (queueSort === 'EBITDA highest first') rows.sort((a,b) => b.deal.ebitda - a.deal.ebitda || a.deal.id - b.deal.id);
  if (queueSort === 'Company A–Z') rows.sort((a,b) => a.deal.name.localeCompare(b.deal.name));
  return rows;
}
function dealLead(deal) {
  return state.work[deal.id]?.lead ?? 'Unassigned';
}
function queueWorkflow(deal) {
  const record = state.work[deal.id];
  return record?.decision || stages[record?.progress || 0];
}
function queueCsv(rows) {
  const columns = ['Company','Sector','Region','Supported EBITDA ($M)','Fit / 10','Screen','Workflow','Deal lead'];
  const values = rows.map(({deal,result}) =>
    [deal.name,deal.sector,deal.region,deal.ebitda,result.fit,result.decision,queueWorkflow(deal),dealLead(deal)]
  );
  return [columns, ...values].map(row =>
    row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(',')
  ).join('\r\n');
}
function queueRows() {
  const rows = filteredQueue();
  if (!rows.length) return '<p class="queue-empty">No fictional deals match these filters.</p>';
  return '<div class="scroll"><table><thead><tr><th scope="col">Company</th><th scope="col">Sector</th><th scope="col">EBITDA</th><th scope="col">Fit / 10</th><th scope="col">Screen</th><th scope="col">Workflow</th><th scope="col">Deal lead</th></tr></thead><tbody>' +
    rows.map(({deal,result}) => '<tr><td><button class="deal-link" data-deal="' + deal.id + '">' + safe(deal.name) + '</button></td><td>' + deal.sector + '</td><td>' + money(deal.ebitda) + '</td><td>' + result.fit.toFixed(1) + '</td><td>' + pill(result.decision) + '</td><td>' + queueWorkflow(deal) + '</td><td>' + safe(dealLead(deal)) + '</td></tr>').join('') +
    '</tbody></table></div><div class="footer">' + rows.length + ' of ' + deals.length + ' fictional deals</div>';
}
const evidenceTypes = ['CIM','Financial schedule','Customer schedule','Channel interviews'];
function evidenceLibrary() {
  const keyword = (params.get('q') || '').trim().slice(0,100);
  const type = evidenceTypes.includes(params.get('type')) ? params.get('type') : 'All';
  const search = keyword.toLowerCase();
  const matches = deals.flatMap(deal => sources(deal).map((excerpt,index) => ({deal,excerpt,index})))
    .filter(({deal,excerpt,index}) => (type === 'All' || type === evidenceTypes[index]) &&
      [deal.name,deal.sector,sourceTitles[index],excerpt].some(value => value.toLowerCase().includes(search)));
  const size = 16;
  const lastPage = Math.max(1,Math.ceil(matches.length / size));
  const parsed = Number(params.get('page'));
  const selectedPage = Number.isInteger(parsed) ? Math.max(1,Math.min(parsed,lastPage)) : 1;
  const visible = matches.slice((selectedPage - 1) * size, selectedPage * size);
  const go = (label, direction) => {
    const query = new URLSearchParams({q:keyword,type,page:selectedPage + direction});
    return '<a class="button action-link" href="./evidence.html?' + safe(query.toString()) + '">' + label + '</a>';
  };
  return '<h1>Evidence library</h1><form class="panel" method="get" action="./evidence.html"><h2>Search fictional sources</h2>' +
    '<div class="fields"><label>Keywords<input name="q" maxlength="100" value="' + safe(keyword) + '"></label>' +
    '<label>Source type<select name="type">' + options(['All',...evidenceTypes],type) + '</select></label></div>' +
    '<button class="button primary">Search sources</button></form><section class="panel"><h2>Source excerpts</h2>' +
    '<p class="muted">' + matches.length + ' sources found' + (visible.length ? ' · Page ' + selectedPage + ' of ' + lastPage : '') + '</p>' +
    visible.map(({deal,index}) => '<div class="finding issue-row"><div><h3>' + safe(deal.name) + '</h3><p class="muted">' +
      safe(deal.sector) + ' · ' + sourceTitles[index] + '</p></div><div class="actions">' +
      '<button class="button" data-source="' + index + '" data-source-deal="' + deal.id + '">Open source</button>' +
      '<a class="button action-link" href="' + dealUrl(deal.id,0) + '">View screening</a></div></div>').join('') +
    '<div class="actions vote-actions">' + (selectedPage > 1 ? go('Previous page',-1) : '') +
    (selectedPage < lastPage ? go('Next page',1) : '') + '</div></section>';
}
function comparisonIds() {
  if (!params.has('deal')) {
    return ['Review','Pursue','Pass'].map(status =>
      deals.find(deal => evaluate(deal,state.thesis).decision === status)?.id
    ).filter(Boolean);
  }
  const valid = params.getAll('deal').map(Number).filter(id => deals.some(deal => deal.id === id));
  return [...new Set(valid)].slice(0,3);
}
function comparisonPage() {
  const ids = comparisonIds();
  const compared = ids.map(id => {
    const deal = deals.find(candidate => candidate.id === id);
    return {deal,result:evaluate(deal,state.thesis)};
  });
  const companies = [...deals].sort((a,b) => a.name.localeCompare(b.name));
  const picker = ['First deal','Second deal','Third deal'].map((label,index) =>
    '<label>' + label + '<select name="deal"><option value="">Select a deal</option>' +
    companies.map(deal => '<option value="' + deal.id + '"' + (ids[index] === deal.id ? ' selected' : '') + '>' +
      safe(deal.name) + '</option>').join('') + '</select></label>'
  ).join('');
  return '<h1>Compare deals</h1><form class="panel" method="get" action="./compare.html"><h2>Shortlist</h2>' +
    '<p class="muted">Select up to three fictional companies to compare against the current investment thesis.</p>' +
    '<div class="fields">' + picker + '</div><div class="actions"><button class="button primary">Compare deals</button>' +
    '<a class="button action-link" href="./compare.html">Reset selections</a></div></form>' +
    (compared.length ? comparisonTable(compared) : '<p class="panel muted">Choose at least one deal to see its metrics and screening evidence.</p>');
}
function comparisonTable(compared) {
  const metrics = [
    ['Screening outcome', ({result}) => pill(result.decision)],
    ['Buy-box fit / 10', ({result}) => result.fit.toFixed(1)],
    ['Sector and region', ({deal}) => safe(deal.sector + ' · ' + deal.region)],
    ['FY25 revenue', ({deal}) => money(deal.revenue)],
    ['Supported EBITDA', ({deal}) => money(deal.ebitda)],
    ['Claimed / checked growth', ({deal}) => deal.growth + '% / ' + deal.checkedGrowth + '%'],
    ['Largest customer', ({deal}) => deal.concentration + '%'],
    ['Screening exceptions', ({result}) => result.flags.length ?
      '<ul>' + result.flags.map(flag => '<li>' + safe(flag.title) + '</li>').join('') + '</ul>' : 'None flagged'],
    ['Open diligence issues', ({deal}) => openIssueLines(state.work[deal.id] ?? {}).length],
    ['Workflow', ({deal}) => safe(queueWorkflow(deal))]
  ];
  return '<section class="panel flush"><div class="panel-head"><h2>Shortlist comparison</h2></div>' +
    '<div class="scroll"><table class="compare-table"><thead><tr><th scope="col">Metric</th>' +
    compared.map(({deal}) => '<th scope="col"><a class="deal-link" href="' + dealUrl(deal.id,0) + '">' +
      safe(deal.name) + '</a></th>').join('') + '</tr></thead><tbody>' +
    metrics.map(([label,format]) => '<tr><th scope="row">' + label + '</th>' +
      compared.map(item => '<td>' + format(item) + '</td>').join('') + '</tr>').join('') +
    '</tbody></table></div></section>';
}
function backtestThesis(thesis) {
  const results = { Pursue:{pursued:0,notPursued:0}, Review:{pursued:0,notPursued:0}, Pass:{pursued:0,notPursued:0} };
  for (const deal of history) {
    const {decision} = evaluate(deal,thesis);
    results[decision][deal.pursue ? 'pursued' : 'notPursued']++;
  }
  return results;
}
function backtestPanel(thesis) {
  const results = backtestThesis(thesis);
  const previouslyPursued = history.filter(deal => deal.pursue).length;
  const surfaced = results.Pursue.pursued + results.Review.pursued;
  return '<section class="panel flush"><div class="panel-head"><div><h2>Historical screen backtest</h2>' +
    '<p class="muted">Current criteria applied to ' + history.length + ' fictional prior decisions. Each case is excluded from its own similarity score.</p></div></div>' +
    '<div class="scroll"><table><thead><tr><th scope="col">Current recommendation</th><th scope="col">Historically pursued</th><th scope="col">Historically not pursued</th><th scope="col">Total</th></tr></thead><tbody>' +
    Object.entries(results).map(([outcome,counts]) => '<tr><th scope="row">' + pill(outcome) + '</th><td>' + counts.pursued +
      '</td><td>' + counts.notPursued + '</td><td>' + (counts.pursued + counts.notPursued) + '</td></tr>').join('') +
    '</tbody></table></div><div class="footer">The current screen surfaces ' + surfaced + ' of ' + previouslyPursued +
    ' previously pursued deals as Pursue or Review. ' + results.Pass.pursued + ' would be passed.</div></section>';
}
function preferenceDrift(thesis) {
  const pursued = history.filter(deal => deal.pursue);
  const bySector = sectors.map(sector => {
    const seen = history.filter(deal => deal.sector === sector);
    return {sector, seen:seen.length, pursued:seen.filter(deal => deal.pursue).length};
  });
  return {
    pursued,bySector,
    outsideEbitda:pursued.filter(deal => deal.ebitda < thesis.min || deal.ebitda > thesis.max).length,
    aboveConcentration:pursued.filter(deal => deal.concentration > thesis.cap).length,
    outsideSector:pursued.filter(deal => thesis.sector !== 'Any' && deal.sector !== thesis.sector).length,
    outsideRegion:pursued.filter(deal => thesis.region !== 'Any' && deal.region !== thesis.region).length
  };
}
function preferencePanel(thesis) {
  const drift = preferenceDrift(thesis);
  const range = (key, format) => {
    if (!drift.pursued.length) return '—';
    const values = drift.pursued.map(deal => deal[key]);
    return format(Math.min(...values)) + ' to ' + format(Math.max(...values));
  };
  const deviations = [
    ['Outside EBITDA range',drift.outsideEbitda],
    ['Above concentration cap',drift.aboveConcentration],
    ['Outside selected sector',drift.outsideSector],
    ['Outside selected region',drift.outsideRegion]
  ];
  return '<section class="panel flush"><div class="panel-head"><div><h2>Stated buy box versus historical pursuit</h2>' +
    '<p class="muted">Overlapping deviations among ' + drift.pursued.length + ' previously pursued fictional deals.</p></div></div>' +
    '<div class="queue-controls">' +
    [['Observed EBITDA range',range('ebitda',money)],['Observed largest-customer range',range('concentration',value => value + '%')],...deviations]
      .map(([label,value]) => '<div class="card"><strong>' + value + '</strong><span>' + label + '</span></div>').join('') +
    '</div><div class="scroll"><table><thead><tr><th scope="col">Sector</th><th scope="col">Prior deals</th><th scope="col">Pursued</th><th scope="col">Historical pursuit rate</th></tr></thead><tbody>' +
    drift.bySector.map(({sector,seen,pursued}) => '<tr><th scope="row">' + sector + '</th><td>' + seen +
      '</td><td>' + pursued + '</td><td>' + (seen ? (100 * pursued / seen).toFixed(1) + '%' : '—') + '</td></tr>').join('') +
    '</tbody></table></div></section>';
}
function thesisPage() {
  const thesis = state.thesis;
  const pursued = history.filter(deal => deal.pursue).sort((a,b) => a.ebitda - b.ebitda);
  const middle = Math.floor(pursued.length / 2);
  const median = (pursued[Math.floor((pursued.length - 1) / 2)].ebitda + pursued[middle].ebitda) / 2;
  return '<h1>Investment thesis</h1><div class="split"><form class="panel" id="thesis-form"><h2>Stated buy box</h2><p class="muted">Changes immediately rescreen the pipeline.</p><div class="fields">' +
    input('Minimum EBITDA ($M)','min',thesis.min,0,100) + input('Maximum EBITDA ($M)','max',thesis.max,0,100) +
    input('Maximum concentration (%)','cap',thesis.cap,0,100) +
    '<label>Sector<select name="sector">' + options(['Any', ...sectors],thesis.sector) + '</select></label><label>Region<select name="region">' + options(['Any', ...regions],thesis.region) +
    '</select></label></div><button class="button primary">Save and rescreen</button></form><section class="panel"><h2>Learned preferences</h2><p>The local similarity model uses 80 fictional historical decisions. Each deal is compared with its seven closest historical matches.</p><div class="metrics"><div><strong>' + pursued.length + '/' + history.length + '</strong><span>Historically pursued</span></div><div><strong>' + money(median) + '</strong><span>Median pursued EBITDA</span></div></div><p class="muted">Actual pursuit patterns contribute to fit. The stated concentration cap independently triggers exceptions.</p></section></div>' + preferencePanel(thesis) + backtestPanel(thesis);
}
function showScreeningStatus() {
  const status = document.querySelector('#screening-status');
  if (!screeningStatus || !status) return;
  status.textContent = screeningStatus.message;
  const form = document.querySelector('#openai-form') ?? document.querySelector('#batch-openai-form');
  form.querySelector('input').disabled = screeningStatus.unavailable;
  form.querySelector('button').disabled = screeningStatus.unavailable;
}
async function checkScreeningStatus() {
  try {
    const response = await fetch('./api/screen/status',{cache:'no-store'});
    if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) {
      screeningStatus = {message:'OpenAI screening is unavailable on this host.',unavailable:true};
    } else {
      const status = await response.json();
      screeningStatus = status.ready ?
        {message:'OpenAI screening is configured for ' + status.model + '.', unavailable:false} :
        {message:'OpenAI screening needs server configuration.',unavailable:true};
    }
  } catch {
    screeningStatus = {message:'Could not check OpenAI screening. You can still try an assessment.',unavailable:false};
  }
  showScreeningStatus();
}
function assessmentMatchesThesis(assessment, thesis) {
  return Boolean(assessment && Object.keys(defaults).every(key => assessment.thesis[key] === thesis[key]));
}
function linkAssessmentCitations(container,summary) {
  const tokens = summary.matchAll(/\[([^\]\r\n]+)\]/g);
  let offset = 0;
  for (const token of tokens) {
    const cite = token[1].trim().toLowerCase();
    const index = evidenceSourceNames.findIndex((name,position) =>
      name.toLowerCase() === cite || sourceTitles[position].toLowerCase() === cite);
    if (index < 0) continue;
    container.append(summary.slice(offset,token.index));
    const source = document.createElement('button');
    source.type = 'button';
    source.className = 'source-link assessment-citation';
    source.dataset.source = String(index);
    source.textContent = token[0];
    container.append(source);
    offset = token.index + token[0].length;
  }
  container.append(summary.slice(offset));
}
function assessmentMetadata(assessment) {
  return assessment.model + ' · ' + new Date(assessment.at).toLocaleString();
}
function assessmentContents(assessment) {
  const criteria = document.createElement('p');
  criteria.className = 'muted';
  const thesis = assessment.thesis;
  criteria.textContent = 'Buy box used: ' + money(thesis.min) + ' to ' + money(thesis.max) +
    ' EBITDA · ' + thesis.cap + '% concentration cap · ' + thesis.sector + ' sector · ' + thesis.region + ' region';
  const diagnosis = document.createElement('p');
  diagnosis.className = 'memo';
  linkAssessmentCitations(diagnosis,assessment.summary);
  return [criteria,diagnosis];
}
function renderSavedAssessment(record) {
  const target = document.querySelector('#saved-assessment');
  const assessment = record.assessment;
  if (!assessment) {
    target.replaceChildren();
    return;
  }
  const heading = document.createElement('h3');
  heading.textContent = 'Latest saved assessment';
  const metadata = document.createElement('p');
  metadata.className = 'muted';
  metadata.textContent = assessmentMetadata(assessment);
  target.replaceChildren(heading,metadata,...assessmentContents(assessment));
  if (!assessmentMatchesThesis(assessment,state.thesis)) {
    const outdated = document.createElement('p');
    outdated.className = 'callout';
    outdated.textContent = 'The buy box has changed since this assessment. Run a new assessment to include it in the committee brief.';
    heading.after(outdated);
  }
  if (record.assessmentHistory?.length) {
    const historyHeading = document.createElement('h3');
    historyHeading.textContent = 'Earlier assessments';
    target.append(historyHeading);
    for (const previous of record.assessmentHistory) {
      const item = document.createElement('details');
      item.className = 'finding assessment-history';
      const summary = document.createElement('summary');
      summary.textContent = assessmentMetadata(previous);
      item.append(summary,...assessmentContents(previous));
      target.append(item);
    }
  }
}
function memo(deal, result, record) {
  const returns = model(deal,record.terms);
  return [
    'INVESTMENT COMMITTEE BRIEF · FICTIONAL DEMO',
    deal.name + ' | ' + deal.sector + ' | ' + deal.region,
    'Deal lead: ' + (record.lead ?? 'Unassigned'),
    'Screening recommendation: ' + result.decision + ' · Fit ' + result.fit.toFixed(1) + '/10',
    'FY25 revenue: ' + money(deal.revenue) + ' [CIM pp. 12–18]. Supported EBITDA: ' + money(deal.ebitda) + ' [FY25 financial schedule].',
    'Open diligence: ' + (tasks.filter((_,index) => !record.checked.includes(index)).join('; ') || 'Checklist complete. Review underlying evidence before approval.'),
    'Exceptions: ' + (result.flags.map(flag => flag.detail + ' [' + sourceTitles[flag.source] + ']').join(' ') || 'No exceptions under the current buy box.'),
    'Underwriting case: ' + (record.caseName ?? 'Base'),
    ...(returns ? ['Transaction funding: ' + money(returns.price) + ' entry EV and ' + money(returns.fees) +
      ' in fees, funded by ' + money(returns.debt) + ' of debt and ' + money(returns.equity) + ' of sponsor equity.'] : []),
    returns ? 'Illustrative returns: '  + returns.moic.toFixed(2) + 'x MOIC and ' + formatIrr(returns.irr) + ' IRR over ' + record.terms.years + ' years.' : 'Illustrative returns unavailable.',
    ...(assessmentMatchesThesis(record.assessment,state.thesis) ? [
      'Saved OpenAI assessment (' + record.assessment.model + ' · ' + record.assessment.at + '): ' + record.assessment.summary
    ] : []),
    'Tracked open issues: ' + (openIssueLines(record).join(' | ') || 'None recorded.'),
    'Analyst notes: ' + (record.notes || 'None recorded.')
  ].join('\n\n');
}
function committeePage() {
  const statuses = ['All','Pending','Deferred','Approved','Declined'];
  const selected = statuses.includes(params.get('status')) ? params.get('status') : 'All';
  const docket = deals.filter(deal => state.work[deal.id]?.progress >= 3).map(deal => {
    const record = state.work[deal.id];
    return {deal,record,status:record.decision ?? 'Pending',updated:record.decidedAt ?? record.submittedAt ?? ''};
  }).sort((left,right) => right.updated.localeCompare(left.updated) || left.deal.name.localeCompare(right.deal.name));
  const rows = selected === 'All' ? docket : docket.filter(item => item.status === selected);
  const filters = statuses.map(status => {
    const count = status === 'All' ? docket.length : docket.filter(item => item.status === status).length;
    return '<a class="button action-link' + (status === selected ? ' current' : '') + '" href="./committee.html?status=' +
      status + '"' + (status === selected ? ' aria-current="page"' : '') + '>' + status + ' · ' + count + '</a>';
  }).join('');
  return '<h1>Investment committee</h1><section class="panel"><h2>Committee docket</h2><nav class="actions" aria-label="Filter committee status">' +
    filters + '</nav>' + (rows.length ?
      '<div class="scroll vote-actions"><table><thead><tr><th scope="col">Company</th><th scope="col">Screening</th><th scope="col">Deal lead</th>' +
      '<th scope="col">Committee status</th><th scope="col">Last committee activity</th><th scope="col">Packet</th></tr></thead><tbody>' +
      rows.map(({deal,record,status,updated}) => '<tr><td><button class="deal-link" data-committee="' + deal.id + '">' +
        safe(deal.name) + '</button></td><td>' + pill(evaluate(deal,state.thesis).decision) + '</td><td>' + safe(dealLead(deal)) +
        '</td><td>' + pill(status) + '</td><td>' + (updated ? (record.decidedAt ? 'Vote · ' : 'Submitted · ') +
          new Date(updated).toLocaleString() : '—') + '</td><td>' + packetLink(deal) + '</td></tr>').join('') +
      '</tbody></table></div>' : '<p class="muted vote-actions">' +
      (docket.length ? 'No deals match this committee status.' : 'Send a deal from its LBO model to add it to the docket.') + '</p>') +
    '</section>';
}
function dealPage() {
  const record = work(active);
  const result = evaluate(active,state.thesis);
  return '<div class="actions">' + button('Back to ' + (page === 'committee' ? 'committee' : 'pipeline'),'back') + '</div><section class="hero" style="margin-top:14px"><div><div class="kicker">' + active.sector.toUpperCase() + ' · ' + active.region.toUpperCase() + '</div><h1>' + safe(active.name) + '</h1><p>Introduced by ' + active.broker + '</p></div>' + pill(record.decision || result.decision) + '</section><div class="tabs" aria-label="Deal stages">' +
    stages.map((label,index) => '<button class="button ' + (index === step ? 'current' : '') + '" data-step="' + index + '" aria-pressed="' + (index === step) + '"' + (index > record.progress ? ' disabled' : '') + '>' + label + '</button>').join('') +
    '</div>' + [screening,diligence,underwriting,committee,decision][step](active,result,record);
}
function screeningBreakdown(result) {
  return '<details class="finding score-breakdown"><summary>How the fit score is calculated</summary><div class="scroll">' +
    '<table><thead><tr><th scope="col">Factor</th><th scope="col">Points earned</th><th scope="col">Points available</th></tr></thead><tbody>' +
    result.contributions.map(({label,points,max}) => '<tr><th scope="row">' + label + '</th><td>' +
      points.toFixed(1) + '</td><td>' + max.toFixed(1) + '</td></tr>').join('') +
    '</tbody></table></div><p class="muted">Scores below 6 are passed. Scores from 6 to below 7.5, or scores of 7.5 and above with flagged exceptions, go to Review. Other deals are marked Pursue.</p></details>';
}
function dealOwnership(deal) {
  return '<form class="panel" id="deal-lead-form"><h2>Deal ownership</h2><div class="fields">' +
    '<label>Deal lead<select name="lead">' + options(dealLeads,dealLead(deal)) + '</select></label></div>' +
    '<button class="button" type="submit">Save deal lead</button></form>';
}
function reconciliationTable(deal,result) {
  const signed = (delta,format) => (delta > 0 ? '+' : '') + format(delta);
  const cite = (value,index) => '<strong>' + value + '</strong><div>' + src(index,sourceTitles[index]) + '</div>';
  const rows = [
    ['Adjusted EBITDA',cite(money(deal.adjusted),0),cite(money(deal.ebitda),1),
      signed(round(deal.adjusted - deal.ebitda),money),1],
    ['Revenue growth',cite(deal.growth + '%',0),cite(deal.checkedGrowth + '%',3),
      signed(deal.growth - deal.checkedGrowth,value => value + ' pp'),3],
    ['Largest customer',cite(deal.concentration + '%',2),'<strong>' + state.thesis.cap + '% cap</strong><div>Stated buy box</div>',
      signed(round(deal.concentration - state.thesis.cap),value => value + ' pp'),2]
  ];
  const exceptionSources = new Set(result.flags.map(flag => flag.source));
  return '<section class="panel flush"><div class="panel-head"><div><h2>Claims reconciliation</h2>' +
    '<p class="muted">Differences are the reported figure minus the supporting figure or buy-box limit.</p></div></div>' +
    '<div class="scroll"><table class="reconciliation-table"><thead><tr><th scope="col">Metric</th><th scope="col">Reported</th>' +
    '<th scope="col">Supporting figure or limit</th><th scope="col">Difference</th><th scope="col">Screen flag</th></tr></thead><tbody>' +
    rows.map(([label,reported,reference,difference,index]) => '<tr><th scope="row">' + label + '</th><td>' + reported +
      '</td><td>' + reference + '</td><td>' + difference + '</td><td>' + (exceptionSources.has(index) ? pill('Review') : 'No flag') +
      '</td></tr>').join('') + '</tbody></table></div></section>';
}
function screening(deal,result) {
  return '<div class="split"><section class="panel"><h2>Screening recommendation</h2><div class="metrics"><div><strong>' + result.fit.toFixed(1) + '/10</strong><span>Buy-box fit</span></div><div><strong>' + Math.round(result.historical * 100) + '%</strong><span>Historical pursuit signal</span></div><div><strong>' + money(deal.ebitda) + '</strong><span>Supported EBITDA</span></div></div><p>' + (result.fitted ? 'EBITDA fits the stated range.' : 'EBITDA falls outside the stated range.') + ' ' + (result.sector && result.region ? 'Sector and region fit the mandate.' : 'Sector or region falls outside the mandate.') + '</p>' +
    screeningBreakdown(result) + (result.flags.length ? '<h3>Evidence requiring review</h3>' + result.flags.map(flag => '<div class="finding"><h3>' + flag.title + '</h3><p>' + flag.detail + '</p>' + src(flag.source,sourceTitles[flag.source]) + '</div>').join('') : '<p>No exceptions triggered by the current rules.</p>') +
    '<div class="actions" style="margin-top:14px">' + button('Open diligence','advance','primary') + watchButton(deal) + '<a class="button action-link" href="./compare.html?deal=' + deal.id + '">Compare this deal</a></div></section><div>' + dealOwnership(deal) + evidence(deal) + '</div></div>' + reconciliationTable(deal,result);
}
function evidenceText(deal,indexes) {
  const excerpts = sources(deal);
  return [
    'FINFLOW · FICTIONAL DEAL EVIDENCE',
    deal.name + ' · ' + deal.sector + ' · ' + deal.region,
    ...indexes.map(index => sourceTitles[index] + '\n' + excerpts[index]),
    'Synthetic evidence for demonstration use.'
  ].join('\n\n');
}
function evidence(deal) {
  const labels = [['FY25 revenue',money(deal.revenue),0],['Supported EBITDA',money(deal.ebitda),1],['Largest customer',deal.concentration + '%',2],['Channel growth estimate',deal.checkedGrowth + '%',3]];
  return '<section class="panel"><h2>Evidence room</h2>' + labels.map(([label,value,index]) =>
    '<div class="finding"><h3>' + label + ' · ' + value + '</h3>' + src(index,sourceTitles[index]) + '</div>').join('') + '<div class="actions vote-actions">' + button('Download evidence packet','evidence-packet') + '</div></section>';
}
const diligenceOwners = ['Unassigned','Deal team','Finance','Commercial','Legal'];
const issuePriorities = ['High','Medium','Low'];
function diligenceIssues(record) {
  return record.issues ?? [];
}
function openIssueLines(record) {
  return diligenceIssues(record).filter(issue => !issue.resolved).map(issue =>
    '[' + issue.priority + '] ' + issue.title + ' · ' + issue.owner + (issue.dueDate ? ' · Due ' + issue.dueDate : '')
  );
}
function validCalendarDate(value) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}
function issueOverdue(issue, today = new Date()) {
  const date = [today.getFullYear(), today.getMonth() + 1, today.getDate()]
    .map((value,index) => String(value).padStart(index ? 2 : 4,'0')).join('-');
  return Boolean(!issue.resolved && issue.dueDate && issue.dueDate < date);
}
function issueFields(issue = {}) {
  return '<div class="fields"><label>Issue<input name="title" placeholder="Describe a fictional issue" value="' +
    safe(issue.title ?? '') + '" required maxlength="120"></label>' +
    '<label>Owner<select name="owner">' + options(diligenceOwners,issue.owner ?? 'Unassigned') + '</select></label>' +
    '<label>Priority<select name="priority">' + options(issuePriorities,issue.priority ?? 'Medium') + '</select></label>' +
    '<label>Due date<input name="dueDate" type="date" value="' + safe(issue.dueDate ?? '') + '"></label></div>';
}
function diligenceQueuePage() {
  const statuses = ['Open','Overdue','Resolved','All'];
  const allowedOwners = ['All',...diligenceOwners];
  const owner = allowedOwners.includes(params.get('owner')) ? params.get('owner') : 'All';
  const status = statuses.includes(params.get('status')) ? params.get('status') : 'Open';
  const rows = deals.flatMap(deal => {
    const record = state.work[deal.id];
    if (!record || record.decision === 'Declined' || record.closing?.closedAt) return [];
    return diligenceIssues(record).map(issue => ({deal,issue,overdue:issueOverdue(issue)}));
  }).filter(({issue,overdue}) => {
    const matchesStatus = status === 'All' || (status === 'Open' && !issue.resolved) ||
      (status === 'Overdue' && overdue) || (status === 'Resolved' && issue.resolved);
    return matchesStatus && (owner === 'All' || issue.owner === owner);
  }).sort((first,second) => Number(second.overdue) - Number(first.overdue) ||
    (first.issue.dueDate || '9999').localeCompare(second.issue.dueDate || '9999') ||
    issuePriorities.indexOf(first.issue.priority) - issuePriorities.indexOf(second.issue.priority));
  const selectors = '<div class="fields"><label>Owner<select name="owner">' + options(allowedOwners,owner) +
    '</select></label><label>Status<select name="status">' + options(statuses,status) + '</select></label></div>';
  return '<h1>Diligence queue</h1><form class="panel" method="get" action="./diligence-queue.html"><h2>Filter active deals</h2>' +
    selectors + '<button class="button primary">Apply filters</button></form><section class="panel flush">' +
    '<div class="panel-head"><h2>Tracked issues</h2><p class="muted">' + rows.length + (rows.length === 1 ? ' issue' : ' issues') + '</p></div>' +
    (rows.length ? '<div class="scroll"><table><thead><tr><th scope="col">Issue</th><th scope="col">Deal</th><th scope="col">Owner</th>' +
      '<th scope="col">Priority</th><th scope="col">Due</th><th scope="col">Status</th></tr></thead><tbody>' +
      rows.map(({deal,issue,overdue}) => '<tr><td><a class="deal-link" href="' + dealUrl(deal.id,1) + '#issue-' +
        encodeURIComponent(issue.id) + '">' + safe(issue.title) + '</a></td><td>' + safe(deal.name) + '</td><td>' +
        safe(issue.owner) + '</td><td>' + safe(issue.priority) + '</td><td>' + safe(issue.dueDate || '—') + '</td><td>' +
        pill(overdue ? 'Overdue' : issue.resolved ? 'Resolved' : 'Open') + '</td></tr>').join('') + '</tbody></table></div>' :
      '<p class="queue-empty">No diligence issues match these filters.</p>') + '</section>';
}
function issueTracker(record) {
  const issues = diligenceIssues(record);
  const openCount = issues.filter(issue => !issue.resolved).length;
  return '<section class="panel"><h2>Diligence issues</h2><p class="muted">' + openCount + ' open · ' +
    (issues.length - openCount) + ' resolved</p>' +
    issues.map(issue => '<div class="finding" id="issue-' + safe(issue.id) + '"><div class="issue-row"><div><h3>' + safe(issue.title) + '</h3><p class="muted">' +
      safe(issue.owner) + ' · ' + safe(issue.priority) + ' priority · ' + (issue.resolved ? 'Resolved' : 'Open') +
      (issue.dueDate ? ' · Due <time datetime="' + safe(issue.dueDate) + '">' + safe(issue.dueDate) + '</time>' : '') +
      (issueOverdue(issue) ? ' ' + pill('Overdue') : '') +
      '</p></div><button class="button" type="button" data-issue="' + safe(issue.id) + '">' +
      (issue.resolved ? 'Reopen' : 'Resolve') + '</button></div>' +
      '<details class="issue-edit"><summary>Edit issue</summary><form data-edit-issue="' + safe(issue.id) + '">' +
      issueFields(issue) + '<button class="button" type="submit">Save issue</button></form></details></div>').join('') +
    '<form id="issue-form">' + issueFields() + '<button class="button primary" type="submit">Add issue</button></form></section>';
}
function diligenceEmail(deal,record) {
  const openTasks = tasks.filter((_,index) => !record.checked.includes(index));
  const openIssues = diligenceIssues(record).filter(issue => !issue.resolved)
    .sort((a,b) => issuePriorities.indexOf(a.priority) - issuePriorities.indexOf(b.priority))
    .map(issue => issue.title);
  const requests = [...new Set([...openTasks,...openIssues])];
  if (!requests.length) return '';
  return [
    'Subject: Demo diligence follow-up for ' + deal.name,
    '',
    'Hi ' + deal.broker + ' team,',
    '',
    'Thank you for sharing the fictional materials for ' + deal.name + '. Could you help us close the following items before our next investment committee discussion?',
    '',
    ...requests.map((request,index) => (index + 1) + '. ' + request),
    '',
    'Please point us to any existing supporting excerpts and let us know if any items are still pending.',
    '',
    'Thanks,',
    'Alder Capital deal team',
    '',
    'Fictional FinFlow demo draft. Use synthetic material only.'
  ].join('\n');
}
function diligenceEmailPanel(deal,record) {
  const draft = diligenceEmail(deal,record);
  return '<section class="panel" id="broker-draft"><h2>Broker follow-up draft</h2>' +
    (draft ? '<label for="diligence-email">Email draft</label><textarea class="draft-text" id="diligence-email" rows="10" readonly>' +
      safe(draft) + '</textarea><div class="actions vote-actions">' + button('Copy email draft','copy-request') +
      button('Download email draft','request') + '</div>' : '<p class="muted">There are no outstanding requests to include.</p>') +
    '</section>';
}
function diligence(deal,result,record) {
  return '<div class="split"><section class="panel"><h2>Diligence checklist</h2>' +
    tasks.map((task,index) => '<label class="task"><input type="checkbox" data-task="' + index + '"' + (record.checked.includes(index) ? ' checked' : '') + '> ' + task + '</label>').join('') +
    '<label for="notes">Analyst notes</label><textarea id="notes" rows="3" placeholder="Record fictional findings">' + safe(record.notes) +
    '</textarea><div class="actions" style="margin-top:12px">' + button('Open LBO model','advance','primary') + '</div></section>' + evidence(deal) + '</div>' + reconciliationTable(deal,result) + issueTracker(record) + diligenceEmailPanel(deal,record);
}
function formatIrr(value) {
  return value === null ? 'N/M' : value.toFixed(1) + '%';
}
function returnSensitivity(deal, terms) {
  const growthRates = [-6, -3, 0, 3, 6].map(offset => Math.min(100, Math.max(-50, round(terms.growth + offset))));
  const exitMultiples = [-2, -1, 0, 1, 2].map(offset => Math.min(30, Math.max(1, round(terms.exit + offset))));
  const exits = [...new Set(exitMultiples)];
  return {
    exits,
    rows: [...new Set(growthRates)].map(growth => ({
      growth,
      returns: exits.map(exit => model(deal, {...terms, growth, exit}))
    }))
  };
}
function sensitivityTable(deal, terms) {
  const { exits, rows } = returnSensitivity(deal, terms);
  return '<section class="panel flush"><div class="panel-head"><div><h2>Return sensitivity</h2>' +
    '<p class="muted">Sponsor IRR across EBITDA growth rates and exit multiples. The highlighted cell uses your saved assumptions.</p></div>' +
    button('Export sensitivity CSV', 'sensitivity-csv') + '</div><div class="scroll"><table><thead><tr><th scope="col">Annual EBITDA growth</th>' +
    exits.map(exit => '<th scope="col">' + exit.toFixed(1) + 'x exit</th>').join('') + '</tr></thead><tbody>' +
    rows.map(row => '<tr><th scope="row">' + row.growth.toFixed(1) + '%</th>' +
      row.returns.map((result, index) => {
        const base = row.growth === terms.growth && exits[index] === terms.exit;
        return '<td' + (base ? ' class="base-return"' : '') + '>' + formatIrr(result.irr) + (base ? ' <small>Base</small>' : '') + '</td>';
      }).join('') + '</tr>').join('') + '</tbody></table></div></section>';
}
const caseNames = ['Base','Downside','Upside'];
function caseTerms(record,name) {
  if (record.cases?.[name]) return record.cases[name];
  const base = record.cases?.Base ?? record.terms;
  if (name === 'Base') return base;
  const direction = name === 'Downside' ? -1 : 1;
  return {...base, growth:round(Math.max(-50, Math.min(100, base.growth + 5 * direction))),
    exit:round(Math.max(1, Math.min(30, base.exit + direction)))};
}
function caseComparison(deal,record) {
  return '<section class="panel flush"><div class="panel-head"><div><h2>Underwriting cases</h2>' +
    '<p class="muted">Save assumption changes before switching cases. Unsaved Downside and Upside cases use the Base case with growth shifted by 5 points and the exit multiple by 1x.</p></div>' +
    '<label>Active case<select id="lbo-case">' + options(caseNames,record.caseName ?? 'Base') + '</select></label></div>' +
    '<div class="scroll"><table><thead><tr><th scope="col">Case</th><th scope="col">EBITDA growth</th><th scope="col">Exit multiple</th><th scope="col">Sponsor MOIC</th><th scope="col">Sponsor IRR</th></tr></thead><tbody>' +
    caseNames.map(name => {
      const terms = caseTerms(record,name);
      const returns = model(deal,terms);
      return '<tr' + (name === (record.caseName ?? 'Base') ? ' class="base-return"' : '') + '><th scope="row">' +
        name + '</th><td>' + terms.growth.toFixed(1) + '%</td><td>' + terms.exit.toFixed(1) + 'x</td><td>' +
        returns.moic.toFixed(2) + 'x</td><td>' + formatIrr(returns.irr) + '</td></tr>';
    }).join('') + '</tbody></table></div></section>';
}
function fundingSchedule(returns) {
  const funding = [['Opening debt',returns.debt],['Sponsor equity',returns.equity],['Total funding',returns.totalUses]];
  const spending = [['Purchase enterprise value',returns.price],['Transaction fees',returns.fees],['Total uses',returns.totalUses]];
  const renderRows = rows => rows.map(([label,value]) =>
    '<tr><th scope="row">' + label + '</th><td>' + money(value) + '</td></tr>'
  ).join('');
  return '<section class="panel"><h2>Sources and Uses</h2><div class="split">' +
    '<div class="scroll"><table><thead><tr><th scope="col">Sources</th><th scope="col">Amount</th></tr></thead><tbody>' +
    renderRows(funding) + '</tbody></table></div>' +
    '<div class="scroll"><table><thead><tr><th scope="col">Uses</th><th scope="col">Amount</th></tr></thead><tbody>' +
    renderRows(spending) + '</tbody></table></div></div></section>';
}
function targetReturnPanel(record,returns) {
  const target = record.targetIrr ?? 20;
  const required = targetExitMultiple(returns,target);
  const selectable = Math.max(1,Math.ceil((required.multiple - 1e-10) * 10) / 10);
  return '<form class="panel" id="target-return-form"><h2>Target return</h2>' +
    '<p class="muted">Holds the saved operating and financing assumptions fixed. The exit multiple is rounded up to the next selectable tenth.</p>' +
    '<div class="actions">' + input('Target sponsor IRR (%)','targetIrr',target,0,100) +
    '<button class="button">Update target</button></div><div class="metrics"><div><strong>' +
    selectable.toFixed(1) + 'x</strong><span>Minimum exit multiple</span></div><div><strong>' +
    money(required.enterpriseValue) + '</strong><span>Unrounded exit EV required</span></div></div>' +
    (selectable > 30 ? '<p class="callout">The target requires an exit multiple above this model’s 30x limit.</p>' : '') + '</form>';
}
function underwriting(deal,result,record) {
  const terms = record.terms;
  const returns = model(deal,terms);
  return caseComparison(deal,record) + '<form class="panel" id="lbo-form"><h2>Leveraged buyout assumptions</h2><p class="muted">Cash after interest repays debt first. The company retains surplus cash and the sponsor covers unfunded shortfalls. IRR is N/M if net exit proceeds are nonpositive.</p><div class="fields">' +
    input('Entry multiple (x)','entry',terms.entry,1,30) + input('Exit multiple (x)','exit',terms.exit,1,30) +
    input('Opening leverage (x)','leverage',terms.leverage,0,20) + input('Annual EBITDA growth (%)','growth',terms.growth,-50,100) +
    input('Debt interest rate (%)','interest',terms.interest,0,50) + input('Cash conversion (%)','cash',terms.cash,0,100) +
    input('Transaction fees (% of entry EV)','fees',terms.fees ?? 0,0,10) + input('Holding period (years)','years',terms.years,1,10,'1') + '</div><div class="actions"><button class="button">Recalculate</button><button class="button primary" name="advance" value="committee">Send to committee</button></div></form>' +
    (returns ? fundingSchedule(returns) + '<section class="panel flush"><div class="panel-head"><h2>Illustrative returns</h2><div class="actions">' + button('Export model CSV','csv') + '</div><div class="metrics"><div><strong>' + money(returns.price) + '</strong><span>Entry EV</span></div><div><strong>' + money(returns.equity) + '</strong><span>Entry sponsor equity</span></div><div><strong>' + money(returns.sponsorFunding) + '</strong><span>Additional sponsor funding</span></div><div><strong>' + returns.moic.toFixed(2) + 'x</strong><span>MOIC</span></div><div><strong>' + formatIrr(returns.irr) + '</strong><span>IRR</span></div></div></div><div class="scroll"><table><thead><tr><th>Year</th><th>EBITDA</th><th>Interest</th><th>Cash after interest</th><th>Debt repayment</th><th>Sponsor funding</th><th>Closing debt</th><th>Closing cash</th></tr></thead><tbody>' +
    returns.years.map(year => '<tr><td>' + year.year + '</td><td>' + money(year.ebitda) + '</td><td>' + money(year.interest) + '</td><td>' + money(year.cash) + '</td><td>' + money(year.repayment) + '</td><td>' + money(year.sponsorFunding) + '</td><td>' + money(year.debt) + '</td><td>' + money(year.cashBalance) + '</td></tr>').join('') + '</tbody></table></div></section>' + targetReturnPanel(record,returns) + sensitivityTable(deal, terms) : '');
}
function recordActivity(message, dealId, url) {
  const event = {message,dealId,url,at:new Date().toISOString()};
  state.activity = [event,...(state.activity ?? [])].slice(0,100);
}
function activityPage() {
  const events = state.activity ?? [];
  const involved = deals.filter(deal => events.some(event => event.dealId === deal.id));
  const selection = params.get('deal') ?? '';
  const filtered = selection ? events.filter(event => String(event.dealId) === selection) : events;
  return '<h1>Activity</h1><form class="panel" method="get" action="./activity.html"><h2>Filter events</h2>' +
    '<div class="fields"><label>Deal<select name="deal"><option value="">All activity</option>' +
    involved.map(deal => '<option value="' + deal.id + '"' + (String(deal.id) === selection ? ' selected' : '') + '>' +
      safe(deal.name) + '</option>').join('') + '</select></label></div><button class="button">Apply filter</button></form>' +
    '<section class="panel"><h2>Recent workspace activity</h2><p class="muted">The latest 100 events are retained in this browser.</p>' +
    (filtered.length ? '<ol class="activity-list">' + filtered.map(event => {
      const deal = deals.find(item => item.id === event.dealId);
      return '<li class="finding issue-row"><div><h3>' + safe(event.message) + '</h3><p class="muted">' +
        safe(deal?.name ?? 'Workspace') + ' · <time datetime="' + safe(event.at) + '">' +
        new Date(event.at).toLocaleString() + '</time></p></div><a class="button action-link" href="' +
        safe(event.url) + '">View details</a></li>';
    }).join('') + '</ol>' : '<p class="muted">No activity has been recorded for this view.</p>') +
    '</section>';
}
function portfolioUrl(id) {
  return './portfolio.html?deal=' + id;
}
function portfolioDeal() {
  return deals.find(deal => String(deal.id) === params.get('deal') && state.work[deal.id]?.closing?.closedAt);
}
function portfolioQuarters(record) {
  return Object.entries(record.portfolio ?? {}).sort(([left],[right]) => right.localeCompare(left));
}
function portfolioWorkspace() {
  const selected = portfolioDeal();
  if (selected) return portfolioCompany(selected);
  const companies = deals.filter(deal => state.work[deal.id]?.closing?.closedAt);
  return '<h1>Portfolio</h1><section class="panel"><h2>Closed fictional deals</h2>' +
    (companies.length ? '<div class="scroll"><table><thead><tr><th scope="col">Company</th><th scope="col">Sector</th><th scope="col">Latest quarter</th><th scope="col">EBITDA vs. budget</th><th scope="col">Status</th></tr></thead><tbody>' +
      companies.map(deal => {
        const [period, latest] = portfolioQuarters(state.work[deal.id])[0] ?? [];
        return '<tr><td><a class="deal-link" href="' + portfolioUrl(deal.id) + '">' + safe(deal.name) + '</a></td><td>' +
          safe(deal.sector) + '</td><td>' + (period ?? 'No reports') + '</td><td>' +
          (latest ? performanceVariance(latest.ebitda,latest.ebitdaBudget) : '—') + '</td><td>' + pill(state.work[deal.id].exit ? 'Exited' : 'Holding') + '</td></tr>';
      }).join('') + '</tbody></table></div>' :
      '<p class="muted">Companies appear here after a fictional closing is recorded.</p><a class="button action-link" href="./closing.html">View closing workspace</a>') +
    '</section>';
}
function performanceVariance(actual,budget) {
  const cents = Math.round((actual - budget) * 100);
  const signed = cents === 0 ? '' : cents > 0 ? '+' : '−';
  return signed + '$' + (Math.abs(cents) / 100).toFixed(2) + 'M';
}
function portfolioTrend(entries,title,field,budgetField) {
  const recent = entries.slice(0,8).reverse();
  const values = recent.flatMap(([,row]) => [row[field],row[budgetField]]);
  const low = Math.min(0,...values);
  const high = Math.max(0,...values);
  const span = high - low || 1;
  const zero = (-low / span) * 100;
  const bar = (label,value,kind) => {
    const left = (Math.min(0,value) - low) / span * 100;
    const width = Math.abs(value) / span * 100;
    return '<div class="trend-value"><span>' + label + '</span><span class="trend-track" aria-hidden="true" style="--zero:' +
      zero + '%"><span class="' + kind + '" style="left:' + left + '%;width:' + width +
      '%"></span></span><strong>' + money(value) + '</strong></div>';
  };
  return '<section class="panel"><h2>' + title + '</h2><p class="muted">Actual and budget for up to eight recent quarters.</p>' +
    recent.map(([period,row]) => '<div class="finding"><h3>' + safe(period) + '</h3>' +
      bar('Actual',row[field],'trend-actual') + bar('Budget',row[budgetField],'trend-budget') + '</div>').join('') + '</section>';
}
function portfolioCsv(entries) {
  return [
    ['Quarter','Revenue actual ($M)','Revenue budget ($M)','Revenue variance ($M)','EBITDA actual ($M)','EBITDA budget ($M)','EBITDA variance ($M)'],
    ...entries.map(([period,row]) => [period,row.revenue,row.revenueBudget,(row.revenue-row.revenueBudget).toFixed(2),
      row.ebitda,row.ebitdaBudget,(row.ebitda-row.ebitdaBudget).toFixed(2)])
  ].map(row => row.join(',')).join('\r\n');
}
function portfolioExit(record) {
  const approved = decisionHistory(record).at(-1)?.underwriting;
  const exit = record.exit;
  if (exit) {
    const values = [
      ['Exit enterprise value',money(exit.enterpriseValue)],['Net debt at exit',money(exit.netDebt)],
      ['Exit fees',money(exit.fees)],['Net sponsor proceeds',money(exit.proceeds)],['Total invested capital',money(exit.invested)],
      ['Realized MOIC',exit.moic.toFixed(2) + 'x']
    ];
    if (approved) values.push(['Modeled MOIC at approval',approved.moic.toFixed(2) + 'x']);
    return '<section class="panel"><h2>Fictional exit record</h2><p>' + pill('Exited') + ' · ' + safe(exit.exitDate) +
      '</p><div class="metrics">' + values.map(([label,value]) => '<div><strong>' + value + '</strong><span>' + label +
      '</span></div>').join('') + '</div><p class="muted">Realized MOIC compares net exit proceeds with total sponsor capital invested. The demo assumes no interim distributions.</p></section>';
  }
  const eligibleDate = record.closing.closedAt.slice(0,10);
  return '<form class="panel" id="portfolio-exit"><h2>Record a fictional exit</h2><p class="muted">Enter the exit proceeds bridge and any additional invested sponsor capital. This creates a final exit record.</p>' +
    '<div class="fields"><label>Exit date<input name="exitDate" type="date" min="' + safe(eligibleDate) + '" required></label>' +
    (approved ? '<div><strong>' + money(approved.equity) + '</strong><p class="muted">Entry sponsor equity from the approved underwriting case</p></div>' :
      input('Entry sponsor equity ($M)','entryEquity','',0.01,10000,'0.01')) +
    input('Additional sponsor capital ($M)','followOn',0,0,10000,'0.01') +
    input('Exit enterprise value ($M)','enterpriseValue','',0,10000,'0.01') +
    input('Net debt at exit ($M)','netDebt',0,-10000,10000,'0.01') +
    input('Exit fees ($M)','fees',0,0,10000,'0.01') +
    '</div><button class="button primary" type="submit">Record fictional exit</button></form>';
}
function portfolioCompany(deal) {
  const record = state.work[deal.id];
  const entries = portfolioQuarters(record);
  const trends = entries.length ? '<div class="desk-grid">' +
    portfolioTrend(entries,'Revenue trend','revenue','revenueBudget') +
    portfolioTrend(entries,'EBITDA trend','ebitda','ebitdaBudget') + '</div>' : '';
  return '<div class="actions"><a class="button action-link" href="./portfolio.html">Back to portfolio</a>' +
    '<a class="button action-link" href="' + closingUrl(deal.id) + '">View closing handoff</a></div>' +
    '<h1>' + safe(deal.name) + '</h1><section class="panel"><h2>Quarterly performance</h2>' +
    (entries.length ? '<div class="actions">' + button('Export quarterly results','portfolio-csv') + '</div><div class="scroll"><table><thead><tr><th scope="col">Quarter</th><th scope="col">Revenue</th><th scope="col">Revenue vs. budget</th><th scope="col">EBITDA</th><th scope="col">EBITDA vs. budget</th></tr></thead><tbody>' +
      entries.map(([period,row]) => '<tr><th scope="row">' + period + '</th><td>' + money(row.revenue) + '</td><td>' +
        performanceVariance(row.revenue,row.revenueBudget) + '</td><td>' + money(row.ebitda) + '</td><td>' +
        performanceVariance(row.ebitda,row.ebitdaBudget) + '</td></tr>').join('') + '</tbody></table></div>' :
      '<p class="muted">No fictional quarterly results recorded.</p>') + '</section>' + trends +
    '<form class="panel" id="portfolio-quarter"><h2>Record a fictional quarter</h2><p class="muted">Saving an existing quarter updates its figures.</p>' +
    '<div class="fields"><label>Year<input name="year" type="number" min="2000" max="2100" required></label>' +
    '<label>Quarter<select name="quarter" required>' + options(['Q1','Q2','Q3','Q4'],'Q1') + '</select></label>' +
    input('Revenue ($M)','revenue','',0,10000,'0.1') + input('Revenue budget ($M)','revenueBudget','',0,10000,'0.1') +
    input('EBITDA ($M)','ebitda','',-10000,10000,'0.1') + input('EBITDA budget ($M)','ebitdaBudget','',-10000,10000,'0.1') +
    '</div><button type="submit" class="button primary">Save quarter</button></form>' + portfolioExit(record);
}
const closingMilestones = [
  ['documents','Confirm definitive documents and closing deliverables'],
  ['funding','Reconcile financing and the funds flow'],
  ['conditions','Confirm committee conditions and required consents'],
  ['handoff','Prepare the portfolio team handoff']
];
function closingChecklist(record) {
  const conditions = decisionHistory(record).at(-1)?.conditions ?? [];
  return [...closingMilestones,...conditions.map((condition,index) => ['condition-' + index,'Satisfy committee condition · ' + condition])];
}
function closingUrl(id) {
  return './closing.html?deal=' + id;
}
function selectedClosingDeal() {
  return deals.find(deal => String(deal.id) === params.get('deal') && state.work[deal.id]?.decision === 'Approved');
}
function closingWorkspace() {
  const selected = selectedClosingDeal();
  if (selected) return closingDealView(selected);
  const approved = deals.filter(deal => state.work[deal.id]?.decision === 'Approved');
  return '<h1>Closing</h1><section class="panel"><h2>Approved deals</h2>' +
    (approved.length ? '<div class="scroll"><table><thead><tr><th scope="col">Company</th><th scope="col">Sector</th><th scope="col">Status</th><th scope="col">Milestones</th></tr></thead><tbody>' +
      approved.map(deal => {
        const closing = state.work[deal.id].closing;
        return '<tr><td><a class="deal-link" href="' + closingUrl(deal.id) + '">' + safe(deal.name) + '</a></td><td>' + safe(deal.sector) +
          '</td><td>' + pill(closing?.closedAt ? 'Closed' : 'Open') + '</td><td>' + (closing?.checked.length ?? 0) + ' / ' + closingChecklist(state.work[deal.id]).length + '</td></tr>';
      }).join('') + '</tbody></table></div>' :
      '<p class="muted">Deals appear here after committee approval.</p><a class="button action-link" href="./committee.html">View committee docket</a>') +
    '</section>';
}
function closingDealView(deal) {
  const closing = state.work[deal.id].closing ?? {checked:[],notes:''};
  const milestones = closingChecklist(state.work[deal.id]).map(([key,label]) =>
    '<label class="task"><input type="checkbox" name="milestone" value="' + key + '"' +
    (closing.checked.includes(key) ? ' checked' : '') + (closing.closedAt ? ' disabled' : '') + '> ' + safe(label) + '</label>'
  ).join('');
  return '<div class="actions"><a class="button action-link" href="./closing.html">Back to approved deals</a>' +
    '<a class="button action-link" href="./decision.html?deal=' + deal.id + '">View committee decision</a></div>' +
    (closing.closedAt ? '<p><a class="button action-link" href="' + portfolioUrl(deal.id) + '">View portfolio company</a></p>' : '') +
    '<h1>' + safe(deal.name) + '</h1>' + voteUnderwritingPanel(decisionHistory(state.work[deal.id]).at(-1)) +
    '<section class="panel"><h2>Closing checklist</h2>' +
    (closing.closedAt ?
      '<p>' + pill('Closed') + ' · ' + new Date(closing.closedAt).toLocaleString() + '</p>' + milestones +
      '<h3>Portfolio handoff</h3><p class="memo">' + safe(closing.notes || 'No handoff notes recorded.') + '</p>' :
      '<form id="closing-form">' + milestones + '<label for="handoff-notes">Portfolio handoff notes</label>' +
      '<textarea id="handoff-notes" name="notes" rows="4" maxlength="1200" placeholder="Record fictional priorities for the portfolio team">' + safe(closing.notes) +
      '</textarea><div class="actions vote-actions"><button class="button" type="submit">Save checklist</button>' +
      '<button class="button primary" type="submit" name="close" value="yes">Record fictional closing</button></div></form>') +
    '</section>';
}
const committeeOutcomes = ['Approved','Declined','Deferred'];
function snapshotUnderwriting(deal,record) {
  const terms = {...record.terms};
  const returns = model(deal,terms);
  if (!returns) return null;
  const {price,fees,totalUses,debt,equity,exitEquity,sponsorFunding,moic,irr} = returns;
  return {name:record.caseName ?? 'Base',terms,price,fees,totalUses,debt,equity,exitEquity,sponsorFunding,moic,irr};
}
function voteUnderwritingPanel(vote) {
  const data = vote?.underwriting;
  if (!data) return '';
  const cells = [
    ['Entry EV',money(data.price)],
    ['Transaction fees',money(data.fees)],
    ['Opening debt',money(data.debt)],
    ['Entry sponsor equity',money(data.equity)],
    ['Modeled MOIC',data.moic.toFixed(2) + 'x'],
    ['Modeled IRR',formatIrr(data.irr)]
  ];
  return '<section class="panel"><h2>Underwriting at time of vote</h2><p>' + safe(data.name) + ' case · ' +
    data.terms.entry.toFixed(1) + 'x entry · ' + data.terms.exit.toFixed(1) + 'x exit · ' +
    data.terms.years + ' years</p><div class="metrics">' + cells.map(([label,value]) =>
      '<div><strong>' + value + '</strong><span>' + label + '</span></div>').join('') + '</div></section>';
}
function decisionHistory(record) {
  if (record.votes) return record.votes;
  return record.decision ? [{
    outcome:record.decision, at:record.decidedAt, reason:record.decisionReason ?? '', brief:record.decisionBrief
  }] : [];
}
function voteConditions(vote) {
  if (!vote.conditions?.length) return '';
  return '<h3>Closing conditions</h3><ul>' + vote.conditions.map(condition => '<li>' + safe(condition) + '</li>').join('') + '</ul>';
}
function canRecordDecision(record) {
  return !record.decision || record.decision === 'Deferred';
}
function packetLink(deal) {
  return '<a class="button action-link" href="./packet.html?deal=' + deal.id + '">View printable packet</a>';
}
function committeePacket() {
  const deal = deals.find(candidate => String(candidate.id) === params.get('deal'));
  const record = deal && state.work[deal.id];
  if (!record || record.progress < 3) {
    return '<h1>Committee packet</h1><section class="panel"><p>This packet becomes available after a deal is sent to committee.</p>' +
      '<a class="button action-link" href="./committee.html">View committee docket</a></section>';
  }
  const votes = decisionHistory(record);
  const latest = votes.at(-1);
  const brief = latest?.brief ?? memo(deal,evaluate(deal,state.thesis),record);
  const title = latest?.brief ? 'Brief at time of vote' : 'Current investment brief';
  return '<div class="actions packet-controls"><a class="button action-link" href="' +
    dealUrl(deal.id,latest ? 4 : 3,'committee') + '">Back to committee record</a>' +
    button('Print committee packet','print-packet','primary') + '</div>' +
    '<article class="committee-packet"><p class="muted">FinFlow · Fictional committee packet</p><h1>' + safe(deal.name) + '</h1>' +
    '<section class="panel"><h2>' + title + '</h2><p class="memo">' + safe(brief) + '</p></section>' +
    voteUnderwritingPanel(latest) +
    (votes.length ? '<section class="panel"><h2>Committee votes</h2>' +
      votes.slice().reverse().map(vote => '<div class="finding"><h3>' + safe(vote.outcome) + '</h3>' +
        '<p class="muted">' + new Date(vote.at).toLocaleString() + '</p><p class="memo">' +
        safe(vote.reason || 'No reason recorded.') + '</p>' + voteConditions(vote) + '</div>').join('') + '</section>' : '') +
    '<section class="panel"><h2>Fictional source excerpts</h2>' +
      sources(deal).map((excerpt,index) => '<div class="finding"><h3>' + sourceTitles[index] +
        '</h3><p>' + safe(excerpt) + '</p></div>').join('') + '</section></article>';
}
function committee(deal,result,record) {
  const review = canRecordDecision(record) ?
    '<form class="panel" id="committee-vote"><h2>Record a fictional committee vote</h2>' +
    '<div class="fields"><label>Outcome<select name="outcome" required><option value="">Choose an outcome</option>' +
    options(committeeOutcomes,'') + '</select></label></div>' +
    '<label for="vote-reason">Reason</label><textarea id="vote-reason" name="reason" rows="3" required maxlength="600" placeholder="Summarize the reasons or diligence conditions"></textarea>' +
    '<label for="vote-conditions">Closing conditions for an approval</label><textarea id="vote-conditions" name="conditions" rows="3" maxlength="500" placeholder="Optional. Enter one condition per line."></textarea>' +
    '<div class="actions vote-actions"><button class="button primary">Record decision</button></div></form>' :
    '<p class="panel">This deal has a final committee decision. <a href="' + dealUrl(deal.id,4) + '">View decision record</a></p>';
  return '<section class="panel"><h2>Investment committee brief</h2><p class="memo">' + safe(memo(deal,result,record)) +
    '</p><div class="actions">' + button('Download brief','memo') + packetLink(deal) + '</div></section>' + review;
}
function decision(deal,result,record) {
  const votes = decisionHistory(record);
  const current = votes.at(-1);
  const followUp = current.outcome === 'Deferred' ? '<a class="button action-link" href="' +
    dealUrl(deal.id,1) + '">Continue diligence</a><a class="button primary action-link" href="' +
    dealUrl(deal.id,3) + '">Return to committee</a>' : current.outcome === 'Approved' ? '<a class="button primary action-link" href="' + closingUrl(deal.id) + '">Open closing checklist</a>' : '';
  return '<section class="panel"><h2>Decision recorded</h2><p>' + pill(current.outcome) + ' · ' +
    new Date(current.at).toLocaleString() + '</p><p class="memo">' + safe(current.reason || 'No reason recorded.') +
    '</p>' + voteConditions(current) + '<div class="actions">' + followUp + button('Download decision record','decision-export') + packetLink(deal) +
    button('View committee docket','docket') + '</div></section>' + voteUnderwritingPanel(current) +
    (votes.length > 1 ? '<section class="panel"><h2>Prior committee votes</h2>' +
      votes.slice(0,-1).reverse().map(vote => '<details class="finding"><summary>' + vote.outcome + ' · ' +
        new Date(vote.at).toLocaleString() + '</summary><p class="memo">' + safe(vote.reason || 'No reason recorded.') +
        '</p><p class="memo">' + safe(vote.brief || 'No archived brief.') + '</p></details>').join('') + '</section>' : '');
}
function download(filename,data,type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([data],{type}));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function dealUrl(id, destination, origin = page) {
  const query = new URLSearchParams({ deal: id });
  if (origin === 'committee') query.set('from', 'committee');
  return './' + dealPages[destination] + '.html?' + query.toString();
}
function openDeal(id, committeeEntry = false) {
  const destination = committeeEntry ? state.work[id]?.progress ?? 0 : 0;
  location.assign(dealUrl(id, destination, committeeEntry ? 'committee' : 'queue'));
}
function advance() {
  const record = work(active);
  const destination = step + 1;
  if (destination === 3) record.submittedAt ??= new Date().toISOString();
  if (destination < 4 && destination > record.progress) {
    recordActivity('Advanced to ' + stages[destination],active.id,dealUrl(active.id,destination));
  }
  record.progress = Math.max(record.progress,destination);
  persist();
  location.assign(dealUrl(active.id, destination));
}
document.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  const {deal, committee: committeeDeal, source, sourceDeal, downloadSource, step:next, action, intake, watch, issue:issueId} = target.dataset;
  if (deal || committeeDeal) return openDeal(deal || committeeDeal, Boolean(committeeDeal));
  if (source !== undefined || downloadSource !== undefined) {
    const evidenceDeal = sourceDeal ? deals.find(item => String(item.id) === sourceDeal) : active;
    const key = source ?? downloadSource;
    if (!evidenceDeal || !/^\d+$/.test(key)) return;
    const index = Number(key);
    if (index >= sourceTitles.length) return;
    if (downloadSource !== undefined) {
      return download('deal-' + evidenceDeal.id + '-source-' + (index + 1) + '.txt',evidenceText(evidenceDeal,[index]));
    }
    document.querySelector('#source-body').innerHTML = '<h2 id="source-title">' + sourceTitles[index] + '</h2><p><strong>' +
      safe(evidenceDeal.name) + '</strong></p><p>' + safe(sources(evidenceDeal)[index]) +
      '</p><p class="muted">Synthetic evidence included in this demo.</p><p><button class="button" type="button" data-download-source="' +
      index + '" data-source-deal="' + evidenceDeal.id + '">Download excerpt</button></p>';
    sourceDialog.showModal();
    return;
  }
  if (next !== undefined && Number(next) <= work(active).progress) {
    location.assign(dealUrl(active.id, Number(next)));
    return;
  }
  if (intake !== undefined && page === 'intake') {
    const incoming = intakeDeals.find(item => String(item.id) === intake);
    if (!incoming || state.intake?.includes(incoming.id)) return;
    (state.intake ??= []).push(incoming.id);
    recordActivity('Added a bundled fictional deal',incoming.id,dealUrl(incoming.id,0));
    persist();
    return openDeal(incoming.id);
  }
  if (watch !== undefined) {
    if (batchRunning) return toast('Wait for the shortlist assessment to finish.');
    const selected = deals.find(deal => String(deal.id) === watch);
    if (!selected) return;
    const watched = isWatched(selected);
    state.watchlist = watched ? state.watchlist.filter(id => id !== selected.id) : [selected.id,...(state.watchlist ?? [])];
    persist();
    render();
    const selector = watched && page === 'watchlist' ? '[data-watch]' : '[data-watch="' + selected.id + '"]';
    (document.querySelector(selector) ?? document.querySelector('#main-content')).focus();
    return toast(watched ? 'Removed from watchlist.' : 'Added to watchlist.');
  }
  if (action === 'print-packet' && page === 'packet') return window.print();
  if (action === 'open-deal-search') return openGlobalDealSearch();
  if (action === 'featured') return openDeal(1);
  if (action === 'portfolio-csv' && page === 'portfolio') {
    const selected = portfolioDeal();
    if (!selected) return;
    return download('deal-' + selected.id + '-portfolio-quarters.csv',portfolioCsv(portfolioQuarters(state.work[selected.id])),'text/csv');
  }
  if (action === 'desk-digest' && page === 'desk') {
    return download('finflow-deal-desk-digest.txt',deskDigest());
  }
  if (action === 'queue-csv') {
    return download('finflow-deal-pipeline.csv', queueCsv(filteredQueue()), 'text/csv');
  }
  if (action === 'back' || action === 'docket') {
    location.assign(action === 'docket' || page === 'committee' ? './committee.html' : './index.html');
    return;
  }
  if (action === 'advance') return advance();
  if (active && issueId) {
    const issue = diligenceIssues(work(active)).find(item => item.id === issueId);
    if (!issue) return;
    issue.resolved = !issue.resolved;
    recordActivity(issue.resolved ? 'Resolved a diligence issue' : 'Reopened a diligence issue',active.id,dealUrl(active.id,1));
    persist();
    render();
    return;
  }
  if (!active || !action) return;
  const record = work(active);
  if (action === 'evidence-packet') {
    return download('deal-' + active.id + '-evidence.txt',evidenceText(active,sourceTitles.map((_,index) => index)));
  }
  if (action === 'memo' || action === 'decision-export') {
    const currentBrief = memo(active,evaluate(active,state.thesis),record);
    const brief = action === 'decision-export' ? record.decisionBrief ?? currentBrief : currentBrief;
    const conditions = decisionHistory(record).at(-1)?.conditions ?? [];
    const conditionsText = conditions.length ? '\nClosing conditions:\n' + conditions.map(condition => '- ' + condition).join('\n') : '';
    return download('deal-' + active.id + '-committee.txt', brief + (action === 'decision-export' ? '\n\nCommittee decision: ' + record.decision + '\nRecorded: ' + record.decidedAt + '\nReason: ' + (record.decisionReason || 'No reason recorded.') + conditionsText : ''));
  }
  if (action === 'request' || action === 'copy-request') {
    const draft = diligenceEmail(active,record);
    if (!draft) return;
    if (action === 'request') return download('deal-' + active.id + '-diligence-email.txt',draft);
    if (!navigator.clipboard) return toast('Select the draft text to copy it.');
    return navigator.clipboard.writeText(draft).then(
      () => toast('Email draft copied.'),
      () => toast('Select the draft text to copy it.')
    );
  }
  if (action === 'sensitivity-csv') {
    const { exits, rows } = returnSensitivity(active,record.terms);
    const csvRows = [
      ['Annual EBITDA growth (%)', ...exits.map(exit => exit.toFixed(1) + 'x exit IRR (%)')],
      ...rows.map(row => [row.growth, ...row.returns.map(result => result.irr?.toFixed(2) ?? '')])
    ];
    return download('deal-' + active.id + '-' + (record.caseName ?? 'Base').toLowerCase() + '-sensitivity.csv',csvRows.map(row => row.join(',')).join('\n'),'text/csv');
  }
  if (action === 'csv') {
    const returns = model(active,record.terms);
    if (!returns) return;
    const rows = [['Year','EBITDA ($M)','Interest ($M)','Cash after interest ($M)','Debt repayment ($M)','Sponsor funding ($M)','Closing debt ($M)','Closing cash ($M)'], ...returns.years.map(year => [year.year,year.ebitda,year.interest,year.cash,year.repayment,year.sponsorFunding,year.debt,year.cashBalance])];
    return download('deal-' + active.id + '-' + (record.caseName ?? 'Base').toLowerCase() + '-lbo.csv',rows.map(row => row.join(',')).join('\n'),'text/csv');
  }
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openGlobalDealSearch();
    return;
  }
  if (event.target?.id !== 'global-deal-query' || event.isComposing || !['Enter','ArrowDown'].includes(event.key)) return;
  const first = document.querySelector('#global-deal-results a');
  if (!first) return;
  event.preventDefault();
  if (event.key === 'Enter') first.click();
  else first.focus();
});
document.addEventListener('input', event => {
  if (event.target.id === 'global-deal-query') {
    document.querySelector('#global-deal-results').innerHTML = globalDealResults(event.target.value);
  }
  if (event.target.id === 'search') {
    query = event.target.value;
    saveQueueView();
    document.querySelector('#queue-rows').innerHTML = queueRows();
  }
  if (event.target.id === 'notes') {
    work(active).notes = event.target.value;
    persist();
  }
});
document.addEventListener('change', event => {
  const {target} = event;
  if (['filter','queue-sector','queue-lead','queue-stage','queue-sort'].includes(target.id)) {
    if (target.id === 'filter') filter = target.value;
    if (target.id === 'queue-sector') sectorFilter = target.value;
    if (target.id === 'queue-lead') leadFilter = target.value;
    if (target.id === 'queue-stage') stageFilter = target.value;
    if (target.id === 'queue-sort') queueSort = target.value;
    saveQueueView();
    document.querySelector('#queue-rows').innerHTML = queueRows();
  }
  if (target.id === 'lbo-case' && active && step === 2 && caseNames.includes(target.value)) {
    const record = work(active);
    record.cases ??= {Base:{...record.terms}};
    record.caseName = target.value;
    record.terms = {...caseTerms(record,target.value)};
    persist();
    render();
    document.querySelector('#lbo-case').focus();
  }
  if (target.dataset.task !== undefined) {
    const record = work(active);
    const index = Number(target.dataset.task);
    record.checked = target.checked ? [...record.checked, index] : record.checked.filter(task => task !== index);
    persist();
    document.querySelector('#broker-draft').outerHTML = diligenceEmailPanel(active,record);
  }
});
document.addEventListener('submit', event => {
  const {target} = event;
  if (target.id === 'target-return-form') {
    event.preventDefault();
    if (!active || step !== 2) return;
    const field = String(new FormData(target).get('targetIrr') ?? '').trim();
    const targetIrr = Number(field);
    if (!field || !Number.isFinite(targetIrr) || targetIrr < 0 || targetIrr > 100) {
      return toast('Enter an IRR target from 0% to 100%.');
    }
    work(active).targetIrr = round(targetIrr);
    persist();
    render();
    return;
  }
  if (target.id === 'deal-lead-form') {
    event.preventDefault();
    if (!active || step !== 0) return;
    const lead = new FormData(target).get('lead');
    if (!dealLeads.includes(lead)) return;
    work(active).lead = lead;
    recordActivity('Updated the deal lead',active.id,dealUrl(active.id,0));
    persist();
    render();
    return toast('Deal lead saved.');
  }
  if (target.id === 'portfolio-exit') {
    event.preventDefault();
    const deal = portfolioDeal();
    if (!deal) return;
    const record = state.work[deal.id];
    if (record.exit) return;
    const fields = new FormData(target);
    const approved = decisionHistory(record).at(-1)?.underwriting;
    const exitDate = String(fields.get('exitDate') ?? '');
    const numericKeys = ['entryEquity','followOn','enterpriseValue','netDebt','fees'];
    const values = numericKeys.map(key => key === 'entryEquity' && approved ?
      String(approved.equity) : String(fields.get(key) ?? '').trim());
    const figures = values.map(Number);
    if (!exitDate || !validCalendarDate(exitDate) || exitDate < record.closing.closedAt.slice(0,10) ||
        values.some(value => !value) || figures.some((value,index) =>
          !Number.isFinite(value) || value > 10000 || value < (index === 3 ? -10000 : index === 0 ? 0.01 : 0))) {
      return toast('Enter a valid exit date and financial figures.');
    }
    const input = Object.fromEntries(numericKeys.map((key,index) => [key,figures[index]]));
    record.exit = {exitDate,...input,...realizeExit(input)};
    recordActivity('Recorded fictional exit',deal.id,portfolioUrl(deal.id));
    persist();
    render();
    return toast('Fictional exit recorded.');
  }
  if (target.id === 'portfolio-quarter') {
    event.preventDefault();
    const deal = portfolioDeal();
    if (!deal) return;
    const fields = new FormData(target);
    const year = Number(fields.get('year'));
    const quarter = fields.get('quarter');
    const metricKeys = ['revenue','revenueBudget','ebitda','ebitdaBudget'];
    const values = metricKeys.map(key => String(fields.get(key) ?? '').trim());
    const figures = values.map(Number);
    if (!Number.isInteger(year) || year < 2000 || year > 2100 || !['Q1','Q2','Q3','Q4'].includes(quarter) ||
        values.some(value => !value) || figures.some((value,index) => !Number.isFinite(value) || value < (index < 2 ? 0 : -10000) || value > 10000)) {
      return toast('Enter a valid quarter and financial figures.');
    }
    const record = state.work[deal.id];
    (record.portfolio ??= {})[year + ' ' + quarter] = Object.fromEntries(metricKeys.map((key,index) => [key,round(figures[index])]));
    recordActivity('Saved portfolio results for ' + year + ' ' + quarter,deal.id,portfolioUrl(deal.id));
    persist();
    render();
    return toast('Fictional quarter saved.');
  }
  if (target.id === 'closing-form') {
    event.preventDefault();
    const deal = selectedClosingDeal();
    if (!deal || state.work[deal.id].closing?.closedAt) return;
    const fields = new FormData(target);
    const inputMilestones = fields.getAll('milestone');
    const milestones = closingChecklist(state.work[deal.id]);
    const checked = milestones.map(([key]) => key).filter(key => inputMilestones.includes(key));
    const notes = String(fields.get('notes') ?? '').trim().slice(0,1200);
    const finalize = event.submitter?.name === 'close';
    if (finalize && checked.length !== milestones.length) {
      return toast('Complete all closing milestones before recording a close.');
    }
    state.work[deal.id].closing = {checked,notes,...(finalize ? {closedAt:new Date().toISOString()} : {})};
    recordActivity(finalize ? 'Recorded fictional closing' : 'Saved closing checklist',deal.id,closingUrl(deal.id));
    persist();
    render();
    return toast(finalize ? 'Fictional closing recorded.' : 'Closing checklist saved.');
  }
  if (target.id === 'committee-vote') {
    event.preventDefault();
    if (!active || step !== 3) return;
    const record = work(active);
    if (!canRecordDecision(record)) return toast('A final committee decision already exists.');
    const fields = new FormData(target);
    const outcome = fields.get('outcome');
    const reason = String(fields.get('reason') ?? '').trim();
    if (!committeeOutcomes.includes(outcome) || !reason || reason.length > 600) {
      return toast('Choose an outcome and enter a reason.');
    }
    const conditionsInput = String(fields.get('conditions') ?? '');
    const conditions = outcome === 'Approved' ?
      [...new Set(conditionsInput.split(/\r?\n/).map(line => line.trim()).filter(Boolean))] : [];
    if (conditions.length > 6 || conditionsInput.length > 500) return toast('Enter at most six closing conditions.');
    const at = new Date().toISOString();
    const brief = memo(active,evaluate(active,state.thesis),record);
    const underwriting = snapshotUnderwriting(active,record);
    record.votes = [...decisionHistory(record), {outcome,at,reason,brief,conditions,underwriting}];
    Object.assign(record,{decision:outcome,decidedAt:at,decisionReason:reason,decisionBrief:brief});
    recordActivity('Committee vote · ' + outcome,active.id,dealUrl(active.id,4));
    return advance();
  }
  if (target.id === 'issue-form' || target.dataset?.editIssue) {
    event.preventDefault();
    if (!active || step !== 1) return;
    const fields = new FormData(target);
    const title = String(fields.get('title') ?? '').trim();
    const owner = fields.get('owner');
    const priority = fields.get('priority');
    const dueDate = String(fields.get('dueDate') ?? '');
    if (!title || title.length > 120 || !diligenceOwners.includes(owner) || !issuePriorities.includes(priority) || !validCalendarDate(dueDate)) {
      return toast('Enter a valid title, owner, priority, and due date.');
    }
    const record = work(active);
    const editing = target.dataset?.editIssue;
    if (editing) {
      const existing = diligenceIssues(record).find(issue => issue.id === editing);
      if (!existing) return;
      Object.assign(existing,{title,owner,priority,dueDate});
    } else {
      (record.issues ??= []).push({id:crypto.randomUUID(),title,owner,priority,dueDate,resolved:false});
    }
    recordActivity(editing ? 'Updated a diligence issue' : 'Added a diligence issue',active.id,dealUrl(active.id,1));
    persist();
    render();
    return toast(editing ? 'Diligence issue updated.' : 'Diligence issue added.');
  }
  if (!['thesis-form','lbo-form'].includes(target.id)) return;
  event.preventDefault();
  const fields = Object.fromEntries(new FormData(target));
  if (target.id === 'thesis-form') {
    const {min,max,cap,sector,region} = fields;
    if (Number(min) > Number(max)) return toast('Minimum EBITDA must be at or below maximum EBITDA.');
    state.thesis = {min:Number(min),max:Number(max),cap:Number(cap),sector,region};
    recordActivity('Updated the investment thesis',null,'./thesis.html');
    persist();
    render();
    return toast('Buy box saved. All deals rescreened.');
  }
  const terms = Object.fromEntries(Object.entries(fields).map(([key,value]) => [key,Number(value)]));
  if (!model(active,terms)) return toast('Use a valid holding period and fee rate. Opening leverage must be below the entry multiple.');
  const record = work(active);
  const currentCase = record.caseName ?? 'Base';
  (record.cases ??= {})[currentCase] = {...terms};
  record.terms = terms;
  persist();
  if (event.submitter?.name === 'advance') return advance();
  render();
  toast('Returns recalculated.');
});
const unlockedStep = active ? state.work[active.id]?.progress ?? 0 : 0;
if (dealStep >= 0 && !active) location.replace('./index.html');
else if (active && step > unlockedStep) location.replace(dealUrl(active.id, unlockedStep));
else {
  render();
  if ((active && step === 0) || (page === 'watchlist' && watchedDeals().length)) void checkScreeningStatus();
}
window.addEventListener('pageshow', event => {
  if (event.persisted) location.reload();
});


async function requestAssessment(deal,password,thesis) {
  const response = await fetch('./api/screen', {
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({password,dealId:deal.id,thesis})
  });
  if (!response.headers.get('Content-Type')?.includes('application/json')) {
    throw new Error('The OpenAI screening service is unavailable on this host.');
  }
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'OpenAI screening failed.');
  if (typeof payload.summary !== 'string' || !payload.summary.trim() || typeof payload.model !== 'string') {
    throw new Error('OpenAI did not return a usable assessment.');
  }
  return {summary:payload.summary,model:payload.model,at:new Date().toISOString(),thesis};
}
function saveAssessment(deal,assessment) {
  const latest = readWorkspace();
  if (latest) state = latest;
  const record = work(deal);
  if (record.assessment) {
    record.assessmentHistory = [record.assessment,...(record.assessmentHistory ?? [])].slice(0,7);
  }
  record.assessment = assessment;
  recordActivity('Saved an OpenAI assessment',deal.id,dealUrl(deal.id,0));
  persist();
}
async function assessWatchlist(form) {
  const candidates = watchedDeals().slice(0,3);
  if (!candidates.length || batchRunning) return;
  const result = document.querySelector('#batch-result');
  const submit = form.querySelector('button');
  const password = new FormData(form).get('password');
  const thesis = {...state.thesis};
  form.reset();
  batchRunning = true;
  submit.disabled = true;
  let finished = 0;
  try {
    for (const deal of candidates) {
      result.textContent = 'Assessing ' + deal.name + ' (' + (finished + 1) + ' of ' + candidates.length + ')…';
      saveAssessment(deal,await requestAssessment(deal,password,thesis));
      finished++;
    }
    result.textContent = finished + (finished === 1 ? ' assessment saved.' : ' assessments saved.');
  } catch (error) {
    result.textContent = finished + ' of ' + candidates.length + ' assessments saved. ' + error.message;
  } finally {
    batchRunning = false;
    submit.disabled = false;
  }
}
document.addEventListener('submit', async event => {
  const form = event.target;
  if (form.id !== 'openai-form' && form.id !== 'batch-openai-form') return;
  event.preventDefault();
  if (screeningStatus?.unavailable) return;
  if (form.id === 'batch-openai-form') {
    if (page === 'watchlist') await assessWatchlist(form);
    return;
  }
  if (!active) return;
  const result = document.querySelector('#openai-result');
  const submit = form.querySelector('button');
  const password = new FormData(form).get('password');
  const thesis = {...state.thesis};
  form.reset();
  submit.disabled = true;
  result.textContent = 'Evaluating fictional evidence…';
  try {
    saveAssessment(active,await requestAssessment(active,password,thesis));
    render();
    document.querySelector('#openai-result').textContent = 'Assessment saved.';
  } catch (error) {
    result.textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});
