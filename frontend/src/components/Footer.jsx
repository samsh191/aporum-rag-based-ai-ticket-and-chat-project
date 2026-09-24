export default function Footer() {
  return (
    <footer className="border-t border-inkline">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted">
        <p>© {new Date().getFullYear()} Aporum Energy. A demo retailer for illustration purposes.</p>
        <div className="flex gap-6">
          <a href="#plans" className="hover:text-ink">Plans</a>
          <a href="#assistant" className="hover:text-ink">Assistant</a>
          <a href="#book" className="hover:text-ink">Book a call</a>
        </div>
      </div>
    </footer>
  );
}
