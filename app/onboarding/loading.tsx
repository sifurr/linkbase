export default function OnboardingLoading() {
  return (
    <div
      className="w-full max-w-[1040px] animate-pulse md:grid md:grid-cols-[1.08fr_1fr]"
      style={{
        height: 560,
        background: "var(--lb-white)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--lb-gray-200)",
        boxShadow: "var(--shadow-lg)",
      }}
      aria-hidden
    >
      <div className="hidden md:block" />
      <div className="hidden md:block" style={{ background: "var(--lb-gold)" }} />
    </div>
  );
}
