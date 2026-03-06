interface Benefit {
  text: string;
  checked: boolean;
}

interface PricingCardProps {
  tier: string;
  price: string;
  bestFor: string;
  CTA: string;
  benefits: Benefit[];
  highlighted?: boolean;
  href?: string;
}

export function PricingCard({
  tier,
  price,
  bestFor,
  CTA,
  benefits,
  highlighted = false,
  href,
}: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-6 gap-5 border transition-all ${
        highlighted
          ? "bg-gradient-to-b from-indigo-950/60 to-[#0d1117] border-indigo-500/40"
          : "bg-[#0d1117] border-white/8"
      }`}
      style={
        highlighted
          ? { boxShadow: "0 0 40px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.06)" }
          : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }
      }
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[#8b949e] mb-1">{bestFor}</p>
        <h3 className="text-xl font-bold text-[#f0f6fc]">{tier}</h3>
        <p className="text-3xl font-bold text-[#f0f6fc] mt-2">{price}</p>
      </div>

      <ul className="flex flex-col gap-2 flex-1">
        {benefits.map((b) => (
          <li key={b.text} className="flex items-center gap-2 text-sm">
            {b.checked ? (
              <span className="text-indigo-400 font-bold">✓</span>
            ) : (
              <span className="text-[#8b949e]">✗</span>
            )}
            <span className={b.checked ? "text-[#f0f6fc]" : "text-[#8b949e]"}>{b.text}</span>
          </li>
        ))}
      </ul>

      <a
        href={href ?? "#"}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        className={`block text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
          highlighted
            ? "bg-indigo-500 text-white hover:bg-indigo-400"
            : "bg-white/8 text-[#f0f6fc] hover:bg-white/12 border border-white/10"
        }`}
        style={highlighted ? { boxShadow: "0 0 20px rgba(99,102,241,0.35)" } : {}}
      >
        {CTA}
      </a>
    </div>
  );
}
