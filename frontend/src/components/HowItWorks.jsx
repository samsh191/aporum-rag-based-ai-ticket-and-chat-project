const STEPS = [
  { n: "01", title: "Compare plans", body: "See daily supply charges and usage rates side by side, no login required." },
  { n: "02", title: "Ask if you're unsure", body: "Chat with Ava, our AI assistant, or book 15 minutes with a real person." },
  { n: "03", title: "Switch online", body: "We handle the transfer with your current retailer — nothing to sign or post." },
  { n: "04", title: "You're live", body: "Track usage in the app from day one, in near real time." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-ink">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-dial font-medium text-sm mb-3">How it works</p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white max-w-lg">
          Switching takes about ten minutes.
        </h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t border-white/15 pt-5">
              <span className="font-meter text-dial text-sm">{s.n}</span>
              <h3 className="font-display text-white text-lg font-semibold mt-2">{s.title}</h3>
              <p className="text-white/60 text-sm mt-2 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
