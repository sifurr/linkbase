export default function DashboardLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div
        className="h-8 w-40 animate-pulse rounded-lg"
        style={{ background: "var(--lb-gray-100)" }}
        aria-hidden
      />
    </main>
  );
}
