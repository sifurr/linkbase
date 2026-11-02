"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { createLink } from "@/lib/links/actions";
import type { LinkFormState } from "@/lib/links/types";

const initialState: LinkFormState = {};
const DANGER = "#b42318";

export function AddLinkDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createLink, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const handledRef = useRef<LinkFormState | null>(null);

  // Close + reset only once per successful submission (the action returns a new
  // state object each time), so reopening the dialog doesn't auto-close.
  useEffect(() => {
    if (state.ok && state !== handledRef.current) {
      handledRef.current = state;
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        leadingIcon={<Plus size={18} aria-hidden />}
        onClick={() => setOpen(true)}
      >
        Add
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add link"
        description="Give your link a title and paste its URL."
      >
        <form ref={formRef} action={formAction} className="flex flex-col gap-4" noValidate>
          {state.error ? (
            <p
              role="alert"
              style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: DANGER }}
            >
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-title" className="text-sm font-semibold text-lb-ink">
              Title
            </label>
            <input
              id="add-title"
              name="title"
              type="text"
              maxLength={100}
              placeholder="My portfolio"
              autoComplete="off"
              className="min-h-[52px] rounded-2xl border border-transparent px-4 outline-none focus:border-lb-ink"
              style={{
                background: "var(--lb-gray-100)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--fs-body)",
              }}
            />
            {state.fieldErrors?.title ? (
              <p className="text-xs font-medium" style={{ color: DANGER }}>
                {state.fieldErrors.title[0]}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-url" className="text-sm font-semibold text-lb-ink">
              URL
            </label>
            <input
              id="add-url"
              name="url"
              type="text"
              inputMode="url"
              placeholder="https://example.com"
              autoComplete="off"
              autoCapitalize="none"
              className="min-h-[52px] rounded-2xl border border-transparent px-4 outline-none focus:border-lb-ink"
              style={{
                background: "var(--lb-gray-100)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--fs-body)",
              }}
            />
            {state.fieldErrors?.url ? (
              <p className="text-xs font-medium" style={{ color: DANGER }}>
                {state.fieldErrors.url[0]}
              </p>
            ) : null}
          </div>

          <div className="mt-1 flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" fullWidth disabled={pending}>
              {pending ? "Adding…" : "Add link"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
