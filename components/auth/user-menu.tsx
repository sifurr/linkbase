"use client";

import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { logOut } from "@/lib/auth/actions";

type UserMenuProps = {
  name: string | null;
  email: string;
};

/**
 * The signed-in header control: an avatar button that opens a dropdown with the
 * account identity and a sign-out action. No shared Dropdown primitive exists
 * yet, so it's built here with tokens + a Lucide icon, wired for keyboard
 * (Escape) and outside-click dismissal.
 */
export function UserMenu({ name, email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const displayName = name?.trim() || email.split("@")[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${displayName}`}
        className="flex items-center rounded-full bg-lb-white p-1.5 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink focus-visible:ring-offset-2 motion-reduce:transition-none"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <Avatar name={displayName} size={36} />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl bg-lb-white p-2"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-bold text-lb-ink">
              {displayName}
            </p>
            <p
              className="truncate text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {email}
            </p>
          </div>
          <div
            className="my-1 h-px"
            style={{ background: "var(--border-subtle)" }}
          />
          <form action={logOut}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-lb-ink transition hover:bg-lb-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink motion-reduce:transition-none"
            >
              <LogOut size={18} aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
