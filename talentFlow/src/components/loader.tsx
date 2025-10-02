

export default function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="fixed inset-0 z-[70] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex gap-2 mb-3">
        <span className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" />
      </div>
      <div className="text-lg text-blue-900 font-medium tracking-wide">{label}</div>
    </div>
  );
}
