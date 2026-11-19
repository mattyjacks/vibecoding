const maxRequestsPerMinute = 5;
let windowStart = 0;
let requests = 0;
const copilotMaxRequestsPerMinute = 20;
let copilotWindowStart = 0;
let copilotRequests = 0;
const screeningModel = env => env.OPENAI_MODEL || 'gpt-6-luna';

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function providerError(upstream) {
  if (upstream.status === 429) {
    let code;
    try { code = (await upstream.json()).error?.code; } catch {}
    if (code === 'insufficient_quota' || code === 'billing_hard_limit_reached') {
      return json({ error: 'The OpenAI project has reached its API quota or spending limit.' }, 503);
    }
    return json({ error: 'OpenAI is rate-limiting requests. Wait briefly before running another assessment.' }, 429);
  }
  if ([401, 403, 404].includes(upstream.status)) {
    return json({ error: 'OpenAI did not authorize this API key or model. Check the server’s project and model access.' }, 502);
  }
  return json({ error: 'OpenAI could not complete the screening request. Try again.' }, 502);
}

function validateThesis(thesis) {
  return Boolean(
    thesis &&
    [thesis.min, thesis.max, thesis.cap].every(value => Number.isFinite(value) && value >= 0 && value <= 100) &&
    thesis.min <= thesis.max &&
    ['Any', ...demoSectors].includes(thesis.sector) &&
    ['Any', ...demoRegions].includes(thesis.region)
  );
}

function validateCustomDeal(raw, id) {
  if (!raw || typeof raw !== 'object' || !Number.isInteger(id) || id < 1000) return null;
  const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 80) : '';
  if (!name || !demoSectors.includes(raw.sector) || !demoRegions.includes(raw.region)) return null;
  const { revenue, ebitda, adjusted, growth, checkedGrowth, concentration } = raw;
  if (![revenue, ebitda, adjusted].every(v => Number.isFinite(v) && v > 0 && v <= 5000)) return null;
  if (![growth, checkedGrowth].every(v => Number.isFinite(v) && v >= -50 && v <= 100)) return null;
  if (!Number.isFinite(concentration) || concentration < 0 || concentration > 100) return null;
  return {
    id,
    name,
    sector: raw.sector,
    region: raw.region,
    revenue: Number(revenue.toFixed(1)),
    ebitda: Number(ebitda.toFixed(1)),
    adjusted: Number(Math.max(ebitda, adjusted).toFixed(1)),
    growth: Math.round(growth),
    checkedGrowth: Math.round(checkedGrowth),
    concentration: Math.round(concentration),
    broker: typeof raw.broker === 'string' && raw.broker.trim() ? raw.broker.trim().slice(0, 60) : 'Direct Origination'
  };
}

function resolveDeal(data) {
  if (!Number.isInteger(data?.dealId)) return null;
  const bundled = demoDeals.find(item => item.id === data.dealId);
  if (bundled) return bundled;
  return validateCustomDeal(data.customDeal, data.dealId);
}

async function parseAuthorizedJson(request, env, maxBytes) {
  if (request.method !== 'POST') return { error: json({ error: 'Use POST.' }, 405) };
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return { error: json({ error: 'Invalid request origin.' }, 403) };
  let data;
  try {
    const body = await request.text();
    if (body.length > maxBytes) return { error: json({ error: 'Request is too large.' }, 413) };
    data = JSON.parse(body);
  } catch {
    return { error: json({ error: 'Invalid request.' }, 400) };
  }
  if (!env.DEMO_PASSWORD) return { error: json({ error: 'The demo password is not configured on the server.' }, 503) };
  if (data?.password !== env.DEMO_PASSWORD) return { error: json({ error: 'Incorrect demo password.' }, 401) };
  return { data };
}

async function callOpenAIResponses(env, send, instructions, inputPayload, timeoutMs = 25_000, maxOutputTokens = 1200) {
  const model = screeningModel(env);
  const upstream = await send('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + env.OPENAI_API_KEY, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model,
      ...(model.startsWith('gpt-6-luna') ? { reasoning: { effort: 'low' } } : {}),
      store: false,
      max_output_tokens: maxOutputTokens,
      instructions,
      input: JSON.stringify(inputPayload)
    })
  });
  if (!upstream.ok) return { error: await providerError(upstream) };
  const result = await upstream.json();
  const text = result.output?.flatMap(item => item.type === 'message' ? item.content || [] : [])
    .filter(part => part.type === 'output_text').map(part => part.text).join('\n').trim();
  if (!text || result.status !== 'completed') {
    return { error: json({ error: 'OpenAI did not return a complete assessment. Please retry.' }, 502) };
  }
  return { text, model: result.model || model };
}

export async function handleScreen(request, env, send = fetch) {
  const parsed = await parseAuthorizedJson(request, env, 2048);
  if (parsed.error) return parsed.error;
  const { data } = parsed;

  const deal = resolveDeal(data);
  if (!deal) return json({ error: 'Select one of the fictional demo deals.' }, 400);
  const thesis = data.thesis;
  if (!validateThesis(thesis)) return json({ error: 'Invalid investment thesis.' }, 400);
  if (!env.OPENAI_API_KEY) return json({ error: 'OpenAI screening requires the Site runtime secret OPENAI_API_KEY.' }, 503);

  if (Date.now() - windowStart >= 60_000) {
    windowStart = Date.now();
    requests = 0;
  }
  if (requests >= maxRequestsPerMinute) return json({ error: 'Demo request limit reached. Try again in a minute.' }, 429);
  requests++;

  try {
    const out = await callOpenAIResponses(
      env,
      send,
      'Evaluate a fictional private equity deal using only the supplied facts. Start with Pursue, Review, or Pass and explain the recommendation in 2–4 sentences. State how the deal fits the buy box, reconcile reported and supported EBITDA, distinguish reported growth from the channel estimate, and flag customer concentration if above the cap. Cite sources by their exact evidence keys, each in separate brackets, for example [Fictional customer schedule]. End with the most important next diligence question. Plain text only.',
      {
        company: deal.name,
        sector: deal.sector,
        region: deal.region,
        thesis: { min: thesis.min, max: thesis.max, cap: thesis.cap, sector: thesis.sector, region: thesis.region },
        historicalPursuitSignal: Math.round(demoHistoricalFit(deal) * 100) + '%',
        evidence: {
          [evidenceSourceNames[0]]: { revenueMillions: deal.revenue, claimedAdjustedEbitdaMillions: deal.adjusted, claimedGrowthPercent: deal.growth },
          [evidenceSourceNames[1]]: { supportedEbitdaMillions: deal.ebitda },
          [evidenceSourceNames[2]]: { topCustomerPercent: deal.concentration },
          [evidenceSourceNames[3]]: { directionalGrowthPercent: deal.checkedGrowth }
        }
      }
    );
    if (out.error) return out.error;
    return json({ summary: out.text, model: out.model });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      return json({ error: 'The OpenAI assessment timed out. Try again.' }, 504);
    }
    return json({ error: 'FinFlow could not get a response from OpenAI. Check the server’s network connection and try again.' }, 502);
  }
}

const copilotModes = new Set(['diligence_plan', 'lbo_critique', 'ic_memo', 'deal_qa']);

export async function handleCopilot(request, env, send = fetch) {
  const parsed = await parseAuthorizedJson(request, env, 8192);
  if (parsed.error) return parsed.error;
  const { data } = parsed;

  if (!copilotModes.has(data.mode)) return json({ error: 'Unsupported AI copilot mode.' }, 400);
  const deal = resolveDeal(data);
  if (!deal) return json({ error: 'Select one of the fictional demo deals.' }, 400);
  const thesis = data.thesis;
  if (!validateThesis(thesis)) return json({ error: 'Invalid investment thesis.' }, 400);
  if (data.mode === 'deal_qa' && (typeof data.question !== 'string' || !data.question.trim() || data.question.trim().length > 400)) {
    return json({ error: 'Enter a concise question (up to 400 characters).' }, 400);
  }
  if (!env.OPENAI_API_KEY) return json({ error: 'OpenAI screening requires the Site runtime secret OPENAI_API_KEY.' }, 503);

  if (Date.now() - copilotWindowStart >= 60_000) {
    copilotWindowStart = Date.now();
    copilotRequests = 0;
  }
  if (copilotRequests >= copilotMaxRequestsPerMinute) return json({ error: 'Copilot rate limit reached. Try again in a minute.' }, 429);
  copilotRequests++;

  const contextPayload = {
    company: deal.name,
    sector: deal.sector,
    region: deal.region,
    thesis: { min: thesis.min, max: thesis.max, cap: thesis.cap, sector: thesis.sector, region: thesis.region },
    evidence: {
      [evidenceSourceNames[0]]: { revenueMillions: deal.revenue, claimedAdjustedEbitdaMillions: deal.adjusted, claimedGrowthPercent: deal.growth },
      [evidenceSourceNames[1]]: { supportedEbitdaMillions: deal.ebitda },
      [evidenceSourceNames[2]]: { topCustomerPercent: deal.concentration },
      [evidenceSourceNames[3]]: { directionalGrowthPercent: deal.checkedGrowth }
    },
    ...(data.terms && typeof data.terms === 'object' ? { lboAssumptions: data.terms } : {}),
    ...(data.lboSummary && typeof data.lboSummary === 'object' ? { lboMetrics: data.lboSummary } : {}),
    ...(Array.isArray(data.issues) ? { openDiligenceIssues: data.issues.slice(0, 8) } : {}),
    ...(data.mode === 'deal_qa' ? { question: data.question.trim() } : {})
  };

  let instructions;
  if (data.mode === 'diligence_plan') {
    instructions = 'You are a private equity diligence lead evaluating a fictional deal. Produce a valid JSON object (no markdown fences) with keys: "overview" (2 concise sentences summarizing the primary diligence priorities grounded in the evidence) and "items" (array of 3 to 4 objects, each with "title" under 90 chars, "priority" one of "High"|"Medium"|"Low", and "rationale" 1 concise sentence citing exact evidence keys like [Fictional customer schedule]).';
  } else if (data.mode === 'lbo_critique') {
    instructions = 'You are a private equity investment committee partner reviewing a fictional LBO model. In 3 to 5 crisp sentences of plain text, critique the supplied lboAssumptions and lboMetrics against the deal evidence: assess whether modeled EBITDA growth exceeds [Fictional channel interviews], check whether exit multiple expansion or leverage drives returns, note interest coverage / sponsor cure risks, and suggest 1 specific downside sensitivity test.';
  } else if (data.mode === 'ic_memo') {
    instructions = 'Draft an institutional Investment Committee Executive Memo in plain text for this fictional deal using only the supplied facts. Include concise labeled sections: RECOMMENDATION (Approve / Defer / Decline with rationale), THESIS & QOE RECONCILIATION (reconciling [Fictional CIM] and [Fictional financial schedule]), COMMERCIAL & CONCENTRATION RISK (citing [Fictional channel interviews] and [Fictional customer schedule]), UNDERWRITING SUMMARY (referencing lboMetrics if provided), and PROPOSED CLOSING CONDITIONS (2–3 concrete conditions).';
  } else {
    instructions = 'You are an institutional private equity deal analyst answering a question about a fictional deal using only the supplied facts, lboMetrics, and openDiligenceIssues. Answer concisely in 2 to 4 plain-text sentences. Cite exact evidence keys in brackets such as [Fictional CIM] or [Fictional financial schedule] whenever referencing evidence.';
  }

  try {
    const out = await callOpenAIResponses(env, send, instructions, contextPayload, 30_000, 1400);
    if (out.error) return out.error;
    if (data.mode === 'diligence_plan') {
      let parsedPlan = null;
      try {
        const cleaned = out.text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        parsedPlan = JSON.parse(cleaned);
      } catch {}
      if (parsedPlan && Array.isArray(parsedPlan.items)) {
        return json({
          mode: data.mode,
          overview: String(parsedPlan.overview || ''),
          items: parsedPlan.items.slice(0, 5).map(item => ({
            title: String(item.title || '').slice(0, 110),
            priority: ['High', 'Medium', 'Low'].includes(item.priority) ? item.priority : 'Medium',
            rationale: String(item.rationale || '').slice(0, 240)
          })).filter(item => item.title),
          model: out.model
        });
      }
    }
    return json({ mode: data.mode, summary: out.text, model: out.model });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      return json({ error: 'The OpenAI copilot request timed out. Try again.' }, 504);
    }
    return json({ error: 'FinFlow could not get a response from OpenAI. Check the server’s network connection and try again.' }, 502);
  }
}

export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/frp2' && request.method === 'GET') {
      url.pathname = '/frp2/';
      return Response.redirect(url, 308);
    }
    const pathname = url.pathname.startsWith('/frp2/') ? url.pathname.slice('/frp2'.length) : url.pathname;
    if (pathname === '/api/screen/status' && request.method === 'GET') {
      const ready = Boolean(env.OPENAI_API_KEY && env.DEMO_PASSWORD);
      return json({ ready, ...(ready ? { model: screeningModel(env) } : {}) });
    }
    if (pathname === '/api/screen') return handleScreen(request, env);
    if (pathname === '/api/ai/copilot') return handleCopilot(request, env);
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 });
    if (!Object.hasOwn(demoAssets, pathname)) return new Response('Not found', { status: 404 });
    const [type, body] = demoAssets[pathname];
    return new Response(body, { headers: { 'Content-Type': type } });
  }
};
