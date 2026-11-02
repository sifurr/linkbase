import type { CSSProperties } from "react";

type AvatarProps = {
  src?: string;
  name?: string;
  size?: number;
  square?: boolean;
};

/**
 * Round (or rounded-square) image with a first-initial fallback, per
 * `docs/ui.md`. No `src` → gray fill with the uppercase first initial.
 */
export function Avatar({ src, name, size = 56, square = false }: AvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() || "?";
  const base: CSSProperties = {
    width: size,
    height: size,
    borderRadius: square ? "var(--radius-md)" : "9999px",
    flexShrink: 0,
  };

  if (src) {
    return (
      // Avatars may be arbitrary external URLs and are small, so next/image
      // buys little here.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ? `${name}'s avatar` : "User avatar"}
        width={size}
        height={size}
        style={{ ...base, objectFit: "cover" }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{
        ...base,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--lb-gray-200)",
        color: "var(--lb-gray-600)",
        fontWeight: 700,
        fontSize: Math.round(size * 0.42),
        fontFamily: "var(--font-body)",
        lineHeight: 1,
      }}
    >
      {initial}
    </span>
  );
}
