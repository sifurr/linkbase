import type { CSSProperties, InputHTMLAttributes } from "react";

type InputSize = "md" | "lg";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  prefix?: string;
  size?: InputSize;
  wrapperStyle?: CSSProperties;
};

const SIZE_STYLES: Record<InputSize, { padding: string; fontSize: string; minHeight: string }> =
  {
    md: { padding: "12px 16px", fontSize: "16px", minHeight: "48px" },
    lg: { padding: "16px 18px", fontSize: "18px", minHeight: "56px" },
  };

export function Input({
  prefix,
  size = "md",
  wrapperStyle,
  className = "",
  style,
  ...rest
}: InputProps) {
  const sizeStyle = SIZE_STYLES[size];
  return (
    <label
      className="flex items-center rounded-2xl border border-transparent transition-colors focus-within:border-lb-ink focus-within:ring-2 focus-within:ring-lb-ink focus-within:ring-offset-0"
      style={{
        background: "var(--lb-gray-100)",
        padding: sizeStyle.padding,
        minHeight: sizeStyle.minHeight,
        ...wrapperStyle,
      }}
    >
      {prefix ? (
        <span
          style={{
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
            fontSize: sizeStyle.fontSize,
            fontWeight: 500,
          }}
        >
          {prefix}
        </span>
      ) : null}
      <input
        className={`min-w-0 flex-1 border-none bg-transparent outline-none ${className}`}
        style={{
          color: "var(--text-primary)",
          fontWeight: 500,
          fontSize: sizeStyle.fontSize,
          fontFamily: "var(--font-body)",
          ...style,
        }}
        {...rest}
      />
    </label>
  );
}
