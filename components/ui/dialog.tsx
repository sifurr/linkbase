"use client";

import { useEffect, useId, useRef } from "react";

import type { ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Optional description under the title. */
  description?: string;
};

/**
 * Modal built on the native `<dialog>` element, so focus trapping, `Esc` to
 * close and background inerting come from the platform (`docs/ui.md` a11y
 * notes). Backdrop styling lives in `globals.css` (`dialog.lb-dialog::backdrop`).
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  // Sync the `open` prop to the imperative dialog API.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // `Esc` (and any native close) should tell the parent to update its state.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className="lb-dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClick={(event) => {
        // A click landing on the dialog element itself is the backdrop.
        if (event.target === ref.current) onClose();
      }}
      style={{
        width: "min(440px, calc(100vw - 32px))",
        border: "none",
        borderRadius: "var(--radius-xl)",
        padding: 0,
        background: "var(--lb-white)",
        boxShadow: "var(--shadow-lg)",
        color: "var(--text-primary)",
      }}
    >
      <div style={{ padding: "24px" }}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id={titleId}
              className="font-display font-extrabold tracking-[-0.01em]"
              style={{ fontSize: "var(--fs-h3)", margin: 0 }}
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descId}
                className="mt-1"
                style={{ fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-full leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink"
            style={{
              border: "none",
              background: "var(--lb-gray-100)",
              color: "var(--lb-ink)",
              width: 32,
              height: 32,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
