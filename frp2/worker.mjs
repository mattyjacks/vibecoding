const maxRequestsPerMinute = 5;
let windowStart = 0;
let requests = 0;
const screeningModel = env => env.OPENAI_MODEL || 'gpt-6-luna';

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function providerError(upstream) {
  if (upstream.status === 429) {
    let code;
    try { code = (await upstream.json()).error?.code; } catch {}
    if (code === 'insufficient_quota' || code === 'billing_hard_limit_reached') {
      return json({error:'The OpenAI project has reached its API quota or spending limit.'},503);
    }
    return json({error:'OpenAI is rate-limiting requests. Wait briefly before running another assessment.'},429);
  }
  if ([401,403,404].includes(upstream.status)) {
    return json({error:'OpenAI did not authorize this API key or model. Check the server’s project and model access.'},502);
  }
  return json({error:'OpenAI could not complete the screening request. Try again.'},502);
}
export async function handleScreen(request, env, send = fetch) {
  if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Invalid request origin.' }, 403);
  let data;
  try {
    const body = await request.text();
    if (body.length > 2048) return json({ error: 'Request is too large.' }, 413);
    data = JSON.parse(body);
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  if (!env.DEMO_PASSWORD) return json({ error: 'The demo password is not configured on the server.' }, 503);
  if (data?.password !== env.DEMO_PASSWORD) return json({ error: 'Incorrect demo password.' }, 401);
  const deal = Number.isInteger(data.dealId) && demoDeals.find(item => item.id === data.dealId);
  if (!deal) return json({ error: 'Select one of the fictional demo deals.' }, 400);
  const thesis = data.thesis;
  if (!thesis || ![thesis.min, thesis.max, thesis.cap].every(value => Number.isFinite(value) && value >= 0 && value <= 100) ||
      thesis.min > thesis.max || !['Any', ...demoSectors].includes(thesis.sector) || !['Any', ...demoRegions].includes(thesis.region)) {
    return json({ error: 'Invalid investment thesis.' }, 400);
  }
  if (!env.OPENAI_API_KEY) return json({ error: 'OpenAI screening requires the Site runtime secret OPENAI_API_KEY.' }, 503);
  if (Date.now() - windowStart >= 60_000) {
    windowStart = Date.now();
    requests = 0;
  }
  if (requests >= maxRequestsPerMinute) return json({ error: 'Demo request limit reached. Try again in a minute.' }, 429);
  requests++;

  try {
    const model = screeningModel(env);
    const upstream = await send('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + env.OPENAI_API_KEY, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(25_000),
      body: JSON.stringify({
        model,
        ...(model.startsWith('gpt-6-luna') ? { reasoning: { effort: 'low' } } : {}),
        store: false,
        max_output_tokens: 1200,
        instructions: 'Evaluate a fictional private equity deal using only the supplied facts. Start with Pursue, Review, or Pass and explain the recommendation in 2–4 sentences. State how the deal fits the buy box, reconcile reported and supported EBITDA, distinguish reported growth from the channel estimate, and flag customer concentration if above the cap. Cite sources by their exact evidence keys, each in separate brackets, for example [Fictional customer schedule]. End with the most important next diligence question. Plain text only.',
        input: JSON.stringify({
          company: deal.name, sector: deal.sector, region: deal.region, thesis: { min: thesis.min, max: thesis.max, cap: thesis.cap, sector: thesis.sector, region: thesis.region },
          historicalPursuitSignal: Math.round(demoHistoricalFit(deal) * 100) + '%',
          evidence: {
            [evidenceSourceNames[0]]: { revenueMillions: deal.revenue, claimedAdjustedEbitdaMillions: deal.adjusted, claimedGrowthPercent: deal.growth },
            [evidenceSourceNames[1]]: { supportedEbitdaMillions: deal.ebitda },
            [evidenceSourceNames[2]]: { topCustomerPercent: deal.concentration },
            [evidenceSourceNames[3]]: { directionalGrowthPercent: deal.checkedGrowth }
          }
        })
      })
    });
    if (!upstream.ok) return await providerError(upstream);
    const result = await upstream.json();
    const summary = result.output?.flatMap(item => item.type === 'message' ? item.content || [] : [])
      .filter(part => part.type === 'output_text').map(part => part.text).join('\n').trim();
    if (!summary || result.status !== 'completed') return json({ error: 'OpenAI did not return a complete assessment. Please retry.' }, 502);
    return json({ summary, model: result.model });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      return json({error:'The OpenAI assessment timed out. Try again.'},504);
    }
    return json({error:'FinFlow could not get a response from OpenAI. Check the server’s network connection and try again.'},502);
  }
}

export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/frp2' && request.method === 'GET') {
      url.pathname = '/frp2/';
      return Response.redirect(url,308);
    }
    const pathname = url.pathname.startsWith('/frp2/') ? url.pathname.slice('/frp2'.length) : url.pathname;
    if (pathname === '/api/screen/status' && request.method === 'GET') {
      const ready = Boolean(env.OPENAI_API_KEY && env.DEMO_PASSWORD);
      return json({ready, ...(ready ? {model:screeningModel(env)} : {})});
    }
    if (pathname === '/api/screen') return handleScreen(request, env);
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
    if (!Object.hasOwn(demoAssets, pathname)) return new Response('Not found', { status: 404 });
    const [type, body] = demoAssets[pathname];
    return new Response(body, { headers: { 'Content-Type': type } });
  }
};
