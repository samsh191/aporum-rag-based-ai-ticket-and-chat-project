import AvaAvatar from "./AvaAvatar";

export default function AssistantShowcase({ onOpenChat, onOpenVoice }) {
  return (
    <section id="assistant" className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <p className="text-current font-medium text-sm mb-3">AI assistant</p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink">
          Meet Ava. She reads the fine print so you don't have to.
        </h2>
        <p className="mt-5 text-muted leading-relaxed max-w-md">
          Ava answers questions about plans, billing, and switching using Aporum's actual
          policy documents — and knows when to hand you to a person. Chat by typing, or talk to
          her out loud.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={onOpenChat}
            className="bg-ink hover:bg-ink/90 text-white font-semibold px-6 py-3.5 rounded-sm transition-colors"
          >
            Chat with Ava
          </button>
          <button
            onClick={onOpenVoice}
            className="inline-flex items-center gap-2 text-ink font-semibold px-2 py-3.5 border-b-2 border-accent hover:border-ink transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" />
            </svg>
            Talk to Ava
          </button>
        </div>
      </div>

      <div className="rounded-md border border-inkline bg-surface p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-inkline">
          <AvaAvatar size={44} />
          <div>
            <p className="font-semibold text-ink text-sm">Ava · Aporum Assistant</p>
            <p className="text-xs text-muted">Online now</p>
          </div>
        </div>
        <div className="pt-4 space-y-3">
          <div className="bg-paper rounded-md rounded-tl-none px-4 py-3 text-sm text-ink/90 max-w-[85%]">
            Hi! I'm Ava. Are you comparing plans, or is this about an existing bill?
          </div>
          <div className="bg-ink rounded-md rounded-tr-none px-4 py-3 text-sm text-white max-w-[85%] ml-auto">
            What's the off-peak window on Family Flex?
          </div>
          <div className="bg-paper rounded-md rounded-tl-none px-4 py-3 text-sm text-ink/90 max-w-[85%]">
            Family Flex's off-peak rate of 18.2c/kWh applies from 10pm to 7am daily — great for EV
            charging or overnight laundry.
          </div>
        </div>
      </div>
    </section>
  );
}
