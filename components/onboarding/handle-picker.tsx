"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  checkHandleAvailability,
  selectHandle,
} from "@/lib/onboarding/actions";
import type {
  HandleAvailability,
  HandleFormState,
} from "@/lib/onboarding/types";

// Mirrors `lib/validation/handle.ts` (the server-side source of truth) without
// pulling Zod into the client bundle.
const HANDLE_MIN = 3;
const HANDLE_MAX = 30;
const PROFILE_PREFIX = "linkbase.co/";
const CHECK_DEBOUNCE_MS = 350;
// Hoisted once: strips anything outside the allowed charset as the user types.
const STRIP_DISALLOWED = /[^a-z0-9_-]/g;

const initialState: HandleFormState = {};

const DANGER = "#b42318";
const AVAILABILITY_META: Record<
  HandleAvailability,
  { label: string; color: string }
> = {
  idle: { label: "Pick a username", color: "var(--lb-gray-500)" },
  checking: { label: "Checking…", color: "var(--lb-gray-500)" },
  "too-short": { label: "Too short", color: DANGER },
  invalid: { label: "Invalid characters", color: DANGER },
  reserved: { label: "Not available", color: DANGER },
  taken: { label: "Already taken", color: DANGER },
  available: { label: "Available", color: "var(--lb-green-700)" },
};

type HandlePickerProps = {
  suggestions: string[];
};

export function HandlePicker({ suggestions }: HandlePickerProps) {
  const [state, formAction, submitting] = useActionState(
    selectHandle,
    initialState,
  );
  const [value, setValue] = useState("");
  // Only the async result lives in state, keyed to the candidate it describes;
  // short/idle states are derived during render (no setState in the effect).
  const [remote, setRemote] = useState<{
    candidate: string;
    status: HandleAvailability;
  } | null>(null);
  const [, startCheck] = useTransition();
  const latestRequest = useRef(0);

  const candidate = value.trim();
  let availability: HandleAvailability;
  if (candidate.length === 0) {
    availability = "idle";
  } else if (candidate.length < HANDLE_MIN) {
    availability = "too-short";
  } else if (remote && remote.candidate === candidate) {
    availability = remote.status;
  } else {
    availability = "checking";
  }

  // Debounced live availability check. A per-request id guards against
  // out-of-order responses clobbering a newer keystroke.
  useEffect(() => {
    if (candidate.length < HANDLE_MIN) {
      return;
    }
    latestRequest.current += 1;
    const requestId = latestRequest.current;

    const timer = setTimeout(() => {
      startCheck(async () => {
        const result = await checkHandleAvailability(candidate);
        if (requestId === latestRequest.current) {
          setRemote({ candidate, status: result.status });
        }
      });
    }, CHECK_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [candidate]);

  function handleChange(next: string) {
    setValue(next.toLowerCase().replace(STRIP_DISALLOWED, "").slice(0, HANDLE_MAX));
  }

  const meta = AVAILABILITY_META[availability];
  const serverError = state.fieldErrors?.handle?.[0] ?? state.error;
  const previewPath = `${PROFILE_PREFIX}${value || "…"}`;
  const canSubmit = availability === "available" && !submitting;

  return (
    <div
      className="grid w-full max-w-[1040px] overflow-hidden md:grid-cols-[1.08fr_1fr]"
      style={{
        background: "var(--lb-white)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--lb-gray-200)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* Mobile-only gold bar echoing the brand panel. */}
      <div
        className="h-3 md:hidden"
        style={{ background: "var(--lb-gold)" }}
        aria-hidden
      />

      {/* Form column */}
      <div className="flex flex-col px-7 py-9 md:px-12 md:py-10">
        <div
          className="font-display text-2xl font-black tracking-[-0.03em]"
          style={{ color: "var(--lb-ink)" }}
        >
          Linkbase
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-8">
          <h1
            className="text-pretty font-display font-black"
            style={{
              fontSize: "var(--fs-display-3, 40px)",
              lineHeight: "var(--lh-display-3, 1.05)",
              letterSpacing: "var(--ls-tight)",
              margin: "0 0 14px",
            }}
          >
            Welcome to Linkbase!
          </h1>
          <p
            style={{
              fontSize: "var(--fs-lg)",
              lineHeight: "var(--lh-lg, 1.35)",
              color: "var(--text-secondary)",
              margin: "0 0 24px",
            }}
          >
            Choose your Linkbase username. You can always change it later.
          </p>

          <form action={formAction} className="flex flex-col" noValidate>
            {/* Input with profile prefix + inline availability pill */}
            <label
              className="flex items-center gap-1 rounded-2xl border transition-colors focus-within:border-lb-ink"
              style={{
                background: "var(--lb-gray-100)",
                borderColor: "transparent",
                padding: "14px 16px",
                minHeight: "56px",
              }}
            >
              <span
                style={{
                  fontSize: "var(--fs-lg)",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {PROFILE_PREFIX}
              </span>
              <input
                name="handle"
                value={value}
                onChange={(event) => handleChange(event.target.value)}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Username"
                aria-invalid={
                  availability === "taken" ||
                  availability === "reserved" ||
                  availability === "invalid" ||
                  Boolean(state.fieldErrors?.handle)
                }
                className="min-w-0 flex-1 border-none bg-transparent outline-none"
                style={{
                  fontSize: "var(--fs-lg)",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              />
              <span
                className="inline-flex items-center gap-1.5 whitespace-nowrap"
                style={{
                  fontSize: "var(--fs-sm)",
                  fontWeight: 700,
                  color: meta.color,
                }}
                aria-live="polite"
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: meta.color,
                  }}
                  aria-hidden
                />
                {meta.label}
              </span>
            </label>

            {/* Suggestions */}
            {suggestions.length > 0 ? (
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span
                  style={{ fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}
                >
                  Try:
                </span>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleChange(suggestion)}
                    className="cursor-pointer rounded-full border-none"
                    style={{
                      padding: "7px 13px",
                      background: "var(--lb-gray-100)",
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: "var(--fs-sm)",
                      color: "var(--lb-ink)",
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}

            {serverError ? (
              <p
                role="alert"
                className="mt-3"
                style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: DANGER }}
              >
                {serverError}
              </p>
            ) : null}

            <p
              style={{
                fontSize: "var(--fs-sm)",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                margin: "22px 0",
              }}
            >
              By continuing, you agree to receive offers, news and updates from
              Linkbase.
            </p>

            <Button
              type="submit"
              variant="outline"
              size="lg"
              fullWidth
              disabled={!canSubmit}
            >
              {submitting ? "Saving…" : "Continue"}
            </Button>
          </form>
        </div>
      </div>

      {/* Brand panel (desktop) */}
      <div
        className="relative hidden overflow-hidden md:block"
        style={{ background: "var(--lb-gold)" }}
        aria-hidden
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            style={{
              width: 232,
              background: "#9a6b42",
              borderRadius: 28,
              padding: 20,
              boxShadow: "var(--shadow-lg)",
              transform: "rotate(-3deg)",
            }}
          >
            <div
              className="flex items-center gap-2.5"
              style={{ color: "#fff", fontWeight: 700, fontSize: "var(--fs-body)" }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  background: "#d7b48c",
                }}
              />
              Nikole Brake
            </div>
            <div className="mt-4 flex flex-col gap-2.5">
              {["Slow flow", "Online courses", "Wellness retreats"].map((item) => (
                <div
                  key={item}
                  className="text-center"
                  style={{
                    background: "#e7dcc9",
                    borderRadius: 999,
                    padding: 12,
                    fontWeight: 600,
                    fontSize: "var(--fs-sm)",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live link preview */}
        <div
          className="absolute left-6 top-[30%]"
          style={{
            background: "var(--lb-magenta)",
            borderRadius: 16,
            padding: "13px 20px",
            color: "#fff",
            fontWeight: 700,
            boxShadow: "var(--shadow-md)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-sm)",
            maxWidth: "calc(100% - 48px)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {previewPath}
        </div>

        <div className="absolute bottom-8 left-6 flex gap-3">
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              style={{
                width: 46,
                height: 46,
                borderRadius: 999,
                background: "var(--lb-ink)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
