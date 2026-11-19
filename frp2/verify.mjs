import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import vm from 'node:vm';

await import('./build-worker.mjs');
const { default: worker, handleScreen } = await import('./dist/server/index.js');
const origin = 'http://localhost';
const files = (await readdir(new URL('./',import.meta.url))).filter(name => name.endsWith('.html'));
const get = path => worker.fetch(new Request(new URL(path,origin)),{});
for (const file of files) {
  const response = await get('/' + file);
  assert.equal(response.status,200,file);
  const html = await response.text();
  const mounted = await get('/frp2/' + file);
  assert.equal(mounted.status,200,'Mounted ' + file);
  assert.equal(await mounted.text(),html);
  assert.match(html, /<finflow-sidebar[^>]*><\/finflow-sidebar>/);
  assert.match(html, /<finflow-header[^>]*><\/finflow-header>/);
  assert.match(html, /<finflow-footer><\/finflow-footer>/);
  const staticPage = await readFile(new URL('./dist/' + file,import.meta.url),'utf8');
  for (const [,path] of html.matchAll(/(?:src|href)="(\.\/dist\/[^"]+)"/g)) {
    const asset = await get(path);
    assert.equal(asset.status,200,path);
    const mountedAsset = await get('/frp2/' + path.slice(2));
    assert.equal(mountedAsset.status,200,'Mounted ' + path);
    assert.ok(staticPage.includes(path.replace('./dist/','./')),file);
    if (path.endsWith('.js')) new vm.Script(await asset.text(),{filename:path});
  }
  if (file !== 'terms.html') {
    assert.match(html,/domain\.js" defer><\/script><script src="\.\/dist\/app\.js" defer>/);
  }
}
assert.equal((await get('/')).status,200);
assert.equal((await get('/.env')).status,404);
assert.equal((await get('/frp2/.env')).status,404);
const redirect = await get('/frp2?from=test');
assert.equal(redirect.status,308);
assert.equal(redirect.headers.get('location'),origin + '/frp2/?from=test');
const mountedGate = await worker.fetch(new Request(origin + '/frp2/api/screen',{
  method:'POST', body:JSON.stringify({password:'incorrect',dealId:1})
}),{DEMO_PASSWORD:'verification-only'});
assert.equal(mountedGate.status,401);
const healthRequest = () => new Request(origin + '/frp2/api/screen/status');
assert.deepEqual(await (await worker.fetch(healthRequest(),{})).json(),{ready:false});
assert.deepEqual(await (await worker.fetch(healthRequest(),{DEMO_PASSWORD:'mock',OPENAI_API_KEY:'mock'})).json(),
  {ready:true,model:'gpt-6-luna'});

const env = {DEMO_PASSWORD:'verification-only',OPENAI_API_KEY:'mock-key'};
const thesis = {min:4,max:10,cap:20,sector:'Any',region:'Any',extra:'Unapproved input'};
const request = (password,dealId) => new Request(origin + '/api/screen',{
  method:'POST',body:JSON.stringify({password,dealId,thesis})
});
const failIfCalled = () => assert.fail('An invalid request reached the provider');
assert.equal((await handleScreen(request('bad',1),env,failIfCalled)).status,401);
assert.equal((await handleScreen(request(env.DEMO_PASSWORD,999),env,failIfCalled)).status,400);
assert.equal((await handleScreen(request(env.DEMO_PASSWORD,1),{DEMO_PASSWORD:env.DEMO_PASSWORD},failIfCalled)).status,503);
const screened = await handleScreen(request(env.DEMO_PASSWORD,1),env,async (url,options) => {
  assert.equal(url,'https://api.openai.com/v1/responses');
  const body = JSON.parse(options.body);
  const input = JSON.parse(body.input);
  assert.equal(body.model,'gpt-6-luna');
  assert.equal(body.store,false);
  assert.equal(input.company,'Ridgeline Pump & Valve');
  assert.equal(input.evidence['Fictional customer schedule'].topCustomerPercent,31);
  assert.equal(input.thesis.extra,undefined);
  assert.ok(!options.body.includes(env.DEMO_PASSWORD));
  return Response.json({status:'completed',model:'gpt-6-luna',
    output:[{type:'message',content:[{type:'output_text',text:'Review fictional concentration.'}]}]});
});
assert.equal(screened.status,200);
assert.equal((await screened.json()).summary,'Review fictional concentration.');

const upstreamCases = [
  [429,'rate_limit_exceeded',429,/rate-limiting/],
  [429,'insufficient_quota',503,/quota or spending limit/],
  [401,'invalid_api_key',502,/did not authorize/]
];
for (const [upstreamStatus,code,expected,message] of upstreamCases) {
  const failed = await handleScreen(request(env.DEMO_PASSWORD,1),env,async () =>
    Response.json({error:{code,message:'Do not copy this upstream message'}},{status:upstreamStatus}));
  assert.equal(failed.status,expected);
  const payload = await failed.json();
  assert.match(payload.error,message);
  assert.doesNotMatch(payload.error,/Do not copy/);
}
const timeout = await handleScreen(request(env.DEMO_PASSWORD,1),env,async () => {
  throw new DOMException('Private upstream details','TimeoutError');
});
assert.equal(timeout.status,504);
assert.match((await timeout.json()).error,/timed out/);
const limited = await handleScreen(request(env.DEMO_PASSWORD,1),env,failIfCalled);
assert.equal(limited.status,429);
assert.match((await limited.json()).error,/Demo request limit/);
const domainScript = new vm.Script(await readFile(new URL('./dist/domain.js',import.meta.url),'utf8'),{filename:'domain.js'});
const appScript = new vm.Script(await readFile(new URL('./dist/app.js',import.meta.url),'utf8'),{filename:'app.js'});
const domain = vm.createContext({});
domainScript.runInContext(domain);
const check = expression => vm.runInContext(expression,domain);
assert.equal(check('deals.length'),50);
assert.equal(check('history.length'),80);
assert.equal(check('new Set([...deals,...intakeDeals].map(deal => deal.name)).size'),62);
assert.equal(check('evaluate(deals[0],defaults).decision'),'Review');
assert.equal(check('evaluate(deals[0],defaults).flags.length'),3);
assert.equal(check('evaluate(deals[0],defaults).fit'),8);

const terms = {entry:8,exit:8,leverage:0,growth:0,interest:0,cash:50,years:1};
const checkModel = changes => {
  domain.assumptions = {...terms,...changes};
  return check('model({ebitda:10},assumptions)');
};
const closeTo = (actual,expected) => assert.ok(Math.abs(actual - expected) < 1e-7,
  'Expected ' + actual + ' to be close to ' + expected);
const surplus = checkModel({});
assert.equal(surplus.years[0].cashBalance,5);
closeTo(surplus.moic,1.0625);
closeTo(surplus.irr,6.25);
const shortfall = checkModel({leverage:5,interest:20,cash:0});
assert.equal(shortfall.sponsorFunding,10);
closeTo(shortfall.irr,-100 / 3);
const withFees = checkModel({fees:2,leverage:3});
closeTo(withFees.totalUses,withFees.debt + withFees.equity);
assert.equal(checkModel({exit:1,leverage:5,interest:20,cash:0}).irr,null);

const workspace = JSON.stringify({
  thesis:{min:4,max:10,cap:20,sector:'Any',region:'Any'},work:{1:{
    progress:4,checked:[],notes:'Fictional review',terms,decision:'Approved',
    decidedAt:'2026-11-19T12:00:00Z',closing:{closedAt:'2026-11-19T13:00:00Z',checked:[],notes:''}
  }}
});
for (const file of files.filter(name => name !== 'terms.html')) {
  const element = { append() {} };
  const nodes = {
    '#app':element,'#breadcrumb':{},'#saved-assessment':{replaceChildren(){}},
    '#openai-assessment':{content:{cloneNode(){}}}
  };
  const context = vm.createContext({
    document:{body:{dataset:{page:file.slice(0,-5)}},querySelector:id=>nodes[id],querySelectorAll:()=>[],addEventListener(){}},
    location:{search:'?deal=1'},window:{addEventListener(){}},URLSearchParams,
    localStorage:{getItem:()=>workspace},fetch:async()=>Response.json({ready:false})
  });
  domainScript.runInContext(context);
  appScript.runInContext(context);
  assert.match(element.innerHTML,/<h1>/,'App rendering for ' + file);
}
console.log('Verified ' + files.length + ' page routes at the root and /frp2, client rendering, deal catalog, underwriting math, secret isolation, and mocked Luna screening.');
