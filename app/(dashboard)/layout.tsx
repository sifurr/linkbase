import type { ReactNode } from "react";

/**
 * Shell for the protected `(dashboard)` group: the app surface background,
 * full-height. Auth is enforced by the proxy gate + each page's `requireUser`.
 */
export default function DashboardGroupLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div style={{ background: "var(--surface-app)", minHeight: "100dvh" }}>
      {children}
    </div>
  );
}
