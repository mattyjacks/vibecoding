(function (root) {
  const esc = v => String(v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const num = (v, fallback = 0) => (Number.isFinite(v) ? v : fallback);
  const fmtM = v => (v < 0 ? '-$' : '$') + Math.abs(num(v)).toFixed(1) + 'M';

  function pipelineFunnel(stageCounts) {
    const entries = Object.entries(stageCounts || {});
    const total = entries.reduce((sum, [, count]) => sum + num(count), 0) || 1;
    const palette = ['#2a6f5d', '#1d574b', '#418a74', '#d48b28', '#2c6e8f', '#15803d', '#5c738f', '#8a5a44'];
    const segments = entries
      .filter(([, count]) => count > 0)
      .map(([stage, count], idx) => {
        const pct = ((count / total) * 100).toFixed(1);
        const color = palette[idx % palette.length];
        return '<div class="funnel-seg" style="width:' + pct + '%;background:' + color + '" data-tooltip="' + esc(stage + ': ' + count + ' deals (' + pct + '%)') + '"></div>';
      }).join('');
    const legend = entries.map(([stage, count], idx) => {
      const color = palette[idx % palette.length];
      return '<span class="funnel-chip"><i style="background:' + color + '"></i>' + esc(stage) + ' <strong>' + count + '</strong></span>';
    }).join('');
    return '<div class="funnel-wrap"><div class="funnel-bar" role="img" aria-label="Pipeline stage distribution">' + segments + '</div><div class="funnel-legend">' + legend + '</div></div>';
  }

  function pipelineScatter(evaluatedDeals, thesis) {
    if (!evaluatedDeals?.length) return '<p class="muted">No deals to plot.</p>';
    const w = 540, h = 250, padL = 44, padR = 18, padT = 18, padB = 34;
    const pw = w - padL - padR, ph = h - padT - padB;
    const maxEbitda = Math.max(15, ...evaluatedDeals.map(d => num(d.deal.ebitda))) * 1.06;
    const xPos = eb => padL + (Math.max(0, Math.min(maxEbitda, num(eb))) / maxEbitda) * pw;
    const yPos = fit => padT + (1 - Math.max(0, Math.min(10, num(fit))) / 10) * ph;

    const minX = xPos(thesis.min);
    const maxX = xPos(Math.min(maxEbitda, thesis.max));
    const zoneW = Math.max(2, maxX - minX);
    const gridY = [2, 4, 6, 8, 10].map(val => {
      const y = yPos(val).toFixed(1);
      return '<line x1="' + padL + '" y1="' + y + '" x2="' + (w - padR) + '" y2="' + y + '" stroke="var(--chart-grid)" stroke-dasharray="3 3"/>' +
        '<text x="' + (padL - 8) + '" y="' + (Number(y) + 4).toFixed(1) + '" text-anchor="end" class="svg-axis">' + val + '</text>';
    }).join('');
    const xTicks = [0, 5, 10, 15].filter(v => v <= maxEbitda).map(val => {
      const x = xPos(val).toFixed(1);
      return '<text x="' + x + '" y="' + (h - 10) + '" text-anchor="middle" class="svg-axis">$' + val + 'M</text>';
    }).join('');

    const bubbles = evaluatedDeals.map(({ deal, result }) => {
      const cx = xPos(deal.ebitda).toFixed(1);
      const cy = yPos(result.fit).toFixed(1);
      const color = result.decision === 'Pursue' ? 'var(--chart-emerald)' : result.decision === 'Review' ? 'var(--chart-amber)' : 'var(--chart-coral)';
      const r = deal.id === 1 ? 7 : 5.2;
      const tip = deal.name + ' · ' + fmtM(deal.ebitda) + ' EBITDA · Fit ' + result.fit.toFixed(1) + '/10 (' + result.decision + ')';
      return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + color + '" fill-opacity="0.86" stroke="var(--white)" stroke-width="1.4" class="scatter-dot" data-deal-id="' + deal.id + '" data-tooltip="' + esc(tip) + '"/>';
    }).join('');

    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="chart-svg" role="img" aria-label="Deal pipeline scatter plot of EBITDA versus Fit score">' +
      '<title>Pipeline Fit vs Supported EBITDA</title>' +
      '<rect x="' + minX.toFixed(1) + '" y="' + padT + '" width="' + zoneW.toFixed(1) + '" height="' + ph + '" fill="var(--chart-emerald)" fill-opacity="0.09" rx="4"/>' +
      '<text x="' + (minX + 6).toFixed(1) + '" y="' + (padT + 13) + '" class="svg-zone-label">Buy Box EBITDA</text>' +
      gridY + xTicks +
      '<line x1="' + padL + '" y1="' + (h - padB) + '" x2="' + (w - padR) + '" y2="' + (h - padB) + '" stroke="var(--chart-axis)"/>' +
      '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (h - padB) + '" stroke="var(--chart-axis)"/>' +
      bubbles +
      '</svg>';
  }

  function qoeWaterfall(deal) {
    const claimed = num(deal.adjusted);
    const supported = num(deal.ebitda);
    const addBack = Math.max(0, claimed - supported);
    const maxVal = Math.max(1, claimed * 1.18);
    const w = 360, h = 165, padL = 18, padB = 30, barW = 68, chartH = 112;
    const scaleY = v => padB + chartH - (Math.max(0, v) / maxVal) * chartH;
    const hClaimed = (claimed / maxVal) * chartH;
    const hAdd = (addBack / maxVal) * chartH;
    const hSup = (supported / maxVal) * chartH;
    const yClaimed = (padB + chartH - hClaimed).toFixed(1);
    const yAdd = yClaimed;
    const ySup = (padB + chartH - hSup).toFixed(1);

    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="chart-svg" role="img" aria-label="Quality of Earnings EBITDA bridge">' +
      '<title>QoE EBITDA Reconciliation</title>' +
      '<rect x="34" y="' + yClaimed + '" width="' + barW + '" height="' + hClaimed.toFixed(1) + '" rx="5" fill="var(--chart-slate)" data-tooltip="Claimed Adjusted EBITDA: ' + fmtM(claimed) + '"/>' +
      '<text x="68" y="' + (Number(yClaimed) - 6).toFixed(1) + '" text-anchor="middle" class="svg-val">' + fmtM(claimed) + '</text>' +
      '<text x="68" y="' + (h - 8) + '" text-anchor="middle" class="svg-axis">Claimed Adj.</text>' +
      '<rect x="146" y="' + yAdd + '" width="' + barW + '" height="' + Math.max(3, hAdd).toFixed(1) + '" rx="4" fill="var(--chart-coral)" data-tooltip="Unsupported Add-backs: -' + fmtM(addBack) + '"/>' +
      '<text x="180" y="' + (Number(yAdd) - 6).toFixed(1) + '" text-anchor="middle" class="svg-val">-' + fmtM(addBack) + '</text>' +
      '<text x="180" y="' + (h - 8) + '" text-anchor="middle" class="svg-axis">Add-backs</text>' +
      '<rect x="258" y="' + ySup + '" width="' + barW + '" height="' + hSup.toFixed(1) + '" rx="5" fill="var(--chart-emerald)" data-tooltip="Supported EBITDA: ' + fmtM(supported) + '"/>' +
      '<text x="292" y="' + (Number(ySup) - 6).toFixed(1) + '" text-anchor="middle" class="svg-val">' + fmtM(supported) + '</text>' +
      '<text x="292" y="' + (h - 8) + '" text-anchor="middle" class="svg-axis">Supported</text>' +
      '<line x1="102" y1="' + yClaimed + '" x2="146" y2="' + yClaimed + '" stroke="var(--chart-axis)" stroke-dasharray="3 3"/>' +
      '<line x1="214" y1="' + ySup + '" x2="258" y2="' + ySup + '" stroke="var(--chart-axis)" stroke-dasharray="3 3"/>' +
      '</svg>';
  }

  function scoreBars(contributions) {
    if (!contributions?.length) return '';
    return '<div class="score-bars">' + contributions.map(item => {
      const pct = item.max > 0 ? Math.min(100, Math.round((item.points / item.max) * 100)) : 0;
      return '<div class="score-bar-row"><div class="score-bar-meta"><span>' + esc(item.label) + '</span><strong>' +
        num(item.points).toFixed(1) + ' / ' + num(item.max).toFixed(1) + '</strong></div>' +
        '<div class="score-track"><span style="width:' + pct + '%"></span></div></div>';
    }).join('') + '</div>';
  }

  function lboTrajectory(returns) {
    if (!returns || !returns.years?.length) return '';
    const w = 520, h = 230, padL = 46, padR = 16, padT = 20, padB = 34;
    const pw = w - padL - padR, ph = h - padT - padB;
    const rows = [{ year: 0, debt: returns.debt, cashBalance: 0, impliedEquity: returns.equity, ebitda: returns.price / (returns.price > 0 && returns.years[0] ? (returns.price / returns.years[0].ebitda) : 1) }, ...returns.years.map(y => ({
      year: y.year,
      debt: y.debt,
      cashBalance: y.cashBalance,
      impliedEquity: Math.max(0, y.ebitda * (returns.exitEv / returns.years.at(-1).ebitda) - y.debt + y.cashBalance),
      ebitda: y.ebitda
    }))];
    const maxStack = Math.max(10, ...rows.map(r => r.debt + r.impliedEquity));
    const slotW = pw / rows.length;
    const barW = Math.min(38, slotW * 0.56);
    const yPos = v => padT + ph - (Math.max(0, v) / maxStack) * ph;

    const bars = rows.map((r, i) => {
      const cx = padL + slotW * i + slotW / 2;
      const x = (cx - barW / 2).toFixed(1);
      const debtH = (r.debt / maxStack) * ph;
      const eqH = (r.impliedEquity / maxStack) * ph;
      const yDebt = (padT + ph - debtH).toFixed(1);
      const yEq = (padT + ph - debtH - eqH).toFixed(1);
      const tip = 'Year ' + r.year + ' · Implied Equity ' + fmtM(r.impliedEquity) + ' · Debt ' + fmtM(r.debt) + ' · Cash ' + fmtM(r.cashBalance);
      return '<g data-tooltip="' + esc(tip) + '">' +
        '<rect x="' + x + '" y="' + yEq + '" width="' + barW.toFixed(1) + '" height="' + eqH.toFixed(1) + '" fill="var(--chart-emerald)" rx="3"/>' +
        '<rect x="' + x + '" y="' + yDebt + '" width="' + barW.toFixed(1) + '" height="' + debtH.toFixed(1) + '" fill="var(--chart-slate)" rx="2"/>' +
        '<text x="' + cx.toFixed(1) + '" y="' + (h - 10) + '" text-anchor="middle" class="svg-axis">Y' + r.year + '</text>' +
        '</g>';
    }).join('');

    const grid = [0.25, 0.5, 0.75, 1].map(f => {
      const val = maxStack * f;
      const y = yPos(val).toFixed(1);
      return '<line x1="' + padL + '" y1="' + y + '" x2="' + (w - padR) + '" y2="' + y + '" stroke="var(--chart-grid)" stroke-dasharray="3 3"/>' +
        '<text x="' + (padL - 6) + '" y="' + (Number(y) + 4).toFixed(1) + '" text-anchor="end" class="svg-axis">$' + Math.round(val) + 'M</text>';
    }).join('');

    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="chart-svg" role="img" aria-label="Debt paydown and implied sponsor equity trajectory">' +
      '<title>Capital Structure & Equity Value Trajectory</title>' +
      grid + bars +
      '<line x1="' + padL + '" y1="' + (h - padB) + '" x2="' + (w - padR) + '" y2="' + (h - padB) + '" stroke="var(--chart-axis)"/>' +
      '</svg>';
  }

  function valueBridgeChart(bridge) {
    if (!bridge) return '';
    const steps = [
      { label: 'Entry Eq.', base: 0, delta: bridge.entryEquity, color: 'var(--chart-slate)', total: true },
      { label: 'EBITDA Gr.', base: bridge.entryEquity, delta: bridge.ebitdaGrowth, color: bridge.ebitdaGrowth >= 0 ? 'var(--chart-emerald)' : 'var(--chart-coral)' },
      { label: 'Mult. Exp.', base: bridge.entryEquity + bridge.ebitdaGrowth, delta: bridge.multipleExpansion, color: bridge.multipleExpansion >= 0 ? 'var(--chart-emerald)' : 'var(--chart-coral)' },
      { label: 'Delev. & Cash', base: bridge.entryEquity + bridge.ebitdaGrowth + bridge.multipleExpansion, delta: bridge.deleveraging, color: bridge.deleveraging >= 0 ? '#2b8a78' : 'var(--chart-coral)' },
      { label: 'Exit Eq.', base: 0, delta: bridge.exitEquity, color: '#15803d', total: true }
    ];
    const allVals = steps.flatMap(s => [0, s.base, s.base + s.delta, bridge.exitEquity]);
    const minV = Math.min(0, ...allVals);
    const maxV = Math.max(10, ...allVals) * 1.14;
    const span = maxV - minV || 1;
    const w = 520, h = 230, padL = 44, padR = 14, padT = 22, padB = 34;
    const ph = h - padT - padB, pw = w - padL - padR;
    const yPos = v => padT + ph - ((v - minV) / span) * ph;
    const slotW = pw / steps.length;
    const barW = Math.min(54, slotW * 0.6);

    const bars = steps.map((s, i) => {
      const topVal = Math.max(s.base, s.base + s.delta);
      const botVal = Math.min(s.base, s.base + s.delta);
      const yTop = yPos(topVal);
      const yBot = yPos(botVal);
      const barH = Math.max(3, yBot - yTop);
      const cx = padL + slotW * i + slotW / 2;
      const valLabel = (s.total ? '' : (s.delta >= 0 ? '+' : '')) + fmtM(s.delta);
      const tip = s.label + ': ' + valLabel;
      return '<g data-tooltip="' + esc(tip) + '">' +
        '<rect x="' + (cx - barW / 2).toFixed(1) + '" y="' + yTop.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + barH.toFixed(1) + '" rx="4" fill="' + s.color + '"/>' +
        '<text x="' + cx.toFixed(1) + '" y="' + (yTop - 6).toFixed(1) + '" text-anchor="middle" class="svg-val">' + esc(valLabel) + '</text>' +
        '<text x="' + cx.toFixed(1) + '" y="' + (h - 10) + '" text-anchor="middle" class="svg-axis">' + esc(s.label) + '</text>' +
        '</g>';
    }).join('');

    const zeroY = yPos(0).toFixed(1);
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="chart-svg" role="img" aria-label="Sponsor equity value creation bridge">' +
      '<title>Sponsor Equity Value Creation Bridge</title>' +
      '<line x1="' + padL + '" y1="' + zeroY + '" x2="' + (w - padR) + '" y2="' + zeroY + '" stroke="var(--chart-axis)"/>' +
      bars + '</svg>';
  }

  function sourcesUsesBar(returns) {
    if (!returns || !returns.totalUses) return '';
    const debtPct = Math.round((returns.debt / returns.totalUses) * 100);
    const eqPct = 100 - debtPct;
    const evPct = Math.round((returns.price / returns.totalUses) * 100);
    const feePct = 100 - evPct;
    return '<div class="su-bars">' +
      '<div class="su-row"><span>Sources (' + fmtM(returns.totalUses) + ')</span><div class="su-track">' +
      '<span class="su-debt" style="width:' + debtPct + '%" data-tooltip="Opening Debt: ' + fmtM(returns.debt) + ' (' + debtPct + '%)">Debt ' + debtPct + '%</span>' +
      '<span class="su-eq" style="width:' + eqPct + '%" data-tooltip="Sponsor Equity: ' + fmtM(returns.equity) + ' (' + eqPct + '%)">Equity ' + eqPct + '%</span>' +
      '</div></div>' +
      '<div class="su-row"><span>Uses (' + fmtM(returns.totalUses) + ')</span><div class="su-track">' +
      '<span class="su-ev" style="width:' + evPct + '%" data-tooltip="Purchase EV: ' + fmtM(returns.price) + ' (' + evPct + '%)">EV ' + evPct + '%</span>' +
      (feePct > 0 ? '<span class="su-fee" style="width:' + feePct + '%" data-tooltip="Fees: ' + fmtM(returns.fees) + ' (' + feePct + '%)"></span>' : '') +
      '</div></div></div>';
  }

  function thesisBacktestScatter(historyDeals, thesis) {
    if (!historyDeals?.length) return '';
    const w = 520, h = 235, padL = 44, padR = 16, padT = 18, padB = 34;
    const pw = w - padL - padR, ph = h - padT - padB;
    const maxEb = 15, maxCap = 42;
    const xPos = v => padL + (Math.max(0, Math.min(maxEb, num(v))) / maxEb) * pw;
    const yPos = v => padT + (1 - Math.max(0, Math.min(maxCap, num(v))) / maxCap) * ph;
    const minX = xPos(thesis.min), maxX = xPos(Math.min(maxEb, thesis.max)), capY = yPos(Math.min(maxCap, thesis.cap));

    const dots = historyDeals.map(d => {
      const cx = xPos(d.ebitda).toFixed(1), cy = yPos(d.concentration).toFixed(1);
      const color = d.pursue ? 'var(--chart-emerald)' : 'var(--chart-slate)';
      const tip = (d.pursue ? 'Pursued' : 'Passed') + ' · ' + d.sector + ' · ' + fmtM(d.ebitda) + ' EBITDA · ' + d.concentration + '% top customer';
      return '<circle cx="' + cx + '" cy="' + cy + '" r="4.3" fill="' + color + '" fill-opacity="' + (d.pursue ? '0.92' : '0.45') + '" data-tooltip="' + esc(tip) + '"/>';
    }).join('');

    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="chart-svg" role="img" aria-label="Historical backtest scatter of EBITDA versus customer concentration">' +
      '<title>80-Deal Historical Backtest vs Current Buy Box</title>' +
      '<rect x="' + minX.toFixed(1) + '" y="' + capY.toFixed(1) + '" width="' + Math.max(2, maxX - minX).toFixed(1) + '" height="' + Math.max(2, h - padB - capY).toFixed(1) + '" fill="var(--chart-emerald)" fill-opacity="0.1" rx="3"/>' +
      '<line x1="' + padL + '" y1="' + capY.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + capY.toFixed(1) + '" stroke="var(--chart-coral)" stroke-dasharray="4 3"/>' +
      '<line x1="' + minX.toFixed(1) + '" y1="' + padT + '" x2="' + minX.toFixed(1) + '" y2="' + (h - padB) + '" stroke="var(--chart-emerald)" stroke-dasharray="4 3"/>' +
      '<line x1="' + maxX.toFixed(1) + '" y1="' + padT + '" x2="' + maxX.toFixed(1) + '" y2="' + (h - padB) + '" stroke="var(--chart-emerald)" stroke-dasharray="4 3"/>' +
      '<text x="' + (padL - 6) + '" y="' + (capY + 4).toFixed(1) + '" text-anchor="end" class="svg-axis">' + thesis.cap + '%</text>' +
      '<text x="' + minX.toFixed(1) + '" y="' + (h - 10) + '" text-anchor="middle" class="svg-axis">$' + thesis.min + 'M</text>' +
      '<text x="' + maxX.toFixed(1) + '" y="' + (h - 10) + '" text-anchor="middle" class="svg-axis">$' + thesis.max + 'M</text>' +
      dots + '</svg>';
  }

  function portfolioPerformanceChart(entries) {
    if (!entries?.length) return '';
    const w = 520, h = 210, padL = 44, padR = 16, padT = 18, padB = 34;
    const pw = w - padL - padR, ph = h - padT - padB;
    const maxVal = Math.max(2, ...entries.flatMap(e => [num(e.ebitda), num(e.budgetEbitda)])) * 1.2;
    const slotW = pw / entries.length;
    const barW = Math.min(26, slotW * 0.34);
    const yPos = v => padT + ph - (Math.max(0, v) / maxVal) * ph;

    const bars = entries.map((e, i) => {
      const cx = padL + slotW * i + slotW / 2;
      const yA = yPos(e.ebitda), hA = (padT + ph) - yA;
      const yB = yPos(e.budgetEbitda), hB = (padT + ph) - yB;
      return '<g data-tooltip="' + esc(e.quarter + ' · Actual EBITDA ' + fmtM(e.ebitda) + ' vs Budget ' + fmtM(e.budgetEbitda)) + '">' +
        '<rect x="' + (cx - barW - 2).toFixed(1) + '" y="' + yA.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + hA.toFixed(1) + '" rx="3" fill="var(--chart-emerald)"/>' +
        '<rect x="' + (cx + 2).toFixed(1) + '" y="' + yB.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + hB.toFixed(1) + '" rx="3" fill="var(--chart-slate)" fill-opacity="0.7"/>' +
        '<text x="' + cx.toFixed(1) + '" y="' + (h - 10) + '" text-anchor="middle" class="svg-axis">' + esc(e.quarter) + '</text>' +
        '</g>';
    }).join('');

    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="chart-svg" role="img" aria-label="Quarterly actual versus budget EBITDA">' +
      '<title>Quarterly EBITDA: Actual vs Budget</title>' +
      '<line x1="' + padL + '" y1="' + (h - padB) + '" x2="' + (w - padR) + '" y2="' + (h - padB) + '" stroke="var(--chart-axis)"/>' +
      bars + '</svg>';
  }

  function compareRadar(compared) {
    if (!compared || compared.length < 2) return '';
    const w = 360, h = 250, cx = 180, cy = 125, r = 82;
    const axes = [
      { label: 'Fit Score', val: d => Math.min(1, num(d.result.fit) / 10) },
      { label: 'Scale', val: d => Math.min(1, num(d.deal.ebitda) / 14) },
      { label: 'Margin', val: d => Math.min(1, (num(d.deal.ebitda) / Math.max(1, num(d.deal.revenue))) / 0.25) },
      { label: 'Growth Cred.', val: d => Math.max(0.1, 1 - Math.max(0, d.deal.growth - d.deal.checkedGrowth) / 20) },
      { label: 'Diversif.', val: d => Math.max(0.1, 1 - num(d.deal.concentration) / 45) }
    ];
    const colors = ['#1d574b', '#d48b28', '#2c6e8f', '#b44332'];
    const rings = [0.33, 0.66, 1].map(scale => {
      const pts = axes.map((_, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
        return (cx + Math.cos(ang) * r * scale).toFixed(1) + ',' + (cy + Math.sin(ang) * r * scale).toFixed(1);
      }).join(' ');
      return '<polygon points="' + pts + '" fill="none" stroke="var(--chart-grid)"/>';
    }).join('');
    const spokes = axes.map((ax, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
      const x2 = cx + Math.cos(ang) * r, y2 = cy + Math.sin(ang) * r;
      const lx = cx + Math.cos(ang) * (r + 18), ly = cy + Math.sin(ang) * (r + 14);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="var(--chart-grid)"/>' +
        '<text x="' + lx.toFixed(1) + '" y="' + (ly + 4).toFixed(1) + '" text-anchor="middle" class="svg-axis">' + ax.label + '</text>';
    }).join('');
    const polys = compared.map((item, idx) => {
      const color = colors[idx % colors.length];
      const pts = axes.map((ax, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
        const v = ax.val(item);
        return (cx + Math.cos(ang) * r * v).toFixed(1) + ',' + (cy + Math.sin(ang) * r * v).toFixed(1);
      }).join(' ');
      return '<polygon points="' + pts + '" fill="' + color + '" fill-opacity="0.18" stroke="' + color + '" stroke-width="2" data-tooltip="' + esc(item.deal.name) + '"/>';
    }).join('');

    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="chart-svg" role="img" aria-label="Multi-deal radar comparison">' +
      '<title>Deal Profile Comparison Radar</title>' + rings + spokes + polys + '</svg>';
  }

  root.FinFlowCharts = {
    pipelineFunnel,
    pipelineScatter,
    qoeWaterfall,
    scoreBars,
    lboTrajectory,
    valueBridgeChart,
    sourcesUsesBar,
    thesisBacktestScatter,
    portfolioPerformanceChart,
    compareRadar
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
