import AvaAvatar from "./AvaAvatar";

export default function ChatLauncher({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 bg-ink hover:bg-ink/90 text-white pl-2.5 pr-4 py-2.5 rounded-full shadow-lg transition-colors"
      aria-label="Chat with Ava"
    >
      <AvaAvatar size={34} />
      <span className="text-sm font-semibold">Chat with Ava</span>
    </button>
  );
}
