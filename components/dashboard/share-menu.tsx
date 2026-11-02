"use client";

import { Check, ExternalLink, Link2, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ShareMenuProps = {
  handle: string;
};

type ShareTarget = {
  id: string;
  label: string;
  color: string;
  path: string;
  href: (url: string, text: string) => string;
};

// SimpleIcons brand paths, inlined so the share feature stays self-contained.
const SHARE_TARGETS: ReadonlyArray<ShareTarget> = [
  {
    id: "x",
    label: "X",
    color: "#000000",
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
    href: (url, text) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    href: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
    href: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
];

function BrandIcon({ path, color }: { path: string; color: string }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

/**
 * The dashboard "share" control: a pill showing the public URL that, instead of
 * navigating to the profile, opens a popover of social share targets plus a
 * copy-link action. Built client-side for the toggle/clipboard/native-share
 * interactions, with Escape + outside-click dismissal (matching `UserMenu`).
 */
export function ShareMenu({ handle }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayUrl = `linkbase.co/${handle}`;
  const profilePath = `/user/${handle}`;

  // Resolve the absolute, shareable URL only in the browser to avoid a
  // hydration mismatch; fall back to the branded display URL on the server.
  function shareUrl() {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${profilePath}`;
    }
    return `https://${displayUrl}`;
  }

  const shareText = `Check out my Linkbase: ${displayUrl}`;

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

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — leave state unchanged.
    }
  }

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1 md:flex-none">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Share your Linkbase, ${displayUrl}`}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink md:w-auto md:justify-start"
        style={{
          border: "1px solid var(--border-strong)",
          padding: "10px 18px",
          fontWeight: 600,
          fontSize: "var(--fs-body)",
          background: "transparent",
          color: "var(--lb-ink)",
        }}
      >
        <span className="truncate">{displayUrl}</span>
        <Share2 size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Share your Linkbase"
          className="absolute left-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-lb-white p-2"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <div className="px-3 py-2">
            <p className="text-sm font-bold text-lb-ink">Share your Linkbase</p>
            <p
              className="truncate text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {displayUrl}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-1.5 px-2 py-1">
            {SHARE_TARGETS.map((target) => (
              <a
                key={target.id}
                role="menuitem"
                href={target.href(shareUrl(), shareText)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                aria-label={`Share on ${target.label}`}
                className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 transition hover:bg-lb-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink motion-reduce:transition-none"
              >
                <BrandIcon path={target.path} color={target.color} />
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  {target.label}
                </span>
              </a>
            ))}
          </div>

          <div
            className="my-1 h-px"
            style={{ background: "var(--border-subtle)" }}
          />

          <button
            type="button"
            role="menuitem"
            onClick={handleCopy}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-lb-ink transition hover:bg-lb-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink motion-reduce:transition-none"
          >
            {copied ? (
              <Check size={18} aria-hidden="true" style={{ color: "var(--lb-green-action)" }} />
            ) : (
              <Link2 size={18} aria-hidden="true" />
            )}
            {copied ? "Link copied" : "Copy link"}
          </button>

          <a
            role="menuitem"
            href={profilePath}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-lb-ink transition hover:bg-lb-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink motion-reduce:transition-none"
          >
            <ExternalLink size={18} aria-hidden="true" />
            Open profile
          </a>
        </div>
      ) : null}
    </div>
  );
}
