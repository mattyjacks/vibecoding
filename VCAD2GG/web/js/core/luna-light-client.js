window.VCAD2 = window.VCAD2 || {};

window.VCAD2.LunaLightClient = {
  isLiveMode() {
    return Boolean(window.VCAD2.State.config.apiKey.trim());
  },

  async generatePlan(prompt) {
    const { endpoint, model, apiKey } = window.VCAD2.State.config;
    if (!apiKey.trim()) {
      return null; // Fallback to local deterministic planner in Demo Mode
    }

    const systemPrompt = `You are GPT 6 Luna Light, an agentic CAD architect inspired by ldraw-nova.
Return ONLY valid JSON describing a mechanical assembly with:
{
  "name": "ModelName",
  "submodels": ["chassis", ...],
  "parts": [
    { "id": "p1", "type": "beam_1x8|plate_2x4|gear_24t|wheel_hub|axle_4|arm_link|servo_box", "submodel": "chassis", "pos": [x,y,z], "rot": [rx,ry,rz], "color": "#38bdf8" }
  ]
}`;

    const [baseModel, reasoningEffort] = model.split(':');
    const body = {
      model: baseModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2
    };
    if (['low', 'medium', 'high'].includes(reasoningEffort)) {
      body.reasoning = { effort: reasoningEffort };
    }

    const referer = (window.location.origin && window.location.origin !== 'null')
      ? window.location.origin
      : 'https://givegigs.local';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': referer,
        'X-Title': 'GiveGigs Valley CAD 2'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errMsg = `${res.status}`;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.error?.message || errMsg;
      } catch (_) {}
      throw new Error(`OpenRouter 400/Error: ${errMsg}`);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  }
};
