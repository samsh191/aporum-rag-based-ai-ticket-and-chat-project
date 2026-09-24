export default function BookCallSection({ onBookClick }) {
  return (
    <section id="book" className="max-w-6xl mx-auto px-6 py-20">
      <div className="rounded-md bg-current text-white px-8 sm:px-14 py-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="max-w-lg">
          <h2 className="font-display text-3xl font-semibold">Rather talk it through?</h2>
          <p className="mt-3 text-white/75 leading-relaxed">
            Book fifteen minutes with a Aporum sales specialist. It'll land straight in your
            calendar, with a confirmation email to you and to us.
          </p>
        </div>
        <button
          onClick={onBookClick}
          className="shrink-0 bg-accent hover:bg-accentDark text-white font-semibold px-7 py-4 rounded-sm transition-colors"
        >
          Book a call
        </button>
      </div>
    </section>
  );
}
