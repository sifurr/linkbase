# Linkbase — Design System

Engineering reference for building Linkbase in **Next.js + Tailwind**. Every value here is pulled from the design-system source (`styles.css` → `tokens/*.css`, `components/*`). Anything the system does not define is marked **TBD** — do not invent it.

> **Substitutions (confirm before shipping):** fonts (Hanken Grotesk / Figtree) stand in for Linktree's private DDC Hardware / Aeonik Pro; icons are Lucide; there is no logo file (brand renders as a type wordmark). See the design-system README.

---

## Fonts

| Role | Family | CSS var | Fallback stack | Weights used |
|------|--------|---------|----------------|--------------|
| Display (headlines, wordmark) | Hanken Grotesk | `--font-display` | `-apple-system, BlinkMacSystemFont, sans-serif` | 400–900 |
| UI / body | Figtree | `--font-sans` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | 300–900 |

Loaded via Google Fonts in `tokens/fonts.css`. In Next.js prefer `next/font/google`:

```ts
import { Hanken_Grotesk, Figtree } from 'next/font/google';
export const display = Hanken_Grotesk({ subsets: ['latin'], weight: ['400','500','600','700','800','900'], variable: '--font-display' });
export const sans = Figtree({ subsets: ['latin'], weight: ['300','400','500','600','700','800','900'], variable: '--font-sans' });
```

```js
// tailwind.config — fontFamily
fontFamily: {
  display: ['var(--font-display)', 'sans-serif'],
  sans: ['var(--font-sans)', 'sans-serif'],
}
```

Weight tokens: `--fw-regular:400`, `--fw-medium:500`, `--fw-semibold:600`, `--fw-bold:700`, `--fw-extrabold:800`, `--fw-black:900`.

---

## Colors

Hex values are the source of truth (`tokens/colors.css`). The **Tailwind class** column is the suggested `tailwind.config` key — these are **proposed names**, not defined by the current system (which ships CSS variables only).

### Neutrals (warm gray)

| Token | Hex | Tailwind class | Usage |
|-------|-----|----------------|-------|
| `--white` | `#ffffff` | `bg-white` | Cards, buttons-on-dark |
| `--gray-50` | `#f7f7f5` | `bg-gray-50` | Sunken surface |
| `--gray-100` | `#efefed` | `bg-gray-100` | App + profile page background, secondary button |
| `--gray-200` | `#e5e5e2` | `bg-gray-200` | Subtle border, hover |
| `--gray-300` | `#d3d3ce` | `bg-gray-300` | Strong border, toggle track (off) |
| `--gray-400` | `#a9a9a2` | `bg-gray-400` | Tertiary text, placeholder |
| `--gray-500` | `#76766f` | `bg-gray-500` | Secondary text |
| `--gray-600` | `#54544e` | `bg-gray-600` | Body-emphasis text |
| `--gray-700` | `#3a3a35` | `bg-gray-700` | Primary-button hover |
| `--gray-900` | `#131311` | `bg-gray-900` | — |
| `--ink` | `#0e0e0e` | `bg-ink` | Primary text, near-black surfaces |
| `--black` | `#000000` | `bg-black` | Promo bar, primary button |

### Brand green

| Token | Hex | Tailwind class | Usage |
|-------|-----|----------------|-------|
| `--green-bright` | `#43e660` | `bg-green-bright` | Signature accent, highlights, wordmark on dark |
| `--green` | `#1cb454` | `bg-green` | Action green — Upgrade, toggles |
| `--green-ink` | `#0d3b1c` | `bg-green-ink` | Text/ink on green surfaces |
| `--kale` | `#254f1a` | `bg-kale` | Dark forest green, green-button hover |

### Marketing "color block" palette (one solid per full-bleed section)

| Token | Hex | Tailwind class |
|-------|-----|----------------|
| `--chartreuse` | `#e9ef6b` | `bg-chartreuse` |
| `--cobalt` | `#0b4bd1` | `bg-cobalt` |
| `--berry` | `#7a1e2e` | `bg-berry` |
| `--sage` | `#dce6cd` | `bg-sage` |
| `--grape` | `#612b9b` | `bg-grape` |
| `--blush` | `#f3c6da` | `bg-blush` |
| `--mustard` | `#e0a82e` | `bg-mustard` |

### Semantic aliases

| Alias | Resolves to | Meaning |
|-------|-------------|---------|
| `--text-primary` | `--ink` | Default text |
| `--text-secondary` | `--gray-500` | Secondary text |
| `--text-tertiary` | `--gray-400` | Muted / meta |
| `--text-on-dark` | `--white` | Text on dark surfaces |
| `--text-on-green` | `--green-ink` | Text on green |
| `--text-link` | `--ink` | Link default |
| `--text-link-hover` | `--gray-600` | Link hover |
| `--surface-page` | `--gray-100` | App/profile background |
| `--surface-card` | `--white` | Card surface |
| `--surface-sunken` | `--gray-50` | Sunken area |
| `--surface-inverse` | `--black` | Inverse surface |
| `--surface-hover` | `--gray-50` | Hover surface |
| `--border-subtle` | `--gray-200` | Hairline border |
| `--border-strong` | `--gray-300` | Emphasis border |
| `--border-focus` | `--ink` | Focus border |
| `--accent` | `--green-bright` | Accent |
| `--accent-action` | `--green` | Action accent |
| `--accent-ink` | `--green-ink` | Ink on accent |
| `--btn-primary-bg` / `-fg` | `--black` / `--white` | Primary button |
| `--btn-secondary-bg` / `-fg` | `--gray-100` / `--ink` | Secondary button |

### Suggested `tailwind.config` colors

```js
colors: {
  ink: '#0e0e0e',
  gray: { 50:'#f7f7f5',100:'#efefed',200:'#e5e5e2',300:'#d3d3ce',400:'#a9a9a2',500:'#76766f',600:'#54544e',700:'#3a3a35',900:'#131311' },
  'green-bright': '#43e660', green: '#1cb454', 'green-ink': '#0d3b1c', kale: '#254f1a',
  chartreuse:'#e9ef6b', cobalt:'#0b4bd1', berry:'#7a1e2e', sage:'#dce6cd', grape:'#612b9b', blush:'#f3c6da', mustard:'#e0a82e',
}
```

---

## Type scale

From `tokens/typography.css` (px). Line-height / tracking are separate tokens (below) — the scale does not bind a line-height per step, so pair intentionally.

| Token | Size | Suggested Tailwind | Typical use |
|-------|------|--------------------|-------------|
| `--text-xs` | 12px | `text-xs` | Micro labels, weight tags |
| `--text-sm` | 14px | `text-sm` | Meta ("0 clicks · udemy.com"), small buttons |
| `--text-base` | 16px | `text-base` | Body, link titles, inputs |
| `--text-lg` | 18px | `text-lg` | Large buttons, tab labels |
| `--text-xl` | 20px | `text-xl` | — |
| `--text-2xl` | 24px | `text-2xl` | Panel title (profile name) |
| `--text-3xl` | 30px | `text-3xl` | Section heading ("Content") |
| `--text-4xl` | 38px | `text-4xl` | Feature headline |
| `--text-5xl` | 48px | `text-5xl` | Large marketing headline |
| `--text-6xl` | 64px | `text-6xl` | Hero |
| `--text-display` | 84px | `text-[84px]` | Oversized display |

### Line height & tracking

| Token | Value | | Token | Value |
|-------|-------|---|-------|-------|
| `--leading-tight` | 1.05 | | `--tracking-tight` | -0.02em |
| `--leading-snug` | 1.2 | | `--tracking-normal` | 0 |
| `--leading-normal` | 1.4 | | `--tracking-wide` | 0.02em |
| `--leading-relaxed` | 1.6 | | | |

**Convention:** display headlines use `--font-display`, weight 800–900, `--tracking-tight`, `--leading-tight`, sentence case. Body uses `--font-sans`, weight 400–500, `--leading-normal`/`relaxed`.

---

## Spacing

4px base scale (`tokens/spacing.css`). Maps directly to Tailwind's default 4px grid (`--space-4` = 16px = `p-4`).

| Token | px | Tailwind |
|-------|----|----------|
| `--space-0` | 0 | `0` |
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

### Layout widths

| Token | Value | Use |
|-------|-------|-----|
| `--container-max` | 1200px | General max container |
| `--profile-max` | 580px | Public link-page column |
| `--sidebar-width` | 96px | Admin icon rail |

Marketing wrapper is **1120px** with **32px** side padding and **~90px** section vertical padding (from the marketing kit; not a token — treat 1120 as the marketing container).

---

## Radius

From `tokens/radius.css`.

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| `--radius-sm` | 8px | `rounded-lg` | Small thumbnails |
| `--radius-md` | 12px | `rounded-xl` | Inputs, thumbnails |
| `--radius-lg` | 16px | `rounded-2xl` | Link cards |
| `--radius-xl` | 24px | `rounded-3xl` | Panels, profile card, marketing feature cards |
| `--radius-2xl` | 32px | `rounded-[32px]` | Large panels |
| `--radius-pill` | 999px | `rounded-full` | Buttons, chips, toggles |

---

## Shadows

From `tokens/shadow.css`. Soft, low-contrast, no color.

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-xs` | `0 1px 2px rgba(16,16,16,.04)` | Link rows, subtle lift |
| `--shadow-sm` | `0 1px 3px rgba(16,16,16,.06)` | Hover, white icon buttons |
| `--shadow-card` | `0 4px 16px rgba(16,16,16,.06)` | Cards / panels |
| `--shadow-float` | `0 8px 30px rgba(16,16,16,.10)` | Phone preview, floating |
| `--shadow-pop` | `0 12px 40px rgba(16,16,16,.16)` | Popovers, join pill |

Focus ring: `--focus-ring: 0 0 0 3px rgba(28,180,84,.35)` (soft green).

```js
// tailwind.config — boxShadow
boxShadow: {
  xs:'0 1px 2px rgba(16,16,16,.04)', sm:'0 1px 3px rgba(16,16,16,.06)',
  card:'0 4px 16px rgba(16,16,16,.06)', float:'0 8px 30px rgba(16,16,16,.10)',
  pop:'0 12px 40px rgba(16,16,16,.16)',
}
```

---

## Breakpoints

**TBD.** The design system defines **no** breakpoint tokens. The UI kits are built at fixed widths (admin/marketing at 1280, profile column ≤620). Use Tailwind defaults (`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`) unless the team defines its own. Known layout intents to preserve responsively:

- Public profile: single centered column, `--profile-max` 580–620px.
- Marketing: 1120px wrapper; two-column feature sections collapse to one column on narrow screens (breakpoint TBD).
- Admin: three-region layout (rail / panel / preview) — the phone preview likely hides below `lg` (TBD).

---

## Motion

Not tokenized as variables, but consistent across components (source: component CSS). Durations are short; easing is `ease`.

| Interaction | Property | Duration / easing |
|-------------|----------|-------------------|
| Button hover | background, color, border-color | 150ms ease |
| Button press | `transform: scale(.98)` | 80ms ease |
| Icon-button press | `transform: scale(.94)` | 80ms ease |
| Profile link hover | `transform: scale(1.015)` + shadow | 120ms ease |
| Profile link press | `transform: scale(.99)` | 120ms ease |
| Input focus | background, border, box-shadow | 150ms ease |
| Toggle | track background + thumb `translateX(20px)` | 200ms ease |
| Accordion | body height + chevron `rotate(180deg)` | 200ms ease |

**Principles:** subtle and quick (80–200ms). Hover **lifts / darkens**; press **shrinks**. No bounces, no long or looping animations. Respect `prefers-reduced-motion` (system does not currently implement it — **TBD**, add on build).

---

## Backgrounds & elevation notes

- Solid fills only. **No gradients** in-product except one **protection gradient**: the public page fades to black at the bottom behind the floating join pill (`linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.92))`).
- Marketing = flat color blocks, one per section. No textures/patterns/illustration.
- Cards: white, rounded 16–24px, hairline `--border-subtle` border and/or a feather shadow — not heavy drops.
- Admin workspace is a rounded light sheet (`24px 24px 0 0`) lifting off the black promo bar.
