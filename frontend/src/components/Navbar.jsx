export default function Navbar({ onInquireClick, onBookClick }) {
  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-inkline">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="6" fill="#10243E" />
            <path d="M18 4 8 18h6l-2 10 12-16h-7l1-8z" fill="#FF6B35" />
          </svg>
          Aporum
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/80">
          <a href="#plans" className="hover:text-ink">Plans</a>
          <a href="#how-it-works" className="hover:text-ink">How it works</a>
          <a href="#assistant" className="hover:text-ink">AI assistant</a>
          <a href="#book" className="hover:text-ink">Talk to sales</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onBookClick}
            className="hidden sm:inline-flex text-sm font-medium text-ink/80 hover:text-ink px-3 py-2"
          >
            Book a call
          </button>
          <button
            onClick={onInquireClick}
            className="inline-flex items-center gap-1.5 bg-accent hover:bg-accentDark text-white text-sm font-semibold px-4 py-2.5 rounded-sm transition-colors"
          >
            Inquire now
          </button>
        </div>
      </div>
    </header>
  );
}
