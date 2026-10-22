"use client";

import { useState } from "react";
import { ArrowRight, Check, Coins } from "lucide-react";

const tiers = [
  { threshold: 50000, bonus: 2500, label: "Foundation", storage: "1 year of storage" },
  { threshold: 100000, bonus: 7500, label: "Sovereign", storage: "3 years of storage" },
  { threshold: 250000, bonus: 15000, label: "Legacy", storage: "3 years of segregated storage" },
];
const usd = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function SilverExplorer({ onRequest }: { onRequest: () => void }) {
  const [amount, setAmount] = useState(100000);
  const tier = [...tiers].reverse().find(item => amount >= item.threshold);
  return <section className="silver-explorer" id="silver-offer" aria-labelledby="silver-heading">
    <div className="container explorer-layout">
      <div className="explorer-copy">
        <div className="eyebrow dark">A LITTLE MORE TO BUILD ON</div>
        <h2 id="silver-heading">Explore your<br/><span>silver possibilities.</span></h2>
        <p>Move the slider to discover how our proposed silver tiers could complement a qualifying allocation.</p>
        <div className="explorer-demo"><span/> ILLUSTRATIVE OFFER EXPLORER</div>
        <p className="explorer-disclaimer">These are proposed demo tiers, not active offers or a recommendation. Final pricing, eligibility, storage fees, product mix, and written terms require confirmation. Incentive costs may be reflected in dealer pricing.</p>
      </div>
      <div className="explorer-panel">
        <div className="explorer-input"><label htmlFor="allocation">Explore an allocation</label><output htmlFor="allocation">{usd(amount)}</output></div>
        <input id="allocation" type="range" min="25000" max="500000" step="5000" value={amount} onChange={e => setAmount(Number(e.target.value))} aria-valuetext={usd(amount)} style={{ background: `linear-gradient(to right, #ba924a ${(amount - 25000) / 4750}%, #deded6 ${(amount - 25000) / 4750}%)` }}/>
        <div className="range-labels"><span>$25,000</span><span>$500,000</span></div>
        <div className="explorer-result" aria-live="polite"><div className="explorer-result-icon"><Coins size={27} strokeWidth={1.4}/></div><div><span>ILLUSTRATIVE SILVER BONUS</span><strong>{tier ? `Up to ${usd(tier.bonus)}` : "Tiers start at $50,000"}</strong><small>{tier ? `${tier.label} tier · proposed ${tier.storage} waiver` : "Adjust the slider to explore the proposed tiers."}</small></div></div>
        <div className="tier-buttons" aria-label="Choose an illustrative tier">{tiers.map(item => <button key={item.label} type="button" className={tier?.label === item.label ? "selected" : ""} onClick={() => setAmount(item.threshold)} aria-pressed={tier?.label === item.label}><span>{item.label} {tier?.label === item.label && <Check size={12}/>}</span><strong>{usd(item.threshold)}+</strong><small>Up to {usd(item.bonus)} silver</small></button>)}</div>
        <button className="button primary" onClick={onRequest}>Explore the details in my guide <ArrowRight size={17}/></button>
      </div>
    </div>
  </section>;
}
