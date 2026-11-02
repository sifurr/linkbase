"use client";

import {
  Archive,
  ArrowLeft,
  Box,
  ExternalLink,
  ListChecks,
  Paintbrush,
  Settings as SettingsIcon,
  Share2,
  SlidersHorizontal,
  Sparkles,
  SquareUser,
} from "lucide-react";
import { useState } from "react";

import type { ComponentType, ReactNode } from "react";

import { LinksPanel } from "@/components/dashboard/links-panel";
import { PhonePreview } from "@/components/dashboard/phone-preview";
import { Button } from "@/components/ui/button";
import type { LinkView } from "@/lib/links/types";

type NavId = "content" | "header" | "design" | "settings";
type Tab = "links" | "shop";
type MobilePane = "editor" | "preview";

type IconType = ComponentType<{ size?: number | string }>;

const NAV: ReadonlyArray<{ id: NavId; label: string; Icon: IconType }> = [
  { id: "content", label: "Content", Icon: Box },
  { id: "header", label: "Header", Icon: SquareUser },
  { id: "design", label: "Design", Icon: Paintbrush },
  { id: "settings", label: "Settings", Icon: SettingsIcon },
];

const SECTION_COPY: Record<Exclude<NavId, "content">, { title: string; desc: string }> = {
  header: {
    title: "Header",
    desc: "Customize your profile photo, display name and bio — the top of your public page.",
  },
  design: {
    title: "Design",
    desc: "Choose a theme, colors, fonts and button styles for your Linkbase.",
  },
  settings: {
    title: "Settings",
    desc: "Manage your account, custom domain, SEO and privacy controls.",
  },
};

function NavButton({
  item,
  active,
  onClick,
}: {
  item: { label: string; Icon: IconType };
  active: boolean;
  onClick: () => void;
}) {
  const { Icon, label } = item;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className="flex cursor-pointer flex-col items-center gap-1.5 focus-visible:outline-none"
      style={{ border: "none", background: "transparent" }}
    >
      <span
        className="flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--radius-lg)",
          background: active ? "var(--lb-ink)" : "var(--lb-gray-100)",
          color: active ? "#fff" : "var(--lb-gray-600)",
        }}
      >
        <Icon size={22} />
      </span>
      <span
        style={{
          fontSize: "var(--fs-xs)",
          fontWeight: 600,
          color: active ? "var(--lb-ink)" : "var(--text-muted)",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ReadonlyArray<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      className="flex gap-1.5 rounded-full p-1"
      style={{ background: "var(--lb-gray-100)" }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className="flex-1 cursor-pointer rounded-full focus-visible:outline-none"
            style={{
              border: "none",
              padding: "10px 0",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "var(--fs-sm)",
              background: active ? "#fff" : "transparent",
              color: active ? "var(--lb-ink)" : "var(--lb-gray-600)",
              boxShadow: active ? "var(--shadow-sm)" : "none",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink"
      style={{
        width: 52,
        height: 30,
        borderRadius: 999,
        border: "none",
        background: checked ? "var(--lb-green-action)" : "var(--lb-gray-300)",
        position: "relative",
        transition: "background .15s ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 25 : 3,
          width: 24,
          height: 24,
          borderRadius: 999,
          background: "#fff",
          transition: "left .15s ease",
        }}
      />
    </button>
  );
}

function IconBtn({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-lb-ink hover:bg-lb-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink"
      style={{ border: "1px solid var(--border-subtle)", background: "transparent" }}
    >
      {children}
    </button>
  );
}

type DashboardViewProps = {
  handle: string;
  links: LinkView[];
};

export function DashboardView({ handle, links }: DashboardViewProps) {
  const [nav, setNav] = useState<NavId>("content");
  const [tab, setTab] = useState<Tab>("links");
  const [pane, setPane] = useState<MobilePane>("editor");
  const [footerOn, setFooterOn] = useState(true);

  const isContent = nav === "content";
  const navTitle = isContent ? "Content" : SECTION_COPY[nav].title;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Promo bar (static) */}
      <div
        className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 text-center"
        style={{
          background: "var(--lb-ink)",
          color: "#fff",
          fontSize: "var(--fs-sm)",
          fontWeight: 600,
        }}
      >
        <span>Elevate your design with better themes and styles.</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 md:px-7 md:py-4.5">
        <button
          type="button"
          aria-label="Back"
          className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full text-lb-ink hover:bg-lb-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink md:inline-flex"
          style={{ border: "none", background: "transparent" }}
        >
          <ArrowLeft size={22} />
        </button>

        <a
          href={`/user/${handle}`}
          className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full md:flex-none md:justify-start"
          style={{
            border: "1px solid var(--border-strong)",
            padding: "10px 18px",
            fontWeight: 600,
            fontSize: "var(--fs-body)",
          }}
        >
          <span className="truncate">linkbase.co/{handle}</span>
          <Share2 size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        </a>

        <Button
          type="button"
          variant="outline"
          size="md"
          leadingIcon={<Sparkles size={16} />}
          className="flex-shrink-0"
        >
          Enhance
        </Button>
      </div>

      {/* Mobile editor/preview toggle */}
      <div className="px-4 pb-1 md:hidden">
        <Segmented
          options={[
            { label: "Editor", value: "editor" as MobilePane },
            { label: "Preview", value: "preview" as MobilePane },
          ]}
          value={pane}
          onChange={setPane}
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 gap-6 px-4 pb-28 pt-3 md:px-7 md:pb-8">
        {/* Nav rail (desktop) */}
        <nav className="hidden flex-shrink-0 flex-col gap-5 pt-2 md:flex" aria-label="Dashboard sections">
          {NAV.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={nav === item.id}
              onClick={() => setNav(item.id)}
            />
          ))}
        </nav>

        {/* Content card */}
        <section
          className={`${pane === "editor" ? "block" : "hidden"} min-w-0 flex-1 md:block`}
          style={{
            background: "#fff",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-card)",
            padding: "24px",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <h1
              className="font-extrabold"
              style={{
                fontSize: "var(--fs-title)",
                letterSpacing: "var(--ls-snug)",
                margin: 0,
              }}
            >
              {navTitle}
            </h1>
            {isContent ? (
              <div className="flex gap-2.5">
                <IconBtn label="Reorder links">
                  <ListChecks size={18} />
                </IconBtn>
                <IconBtn label="Archive">
                  <Archive size={18} />
                </IconBtn>
              </div>
            ) : null}
          </div>

          {isContent ? (
            <>
              <div className="mt-4.5">
                <Segmented
                  options={[
                    { label: "Links", value: "links" as Tab },
                    { label: "Shop", value: "shop" as Tab },
                  ]}
                  value={tab}
                  onChange={setTab}
                />
              </div>

              {tab === "links" ? (
                <LinksPanel handle={handle} links={links} />
              ) : (
                <div
                  className="mt-11 text-center"
                  style={{ color: "var(--text-muted)", fontSize: "var(--fs-body)" }}
                >
                  No shop products yet. Add your first product to start selling.
                </div>
              )}

              <div
                className="mt-7 pt-5"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-body)" }}>
                    Linkbase footer
                  </span>
                  <Switch checked={footerOn} onChange={setFooterOn} label="Linkbase footer" />
                </div>
                <div className="mt-4 font-black" style={{ fontSize: 22, letterSpacing: "-0.03em" }}>
                  Linkbase
                </div>
              </div>
            </>
          ) : (
            <div className="px-5 py-16 text-center">
              <div
                className="mb-2 font-bold"
                style={{ fontSize: "var(--fs-lg)", color: "var(--text-primary)" }}
              >
                {SECTION_COPY[nav].title}
              </div>
              <div
                className="mx-auto"
                style={{
                  fontSize: "var(--fs-body)",
                  color: "var(--text-muted)",
                  maxWidth: 360,
                  lineHeight: 1.5,
                }}
              >
                {SECTION_COPY[nav].desc}
              </div>
            </div>
          )}
        </section>

        {/* Preview column */}
        <div
          className={`${pane === "preview" ? "flex" : "hidden"} flex-shrink-0 items-start justify-center gap-4 pt-2 md:flex`}
        >
          <PhonePreview handle={handle} links={links} />
          <div className="hidden flex-col gap-3 md:flex">
            <IconBtn label="Adjust theme">
              <SlidersHorizontal size={18} />
            </IconBtn>
            <IconBtn label="Open profile">
              <ExternalLink size={18} />
            </IconBtn>
          </div>
        </div>
      </div>

      {/* Bottom nav (mobile) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around md:hidden"
        aria-label="Dashboard sections"
        style={{
          background: "#fff",
          borderTop: "1px solid var(--border-subtle)",
          padding: "10px 8px calc(10px + env(safe-area-inset-bottom))",
          boxShadow: "0 -4px 20px rgba(0,0,0,.06)",
        }}
      >
        {NAV.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={nav === item.id}
            onClick={() => setNav(item.id)}
          />
        ))}
      </nav>
    </div>
  );
}
