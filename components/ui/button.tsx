import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "action" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

const VARIANT_STYLES: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "var(--button-primary-bg, var(--lb-ink))",
    color: "var(--lb-white)",
    border: "1px solid var(--lb-ink)",
  },
  secondary: {
    background: "var(--lb-gray-100)",
    color: "var(--lb-ink)",
    border: "1px solid transparent",
  },
  outline: {
    background: "var(--lb-white)",
    color: "var(--lb-ink)",
    border: "1px solid var(--border-strong)",
  },
  action: {
    background: "var(--lb-green-action)",
    color: "var(--lb-white)",
    border: "1px solid var(--lb-green-action)",
  },
  ghost: {
    background: "transparent",
    color: "var(--lb-ink)",
    border: "1px solid transparent",
  },
};

const SIZE_STYLES: Record<ButtonSize, CSSProperties & { "--icon-gap": string }> =
  {
    sm: { padding: "8px 16px", fontSize: "14px", minHeight: "36px", "--icon-gap": "6px" },
    md: { padding: "12px 22px", fontSize: "16px", minHeight: "48px", "--icon-gap": "8px" },
    lg: { padding: "16px 28px", fontSize: "18px", minHeight: "56px", "--icon-gap": "10px" },
  };

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  children,
  className = "",
  style,
  type = "button",
  ...rest
}: ButtonProps) {
  const sizeStyle = SIZE_STYLES[size];
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full leading-none transition hover:brightness-95 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-ink focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100 ${className}`}
      style={{
        ...VARIANT_STYLES[variant],
        ...sizeStyle,
        gap: sizeStyle["--icon-gap"],
        fontWeight: 700,
        letterSpacing: "-0.01em",
        fontFamily: "var(--font-body)",
        cursor: "pointer",
        width: fullWidth ? "100%" : undefined,
        ...style,
      }}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
