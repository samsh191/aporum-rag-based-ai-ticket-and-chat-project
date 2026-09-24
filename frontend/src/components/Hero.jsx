import { useEffect, useState } from "react";

// A literal utility-meter readout — the one place we reach for monospace/tabular
// digits, because it's mimicking an actual meter display, not decorating a label.
function MeterDial() {
  const [kwh, setKwh] = useState(48213.4);
  useEffect(() => {
    const id = setInterval(() => setKwh((v) => +(v + 0.1).toFixed(1)), 350);
    return () => clearInterval(id);
  }, []);
  const digits = kwh.toFixed(1).padStart(8, "0");

  return (
    <div className="rounded-md border border-inkline bg-ink p-6 shadow-[0_20px_60px_-20px_rgba(16,36,62,0.5)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-dial/80 text-xs tracking-wide font-medium">Live grid usage, VIC</span>
        <span className="flex items-center gap-1.5 text-dial text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-dial animate-pulse" />
          reading
        </span>
      </div>
      <div className="font-meter text-dial text-4xl sm:text-5xl tracking-widest bg-black/20 rounded-sm px-4 py-5 text-center">
        {digits}
        <span className="text-lg align-top ml-1 text-dial/70">kWh</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-white text-lg font-semibold font-display">3</p>
          <p className="text-white/50 text-[11px]">plans, no lock-in</p>
        </div>
        <div>
          <p className="text-white text-lg font-semibold font-display">24/7</p>
          <p className="text-white/50 text-[11px]">outage support</p>
        </div>
        <div>
          <p className="text-white text-lg font-semibold font-display">10min</p>
          <p className="text-white/50 text-[11px]">to switch online</p>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ onCompareClick, onInquireClick }) {
  return (
    <section id="top" className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <p className="text-current font-medium text-sm mb-4">Residential electricity, done plainly</p>
        <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] font-semibold text-ink">
          Power your home without the fine print.
        </h1>
        <p className="mt-6 text-lg text-muted max-w-md leading-relaxed">
          Aporum has three plans, one clear price structure, and a support team — human
          or AI — that actually answers the question you asked.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={onCompareClick}
            className="bg-ink hover:bg-ink/90 text-white font-semibold px-6 py-3.5 rounded-sm transition-colors"
          >
            Compare plans
          </button>
          <button
            onClick={onInquireClick}
            className="text-ink font-semibold px-2 py-3.5 border-b-2 border-accent hover:border-ink transition-colors"
          >
            Ask a question first
          </button>
        </div>
      </div>
      <MeterDial />
    </section>
  );
}
