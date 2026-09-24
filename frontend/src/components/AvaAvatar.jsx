// Ava's avatar — a real portrait photo supplied for the brand, served from
// /public so it's a static asset (no bundler processing needed). Used at
// sizes from ~34px (launcher button) up to ~96px (voice panel).
export default function AvaAvatar({ size = 56, speaking = false, className = "" }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {/* soft pulsing halo while Ava is speaking — stands in for the old
          animated-mouth cue now that the avatar is a static photo */}
      {speaking && (
        <span
          className="absolute inset-0 rounded-full bg-accent opacity-40 animate-ping"
          aria-hidden="true"
        />
      )}

      <img
        src="/ava-avatar.jpg"
        alt="Ava, the Aporum Energy AI assistant"
        width={size}
        height={size}
        className={`relative w-full h-full rounded-full object-cover border-2 transition-colors ${
          speaking ? "border-accent" : "border-white/20"
        }`}
      />

      {speaking && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent border-2 border-white"></span>
        </span>
      )}
    </div>
  );
}
