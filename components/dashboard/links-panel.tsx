import { Avatar } from "@/components/ui/avatar";
import { AddLinkDialog } from "@/components/dashboard/add-link-dialog";
import { LinkRow } from "@/components/dashboard/link-row";
import type { LinkView } from "@/lib/links/types";

type LinksPanelProps = {
  handle: string;
  links: LinkView[];
};

export function LinksPanel({ handle, links }: LinksPanelProps) {
  return (
    <div>
      <div className="my-5 flex items-center gap-4">
        <Avatar name={handle} size={56} />
        <div>
          <div className="font-bold" style={{ fontSize: "var(--fs-lg)" }}>
            {handle}
          </div>
          <span
            style={{
              fontSize: "var(--fs-body)",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            @{handle}
          </span>
        </div>
      </div>

      <AddLinkDialog />

      {links.length === 0 ? (
        <div
          className="mt-8 text-center"
          style={{ color: "var(--text-muted)", fontSize: "var(--fs-body)" }}
        >
          No links yet. Add your first link to get started.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3.5">
          {links.map((link) => (
            <LinkRow key={link.id} link={link} />
          ))}
        </div>
      )}
    </div>
  );
}
