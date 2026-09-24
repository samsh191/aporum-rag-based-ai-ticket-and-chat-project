const PLANS = [
  {
    name: "Basic Saver",
    tagline: "Flat rate, no surprises.",
    supply: "$1.10",
    usage: "28.5c",
    bonus: "$50 sign-up credit",
    features: ["Flat usage rate, all day", "No lock-in contract", "24/7 outage support"],
    highlight: false,
  },
  {
    name: "Family Flex",
    tagline: "Cheaper power overnight.",
    supply: "$1.25",
    usage: "26.9c / 18.2c off-peak",
    bonus: "$100 sign-up credit",
    features: ["Off-peak rate 10pm–7am", "3% pay-on-time discount", "Built for EVs & dishwashers running overnight"],
    highlight: true,
  },
  {
    name: "Solar Advantage",
    tagline: "Built for homes with solar.",
    supply: "$1.35",
    usage: "27.4c",
    bonus: "$120 sign-up credit",
    features: ["6.5c/kWh feed-in tariff", "5% pay-on-time discount", "Solar-ready app monitoring"],
    highlight: false,
  },
];

function PlanCard({ plan, onSelect }) {
  return (
    <div
      className={`relative flex flex-col rounded-md border bg-surface ${
        plan.highlight ? "border-ink shadow-[0_16px_40px_-16px_rgba(16,36,62,0.35)]" : "border-inkline"
      }`}
    >
      {/* perforated tear-off edge, echoing a bill stub */}
      <div
        className="h-3 w-full"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8px 6px, transparent 4px, var(--tw-gradient-stops))",
          backgroundColor: "#F5F7FA",
        }}
      />
      <div
        aria-hidden
        className="absolute left-0 right-0 top-3 h-0 border-t border-dashed border-inkline"
      />

      <div className="p-7 flex flex-col flex-1">
        {plan.highlight && (
          <span className="self-start mb-3 text-[11px] font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-sm">
            Most popular
          </span>
        )}
        <h3 className="font-display text-2xl font-semibold text-ink">{plan.name}</h3>
        <p className="text-muted text-sm mt-1">{plan.tagline}</p>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-meter text-3xl font-semibold text-ink">{plan.supply}</span>
          <span className="text-muted text-sm">/day supply</span>
        </div>
        <p className="text-sm text-muted mt-1">{plan.usage} usage rate</p>

        <ul className="mt-6 space-y-2.5 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex gap-2 text-sm text-ink/80">
              <span className="text-accent mt-0.5">＋</span>
              {f}
            </li>
          ))}
        </ul>

        <p className="text-xs text-current font-medium mt-6">{plan.bonus}</p>

        <button
          onClick={() => onSelect(plan)}
          className={`mt-4 w-full font-semibold py-3 rounded-sm transition-colors ${
            plan.highlight
              ? "bg-accent hover:bg-accentDark text-white"
              : "bg-ink hover:bg-ink/90 text-white"
          }`}
        >
          Choose {plan.name}
        </button>
      </div>
    </div>
  );
}

export default function PlansSection({ onInquireWithPlan }) {
  return (
    <section id="plans" className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-xl">
        <p className="text-current font-medium text-sm mb-3">Plans</p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink">
          Three plans. Pick the one that matches how you live.
        </h2>
      </div>
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <PlanCard key={plan.name} plan={plan} onSelect={onInquireWithPlan} />
        ))}
      </div>
      <p className="text-xs text-muted mt-6">
        Indicative pricing for Victoria. Full terms available in your plan confirmation.
      </p>
    </section>
  );
}
