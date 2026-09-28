import { useEffect, useState } from "react";

const STORAGE_KEY = "aporum_test_guide_dismissed";

const STEPS = [
  {
    title: "Create ticket",
    body: 'Click on "Inquire now" button',
  },
  {
    title: "Enter details",
    body: 'You can enter mobile as 0400000000 but put any mailinator.com email to see the email',
  },
  {
    title: "Admin Dashboard",
    body: 'Copy and paste this https://aporum-rag-based-ai-ticket-and-chat.vercel.app/admin',
  },
  {
    title: "Run AI agent",
    body: 'Click "Run AI agent now"',
  },
];

export default function TestGuideModal() {
  const [open, setOpen] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) !== "1";
    } catch {
      return true;
    }
  });

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // storage unavailable, popup just won't be remembered
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60" onClick={close} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="How to test this demo"
        className="relative bg-surface rounded-md shadow-2xl flex flex-col"
        style={{ width: 384, height: 384, maxWidth: "100%", maxHeight: "100%" }}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-inkline shrink-0">
          <h3 className="font-display text-lg font-semibold text-ink">Try the demo</h3>
          <button
            onClick={close}
            aria-label="Close"
            className="text-muted hover:text-ink text-xl leading-none px-1"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          <p className="text-[13px] text-muted mb-3">
            Welcome! To test AI ticket management features:
          </p>
          <ol className="space-y-2">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-2.5">
                <span className="font-meter text-xs text-accent mt-0.5">{i + 1}</span>
                <p className="text-[13px] leading-snug text-ink/80">
                  <span className="font-semibold text-ink">{s.title}.</span> {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="px-5 py-3 border-t border-inkline shrink-0">
          <button
            onClick={close}
            className="w-full bg-accent hover:bg-accentDark text-white text-sm font-semibold py-2.5 rounded-sm transition-colors"
          >
            Got it, let's start
          </button>
          <p className="text-[11px] text-muted text-center mt-2">
            Demo site. Please avoid entering sensitive personal details.
          </p>
        </div>
      </div>
    </div>
  );
}
