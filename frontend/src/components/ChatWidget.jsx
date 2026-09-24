import { useEffect, useRef, useState } from "react";
import AvaAvatar from "./AvaAvatar";
import { api } from "../api/client";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";

const GREETING = "Hi, I'm Ava, Aporum's AI assistant. Ask me about plans, billing, or switching.";

function TextChatPanel({ messages, onSend, sending }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`px-4 py-2.5 rounded-md text-sm max-w-[85%] leading-relaxed ${
              m.role === "user"
                ? "bg-ink text-white rounded-tr-none ml-auto"
                : "bg-paper text-ink/90 rounded-tl-none"
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && (
          <div className="bg-paper text-ink/50 text-sm px-4 py-2.5 rounded-md rounded-tl-none max-w-[60%]">
            Ava is typing…
          </div>
        )}
      </div>
      <form onSubmit={submit} className="border-t border-inkline p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 border border-inkline rounded-sm px-3.5 py-2.5 text-sm focus:border-ink outline-none"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-accent hover:bg-accentDark disabled:opacity-50 text-white font-semibold px-4 rounded-sm text-sm"
        >
          Send
        </button>
      </form>
    </>
  );
}

function VoicePanel({ messages, onSend, sending }) {
  const voice = useVoiceAssistant();
  const lastSpokenIndex = useRef(-1);

  // When a new assistant message arrives, speak it. When it finishes speaking,
  // the mic is ready for the customer to talk again ("speak now").
  useEffect(() => {
    const last = messages[messages.length - 1];
    const lastIndex = messages.length - 1;
    if (last && last.role === "assistant" && lastIndex !== lastSpokenIndex.current) {
      lastSpokenIndex.current = lastIndex;
      voice.speak(last.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // When the customer stops talking (recognition ends with a final transcript), send it.
  useEffect(() => {
    if (!voice.listening && voice.transcript.trim()) {
      onSend(voice.transcript.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.listening]);

  if (!voice.supported) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-muted">
        Voice mode needs a browser that supports the Web Speech API — try Chrome or Edge on
        desktop or Android.
      </div>
    );
  }

  const state = voice.speaking ? "speaking" : voice.listening ? "listening" : sending ? "thinking" : "idle";
  const stateLabel = {
    idle: "Tap the mic and speak now",
    listening: "Listening… tap to stop",
    thinking: "Ava is thinking…",
    speaking: "Ava is speaking",
  }[state];

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
      <AvaAvatar size={96} speaking={voice.speaking} />
      <p className="text-sm text-muted text-center min-h-[1.25rem]">
        {voice.listening && voice.transcript ? `"${voice.transcript}"` : stateLabel}
      </p>
      <button
        onClick={() => {
          voice.cancelSpeaking();
          voice.listening ? voice.stopListening() : voice.startListening();
        }}
        disabled={state === "thinking" || state === "speaking"}
        className={`h-16 w-16 rounded-full flex items-center justify-center transition-colors ${
          voice.listening ? "bg-accent" : "bg-ink"
        } disabled:opacity-40 text-white`}
        aria-label={voice.listening ? "Stop listening" : "Speak now"}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" />
        </svg>
      </button>
      <p className="text-xs text-muted">Last few exchanges appear below</p>
      <div className="w-full max-h-28 overflow-y-auto space-y-1.5">
        {messages.slice(-4).map((m, i) => (
          <p key={i} className={`text-xs ${m.role === "user" ? "text-ink" : "text-muted"}`}>
            <span className="font-semibold">{m.role === "user" ? "You: " : "Ava: "}</span>
            {m.content}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function ChatWidget({ open, onClose, initialMode = "text" }) {
  const [mode, setMode] = useState(initialMode);
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING }]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  const handleSend = async (text) => {
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setSending(true);
    try {
      const res = await api.sendChatMessage(text, next);
      setMessages((cur) => [...cur, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setMessages((cur) => [
        ...cur,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again shortly." },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm h-[560px] max-h-[calc(100vh-2rem)] bg-surface rounded-md shadow-2xl border border-inkline flex flex-col overflow-hidden">
      <div className="bg-ink px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AvaAvatar size={36} speaking={mode === "voice"} />
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Ava</p>
            <p className="text-white/50 text-[11px] leading-tight">Aporum Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex bg-white/10 rounded-sm p-0.5 mr-1">
            <button
              onClick={() => setMode("text")}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-sm ${mode === "text" ? "bg-white text-ink" : "text-white/70"}`}
            >
              Text
            </button>
            <button
              onClick={() => setMode("voice")}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-sm ${mode === "voice" ? "bg-white text-ink" : "text-white/70"}`}
            >
              Voice
            </button>
          </div>
          <button onClick={onClose} aria-label="Close chat" className="text-white/70 hover:text-white text-lg px-1">
            ×
          </button>
        </div>
      </div>

      {mode === "text" ? (
        <TextChatPanel messages={messages} onSend={handleSend} sending={sending} />
      ) : (
        <VoicePanel messages={messages} onSend={handleSend} sending={sending} />
      )}
    </div>
  );
}
