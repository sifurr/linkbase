# Linkbase — Design System

Foundations for building Linkbase in **Next.js + Tailwind**. Every value below is pulled from the design-system source (`styles.css` → `tokens/*.css`, components in `components/`). Anything the system does not define is marked **TBD** — do not invent it.

> **Substitutions flagged by the system (confirm before shipping):**
> - **Fonts** — DM Sans / Space Mono stand in for the real brand faces (Degular + product sans). Swap when files arrive.
> - **Icons** — Lucide stands in for the real icon set.
> - **No logo file** — the "Linkbase" wordmark is rendered in type; no mark exists.

---

## 1. Color

Hex values are the source of truth (`tokens/colors.css`). The **Tailwind class** column assumes the `tailwind.config` extension in [§1.4](#14-tailwind-config). Semantic aliases are CSS variables that point at base colors — mirror them as Tailwind semantic utilities or CSS vars.

### 1.1 Brand — marketing color blocks
One saturated background per marketing section. No gradients between sections.

| Token | Hex | Tailwind class | Use |
|---|---|---|---|
| `--lb-lime` | `#e9fd54` | `bg-lb-lime` | Hero background |
| `--lb-lime-ink` | `#1b1b1b` | `text-lb-lime-ink` | Text on lime |
| `--lb-green-spring` | `#43e660` | `bg-lb-spring` | Logo energy / bright accent |
| `--lb-cobalt` | `#2a43e8` | `bg-lb-cobalt` | "Customize" section |
| `--lb-berry` | `#7c1d3a` | `bg-lb-berry` | "Share" section |
| `--lb-purple-deep` | `#4b2a86` | `bg-lb-purple` | Bottom CTA section |
| `--lb-magenta` | `#c01fd6` | `bg-lb-magenta` | Bright card accents |
| `--lb-cream` | `#e7efc9` | `bg-lb-cream` | "Analyze" section |
| `--lb-gold` | `#e0a82e` | `bg-lb-gold` | Welcome / auth panel |
| `--lb-pink` | `#f7c8dd` | `bg-lb-pink` | Soft content card |

On dark grounds (cobalt, berry, purple), headlines flip to **lime** (`--lb-lime`) for contrast.

### 1.2 Accent — green system
| Token | Hex | Tailwind class | Use |
|---|---|---|---|
| `--lb-green-spring` | `#43e660` | `bg-lb-spring` | Logo mark, bright accents |
| `--lb-green-action` | `#22c55e` | `bg-lb-action` | Toggles, "Upgrade" chip, success |
| `--lb-green-700` | `#15803d` | `text-lb-green-700` | Green text on light |

### 1.3 Neutral ramp & product surfaces
| Token | Hex | Tailwind class | Use |
|---|---|---|---|
| `--lb-black` | `#000000` | `bg-black` | Promo bar, dark top bar |
| `--lb-ink` | `#0e0e0e` | `bg-lb-ink` / `text-lb-ink` | Primary text, black buttons |
| `--lb-gray-900` | `#1b1b1b` | `lb-gray-900` | — |
| `--lb-gray-700` | `#3d3d3d` | `lb-gray-700` | — |
| `--lb-gray-600` | `#6e6e6e` | `lb-gray-600` | Secondary text |
| `--lb-gray-500` | `#8c8c8c` | `lb-gray-500` | Muted / meta text |
| `--lb-gray-400` | `#a8a8a8` | `lb-gray-400` | — |
| `--lb-gray-300` | `#d4d4d4` | `lb-gray-300` | Switch off-track, strong border |
| `--lb-gray-200` | `#e6e6e6` | `lb-gray-200` | Borders (subtle) |
| `--lb-gray-100` | `#f2f2f2` | `lb-gray-100` | Subtle fills, secondary button |
| `--lb-white` | `#ffffff` | `bg-white` | Cards, page |
| `--lb-surface-app` | `#f6f6f6` | `bg-lb-app` | Dashboard canvas |
| `--lb-surface-preview` | `#ececee` | `bg-lb-preview` | Phone preview background |

### 1.4 Semantic aliases
Defined as CSS variables pointing at the base colors above. Recommend exposing them as CSS custom properties in `globals.css` and referencing via `var(--...)` or Tailwind arbitrary values.

| Alias | Resolves to | Hex |
|---|---|---|
| `--text-primary` | `--lb-ink` | `#0e0e0e` |
| `--text-secondary` | `--lb-gray-600` | `#6e6e6e` |
| `--text-muted` | `--lb-gray-500` | `#8c8c8c` |
| `--text-inverse` | `--lb-white` | `#ffffff` |
| `--text-link` | `--lb-ink` | `#0e0e0e` |
| `--surface-page` | `--lb-white` | `#ffffff` |
| `--surface-app` | `--lb-surface-app` | `#f6f6f6` |
| `--surface-card` | `--lb-white` | `#ffffff` |
| `--surface-sunken` | `--lb-gray-100` | `#f2f2f2` |
| `--surface-preview` | `--lb-surface-preview` | `#ececee` |
| `--border-subtle` | `--lb-gray-200` | `#e6e6e6` |
| `--border-strong` | `--lb-gray-300` | `#d4d4d4` |
| `--accent` | `--lb-green-action` | `#22c55e` |
| `--accent-contrast` | `--lb-white` | `#ffffff` |
| `--button-primary-bg` | `--lb-ink` | `#0e0e0e` |
| `--button-primary-fg` | `--lb-white` | `#ffffff` |
| `--button-secondary-bg` | `--lb-gray-100` | `#f2f2f2` |
| `--button-secondary-fg` | `--lb-ink` | `#0e0e0e` |

### Tailwind config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        lb: {
          lime: '#e9fd54', 'lime-ink': '#1b1b1b',
          spring: '#43e660', action: '#22c55e', 'green-700': '#15803d',
          cobalt: '#2a43e8', berry: '#7c1d3a', purple: '#4b2a86',
          magenta: '#c01fd6', cream: '#e7efc9', gold: '#e0a82e', pink: '#f7c8dd',
          ink: '#0e0e0e', app: '#f6f6f6', preview: '#ececee',
          gray: { 100:'#f2f2f2',200:'#e6e6e6',300:'#d4d4d4',400:'#a8a8a8',500:'#8c8c8c',600:'#6e6e6e',700:'#3d3d3d',900:'#1b1b1b' },
        },
      },
    },
  },
};
```

> **Link defaults** (`tokens/colors.css`): `a { color: var(--text-link) }` → `#0e0e0e`; `a:hover` → `#6e6e6e`. Never browser-blue.

---

## 2. Typography

Families (`tokens/typography.css`):

| Role | Stack | Tailwind |
|---|---|---|
| Display | `'DM Sans', ui-sans-serif, system-ui, …` | `font-display` |
| Body | `'DM Sans', …` (same as display) | `font-sans` |
| Mono | `'Space Mono', ui-monospace, Menlo, …` | `font-mono` |

Load via `next/font/google` (DM Sans opsz 9–40, weights 400–900 + italic 400; Space Mono 400/700).

### 2.1 Weights
| Token | Value |
|---|---|
| `--fw-regular` | 400 |
| `--fw-medium` | 500 |
| `--fw-semibold` | 600 |
| `--fw-bold` | 700 |
| `--fw-extrabold` | 800 |
| `--fw-black` | 900 |

### 2.2 Display scale (marketing)
| Token | Size | Line-height | Weight | Tracking |
|---|---|---|---|---|
| `display-1` | 72px | 0.98 | 900 | `-0.02em` |
| `display-2` | 52px | 1.02 | 900 | `-0.02em` |
| `display-3` | 40px | 1.05 | 800 | `-0.02em` |

### 2.3 UI / product scale
| Token | Size | Line-height | Typical weight |
|---|---|---|---|
| `title` | 32px | 1.1 | 800 (`-0.01em`) |
| `h2` | 24px | 1.15 | 700 |
| `h3` | 20px | 1.2 | 700 |
| `lg` | 18px | 1.35 | 500–700 |
| `body` | 16px | 1.5 | 400 |
| `sm` | 14px | 1.45 | 500 |
| `xs` | 12px | 1.4 | 400 (meta) |

### 2.4 Letter-spacing
| Token | Value | Use |
|---|---|---|
| `--ls-tight` | `-0.02em` | Display headlines |
| `--ls-snug` | `-0.01em` | Titles, buttons |
| `--ls-normal` | `0` | Body |

> Apply `text-wrap: pretty` (`[text-wrap:pretty]`) to long headings.

---

## 3. Spacing

4px base ramp (`tokens/spacing.css`). Maps directly to Tailwind's default scale (`--space-4` = 16px = `p-4`).

| Token | px | Tailwind |
|---|---|---|
| `--space-1` | 4 | `1` |
| `--space-2` | 8 | `2` |
| `--space-3` | 12 | `3` |
| `--space-4` | 16 | `4` |
| `--space-5` | 20 | `5` |
| `--space-6` | 24 | `6` |
| `--space-8` | 32 | `8` |
| `--space-10` | 40 | `10` |
| `--space-12` | 48 | `12` |
| `--space-16` | 64 | `16` |
| `--space-20` | 80 | `20` |
| `--space-24` | 96 | `24` |

**Content widths:** `--width-link-column: 580px` (public-profile link stack; kits use ~680px container), `--width-content: 1120px` (marketing max).

---

## 4. Radius

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `--radius-xs` | 6px | `rounded-[6px]` | — |
| `--radius-sm` | 8px | `rounded-lg` | Small tiles |
| `--radius-md` | 12px | `rounded-xl` | Preview cards, thumbnails |
| `--radius-lg` | 16px | `rounded-2xl` | Link rows, inputs |
| `--radius-xl` | 24px | `rounded-3xl` | Dashboard cards |
| `--radius-2xl` | 28px | `rounded-[28px]` | Phone preview shell |
| `--radius-3xl` | 36px | `rounded-[36px]` | Large marketing panels |
| `--radius-pill` | 999px | `rounded-full` | Buttons, badges, URL pills, nav tiles, toggles |

> **Rule:** buttons, badges, URL pills, nav icon tiles, and toggles are **always full pills**.

---

## 5. Shadows

Subtle, cool, low-spread (`tokens/shadow.css`). Cards use shadow, not borders.

| Token | Value | Use |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,.04)` | Hairline lift |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)` | Chips, small tiles |
| `--shadow-card` | `0 0 0 1px rgba(0,0,0,.02), 0 2px 8px rgba(0,0,0,.06)` | **Default card surface** |
| `--shadow-md` | `0 6px 20px rgba(0,0,0,.08)` | Card hover |
| `--shadow-lg` | `0 16px 40px rgba(0,0,0,.12)` | Toasts, overlays |
| `--shadow-float` | `0 8px 28px rgba(0,0,0,.14)` | Floating phone preview |

```js
// tailwind.config — boxShadow extend
boxShadow: {
  'lb-sm': '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
  'lb-card': '0 0 0 1px rgba(0,0,0,.02), 0 2px 8px rgba(0,0,0,.06)',
  'lb-md': '0 6px 20px rgba(0,0,0,.08)',
  'lb-lg': '0 16px 40px rgba(0,0,0,.12)',
  'lb-float': '0 8px 28px rgba(0,0,0,.14)',
}
```

---

## 6. Breakpoints

**TBD** — the design system defines no breakpoint tokens. The kits were authored at fixed widths (marketing ~1120px content, dashboard ~1280px three-column, public profile ~680px). Use Tailwind defaults (`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`) unless the team standardizes otherwise. Mobile/responsive behavior of the dashboard three-column shell is **TBD**.

---

## 7. Motion

Restrained. No bounces, parallax, or decorative animation.

| Property | Value |
|---|---|
| Transition duration | ~120ms (buttons/cards), ~150ms (nav/tabs/color), ~180ms (toggle) |
| Easing | `ease` |
| **Hover** — card | shadow `card` → `md`; lift only |
| **Hover** — button | `filter: brightness(0.95)` |
| **Hover** — icon button | `filter: brightness(0.95)` |
| **Press** — button | `transform: scale(0.97)` |
| **Press** — card | `transform: scale(0.99)` |
| **Toggle** | track color crossfade + knob `translateX(22px)`, 180ms ease |

```css
/* representative */
transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
```

Reduced-motion handling is **TBD** — wrap transitions in `@media (prefers-reduced-motion: reduce)` guards when implementing.
