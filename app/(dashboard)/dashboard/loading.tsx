export default function DashboardLoading() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="h-11" style={{ background: "var(--lb-ink)" }} aria-hidden />
      <div className="flex flex-1 gap-6 px-4 pt-6 md:px-7">
        <div className="hidden w-14 flex-shrink-0 md:block" aria-hidden />
        <div
          className="min-w-0 flex-1 animate-pulse"
          style={{
            background: "#fff",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-card)",
            height: 420,
          }}
          aria-hidden
        />
        <div
          className="hidden flex-shrink-0 animate-pulse md:block"
          style={{
            width: 300,
            height: 480,
            background: "var(--surface-preview)",
            borderRadius: "var(--radius-2xl)",
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
