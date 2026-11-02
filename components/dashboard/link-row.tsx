"use client";

import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { deleteLink, updateLink } from "@/lib/links/actions";
import type { LinkFormState, LinkView } from "@/lib/links/types";

const initialState: LinkFormState = {};
const DANGER = "#b42318";

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

type LinkRowProps = {
  link: LinkView;
};

export function LinkRow({ link }: LinkRowProps) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [editState, editAction, editPending] = useActionState(
    updateLink,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteLink,
    initialState,
  );
  const editHandled = useRef<LinkFormState | null>(null);

  // Leave edit mode once the update succeeds (the row re-renders from fresh
  // server data after revalidation).
  useEffect(() => {
    if (editState.ok && editState !== editHandled.current) {
      editHandled.current = editState;
      setEditing(false);
    }
  }, [editState]);

  const initial = link.title.trim().charAt(0).toUpperCase() || "?";

  if (editing) {
    return (
      <form
        action={editAction}
        className="flex flex-col gap-2.5 rounded-2xl p-3.5"
        style={{ background: "#fff", boxShadow: "var(--shadow-card)" }}
        noValidate
      >
        <input type="hidden" name="id" value={link.id} />
        <div className="flex flex-col gap-1">
          <input
            name="title"
            defaultValue={link.title}
            maxLength={100}
            aria-label="Title"
            className="min-h-[44px] rounded-xl border border-transparent px-3 outline-none focus:border-lb-ink"
            style={{ background: "var(--lb-gray-100)", fontSize: "var(--fs-sm)", fontWeight: 600 }}
          />
          {editState.fieldErrors?.title ? (
            <span className="text-xs font-medium" style={{ color: DANGER }}>
              {editState.fieldErrors.title[0]}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <input
            name="url"
            defaultValue={link.url}
            inputMode="url"
            autoCapitalize="none"
            aria-label="URL"
            className="min-h-[44px] rounded-xl border border-transparent px-3 outline-none focus:border-lb-ink"
            style={{ background: "var(--lb-gray-100)", fontSize: "var(--fs-sm)" }}
          />
          {editState.fieldErrors?.url ? (
            <span className="text-xs font-medium" style={{ color: DANGER }}>
              {editState.fieldErrors.url[0]}
            </span>
          ) : null}
        </div>
        {editState.error ? (
          <span role="alert" className="text-xs font-medium" style={{ color: DANGER }}>
            {editState.error}
          </span>
        ) : null}
        <div className="flex justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={editPending}>
            {editPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div
      className="flex items-center gap-3.5 rounded-2xl p-3.5"
      style={{ background: "#fff", boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="flex items-center justify-center font-black"
        style={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: "var(--radius-md)",
          background: "var(--lb-gray-100)",
          color: "var(--lb-gray-600)",
          fontSize: 18,
        }}
        aria-hidden
      >
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="truncate font-bold"
          style={{ fontSize: "var(--fs-body)" }}
          title={link.title}
        >
          {link.title}
        </div>
        <div
          className="truncate"
          style={{ fontSize: "var(--fs-sm)", color: "var(--text-muted)", fontWeight: 600 }}
        >
          0 clicks · {domainOf(link.url)}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${link.title} in a new tab`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-lb-ink hover:bg-lb-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink"
        >
          <ExternalLink size={18} aria-hidden />
        </a>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit ${link.title}`}
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-lb-ink hover:bg-lb-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink"
          style={{ border: "none", background: "transparent" }}
        >
          <Pencil size={18} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Delete ${link.title}`}
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink"
          style={{ border: "none", background: "transparent", color: DANGER }}
        >
          <Trash2 size={18} aria-hidden />
        </button>
      </div>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Delete link?"
        description={`“${link.title}” will be permanently removed.`}
      >
        <form action={deleteAction} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={link.id} />
          {deleteState.error ? (
            <p role="alert" className="text-xs font-medium" style={{ color: DANGER }}>
              {deleteState.error}
            </p>
          ) : null}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" fullWidth disabled={deletePending}>
              {deletePending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
