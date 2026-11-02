import { Avatar } from "@/components/ui/avatar";
import type { LinkView } from "@/lib/links/types";

type PhonePreviewProps = {
  handle: string;
  links: LinkView[];
};

/**
 * Presentational phone mock of the public profile. Driven entirely by props, so
 * it refreshes whenever the dashboard re-renders after a mutation
 * (`revalidatePath`). Purely visual — not the real `/user/[handle]` page.
 */
export function PhonePreview({ handle, links }: PhonePreviewProps) {
  return (
    <div
      style={{
        width: 300,
        maxWidth: "100%",
        background: "var(--surface-preview)",
        borderRadius: "var(--radius-2xl)",
        padding: "18px 16px 22px",
        boxShadow: "var(--shadow-float)",
      }}
    >
      <div className="flex justify-between">
        <div
          className="flex items-center justify-center font-black"
          style={{
            width: 30,
            height: 30,
            borderRadius: "var(--radius-sm)",
            background: "#fff",
          }}
        >
          L
        </div>
      </div>

      <div className="mt-2.5 text-center">
        <Avatar name={handle} size={64} />
        <div
          className="mt-2.5 font-bold"
          style={{ fontSize: "var(--fs-lg)" }}
        >
          {handle}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {links.length === 0 ? (
          <div
            className="text-center"
            style={{
              fontSize: "var(--fs-xs)",
              color: "var(--text-muted)",
              padding: "16px 8px",
            }}
          >
            Your links will appear here.
          </div>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className="text-center"
              style={{
                background: "#fff",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-sm)",
                padding: 12,
                fontSize: "var(--fs-xs)",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {link.title}
            </div>
          ))
        )}
      </div>

      <div className="mt-5 text-center">
        <span
          className="inline-flex items-center gap-1.5"
          style={{
            background: "#fff",
            boxShadow: "var(--shadow-sm)",
            fontSize: "var(--fs-xs)",
            fontWeight: 600,
            borderRadius: "var(--radius-pill)",
            padding: "8px 16px",
          }}
        >
          Join {handle} on Linkbase
        </span>
      </div>
    </div>
  );
}
