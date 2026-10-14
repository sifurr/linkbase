# Linkbase — UI Components & Patterns

Component reference for the Next.js + Tailwind build. Every component below exists in the design system (`components/*`) with a props contract (`.d.ts`). Props, variants, and states are taken from source — anything the source doesn't define is **TBD**.

All components read CSS custom properties (see `design-system.md`). Style values quoted here are the source's exact numbers — **copy them, don't round**.

---

## Buttons

### Button
Fully-rounded pill. The primary action element across admin, profile, and marketing.

**Props:** `variant`, `size`, `fullWidth`, `leftIcon`, `rightIcon`, `as` ('button' | 'a'), + native button attrs.

| Variant | Resting | Hover |
|---------|---------|-------|
| `primary` (default) | bg `--btn-primary-bg` (black), fg white | bg `--gray-700` |
| `secondary` | bg `--gray-100`, fg `--ink` | bg `--gray-200` |
| `green` | bg `--accent-action` (`#1cb454`), fg white | bg `--kale` |
| `outline` | bg white, fg ink, 1px `--border-strong` | bg `--surface-hover` |
| `ghost` | transparent, fg ink | bg `--gray-100` |

| Size | Height | Padding | Font size |
|------|--------|---------|-----------|
| `sm` | 36px | 0 16px | `--text-sm` (14) |
| `md` (default) | 44px | 0 20px | `--text-base` (16) |
| `lg` | 56px | 0 28px | `--text-lg` (18) |

**States:** hover per table · `:active` → `scale(.98)` · `:disabled` → `opacity .4`, `cursor:not-allowed`, no transform. Weight 600, `gap:8px` between icon and label. Icons sized `1.1em`.

```tsx
<Button variant="primary" size="md" leftIcon={<Plus/>}>Add</Button>
<Button variant="green" leftIcon={<Zap/>}>Upgrade</Button>
<Button variant="outline" fullWidth>Continue</Button>
```

### IconButton
Circular, icon-only. Toolbar actions (share, archive), floating profile controls.

**Props:** `variant`, `size`, `label` (required, a11y), `children` (icon).

| Variant | Style |
|---------|-------|
| `soft` (default) | bg `--gray-100`; hover `--gray-200` |
| `solid` | bg `--ink`, white icon; hover `--gray-700` |
| `white` | bg white, `--shadow-sm`; hover `--surface-hover` |
| `ghost` | transparent, `--gray-500`; hover bg `--gray-100`, icon ink |

| Size | Box | Icon |
|------|-----|------|
| `sm` | 32×32 | 16px |
| `md` (default) | 44×44 | 20px |
| `lg` | 52×52 | 22px |

**States:** `:active` → `scale(.94)` · `:disabled` → `opacity .4`. **Always pass `label`** → renders `aria-label`.

---

## Forms

### Input
Filled text field, soft-gray at rest → white with green focus ring when active.

**Props:** `label`, `prefix` (inline static text, e.g. `linkbase.to/`), `hint`, `error`, + native input attrs.

**Anatomy:** optional label (14px, 600) → field (height **52px**, bg `--gray-100`, radius `--radius-md`, padding `0 16px`) → optional hint/error (12px).

| State | Style |
|-------|-------|
| Rest | bg `--gray-100`, transparent border |
| Focus (`:focus-within`) | bg white, border `--border-strong`, box-shadow `--focus-ring` |
| Invalid (`error` set) | border `--berry`; hint text turns `--berry` |
| Prefix | `--gray-500`, non-editable, sits inline before input |

Placeholder: `--gray-400`, regular weight. `error` overrides `hint` in the message slot and flips the invalid style.

```tsx
<Input label="Username" prefix="linkbase.to/" placeholder="yourname" />
<Input label="Email" error="Enter a valid email" />
```

### Toggle
Pill switch — green when on.

**Props:** `checked` (controlled), `defaultChecked` (uncontrolled), `onChange`, `disabled`, `label`.

- Track **48×28**, thumb **22px** white with `--shadow-sm`, radius pill.
- Off: track `--gray-300`. On (`:checked`): track `--accent-action`, thumb `translateX(20px)`.
- Focus-visible: `--focus-ring`. Disabled: `opacity .4`.
- Transition 200ms ease. Underlying native `<input type="checkbox">` is visually hidden (keeps a11y semantics).

---

## Navigation

### SidebarNav
Vertical icon+label rail for the admin console. Active item's icon sits in a filled black circle.

**Props:** `items` (`{id,label,icon}[]`), `active` (id), `onSelect(id)`.

- Rail width `--sidebar-width` (96px), items stacked, `gap:22px`.
- Icon in a 48px circle; label 12px/600 below.
- Resting: `--gray-500`. Hover: icon bg `--gray-100`, color ink. **Active:** icon bg `--ink` + white, label ink. Renders `aria-current="page"` on the active item.

### Tabs
Underline tab bar (e.g. Links / Shop).

**Props:** `tabs` (`{id,label}[]` or `string[]`), `active`, `onSelect`.

- Row with `gap:24px`, 1px `--border-subtle` bottom border.
- Tab: 18px/600, `--gray-400`; hover `--gray-600`. **Active:** `--ink` + 2px ink underline (`::after`).
- `role="tablist"` / `role="tab"` / `aria-selected` are set. **Note:** tab *panels* aren't part of this component — wire `role="tabpanel"` + `aria-labelledby` yourself (**TBD**).

---

## Data display

### Avatar
Circular image with fallback: initial (from `name`) → neutral person glyph.

**Props:** `src`, `alt`, `name`, `size`.

| Size | px | Font (initial) |
|------|----|----|
| `xs` | 32 | 13 |
| `sm` | 44 | 16 |
| `md` (default) | 64 | 22 |
| `lg` | 96 | 34 |
| `xl` | 128 | 46 |

Image `object-fit:cover`. Fallback bg `--gray-300`, glyph `--gray-500`.

### Card
White rounded surface — base container for panels and content blocks.

**Props:** `elevation` ('shadow' | 'bordered' | 'flat'), `padding` ('none'|'sm'|'md'|'lg'), + native div attrs.

| elevation | Style | | padding | Value |
|-----------|-------|---|---------|-------|
| `shadow` (default) | `--shadow-card` | | `none` | 0 |
| `bordered` | 1px `--border-subtle` | | `sm` | 16px |
| `flat` | none | | `md` (default) | 24px |
| | | | `lg` | 32px |

Radius `--radius-xl` (24px) always.

### Badge
Pill chip / tag. Profile URL pill, "Join …" prompts, status.

**Props:** `variant`, `size`, `leftIcon`, + native span attrs.

| Variant | Style |
|---------|-------|
| `white` | bg white, ink, `--shadow-sm` |
| `dark` | bg `--ink`, white |
| `green` | bg `--accent` (`#43e660`), `--accent-ink` |
| `soft` (default) | bg `--gray-100`, `--gray-600` |

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `sm` | 24px | 0 10px | 12px |
| `md` (default) | 34px | 0 16px | 14px |

Weight 600, `gap:6px`, icon `1em`. Static / non-interactive.

---

## Links (signature primitives)

### LinkRow
Admin-side editable link row.

**Props:** `title`, `clicks` (number), `domain`, `thumb` (img url), `thumbIcon` (glyph when no image), `onMenu`.

- Layout: 52px thumbnail (radius `--radius-md`) → body (title 16/700 truncated + meta) → 36px kebab button.
- Meta line: `<b>{clicks} clicks</b> · {domain}` — bold count in `--gray-600`, rest `--gray-500`.
- Container: white, 1px `--border-subtle`, radius `--radius-lg`, `--shadow-xs`; hover → `--shadow-sm`.
- Kebab: 36px circle, `--gray-500`; hover bg `--gray-100`, ink. **Menu content is TBD** — `onMenu` fires; the dropdown itself is not in the system.

### ProfileLinkButton
Public-page link button a visitor taps. Renders as `<a>`.

**Props:** `title`, `href`, `thumb`, `media` (bool), `leftThumb`, `onMenu`.

| Layout | When | Shape |
|--------|------|-------|
| Plain (default) | no `media` | min-height 60px, centered bold title, padding `16px 48px` |
| `media` | `media && thumb` | full-width 16:9 cover image above the title, `overflow:hidden` |
| `leftThumb` | non-media | 44px square thumbnail pinned left |

- Surface: white, radius `--radius-lg`, `--shadow-xs`.
- **Hover:** `scale(1.015)` + `--shadow-sm`. **Press:** `scale(.99)`.
- Kebab (share) pinned right (bottom-right in media layout); `stopPropagation` so it doesn't trigger the link.
- Title 16/700, centered, `--leading-snug`.

---

## Profile

### ProfileHeader
Centered identity block for the public page.

**Props:** `avatar` (node), `name`, `bio`, `socials` (`{label,href,icon}[]`).

- Column, centered, `gap:16px`.
- Name: `--text-2xl` (24), weight 800, `--tracking-tight`.
- Bio: 16px, `--gray-600`, max-width 400, `--leading-normal`.
- Socials: row, `gap:18px`, 26px icons, ink; hover `opacity .6`. Each is an `<a aria-label={label}>`.

---

## Disclosure

### Accordion
Single-open FAQ. One item open at a time.

**Props:** `items` (`{q,a}[]`), `onDark` (bool — for color-block sections), `defaultOpen` (index, `-1` = all closed).

- Item: radius `--radius-md`, white + 1px `--border-subtle`. `onDark`: bg `rgba(255,255,255,.06)`, border `rgba(255,255,255,.12)`, white text.
- Header: full-width button, 18/600, question left + chevron right; padding `20px 22px`.
- Body: height-animated (200ms), inner padding `0 22px 22px`, 16px `--leading-relaxed`, `--gray-600` (on-dark: `rgba(255,255,255,.75)`).
- Chevron rotates 180° when open. Header sets `aria-expanded`. **Note:** wire `aria-controls` → panel id for full a11y (**TBD**).

---

## Layout patterns

### Public profile page
Light-gray page (`--surface-page`), single centered column (`--profile-max` ≤620px), `20px` side padding, ~160px bottom padding to clear the banner.
- Top row: brand mark (left) + share IconButton (right).
- `ProfileHeader` → stack of `ProfileLinkButton` (`gap:16px`) → centered footer links (13/500, `·` separators).
- **Join banner:** fixed to bottom, 180px tall protection gradient (transparent → `rgba(0,0,0,.92)`), a white URL pill (`--shadow-pop`) with a dismiss button + "Join … on Linkbase" caption. Gradient is `pointer-events:none`; the pill re-enables pointer events.

### Admin console
Black promo bar (56px, centered message + green Upgrade button) → rounded light workspace (`border-radius:24px 24px 0 0`, `--surface-page`).
- URL bar row: back IconButton · center URL Badge (`linkbase.to/…`) · Enhance outline button.
- Three regions: `SidebarNav` rail · center `Card` panel (max **640**) · phone preview (width 300, `--shadow-float`, `align-self:flex-start`).
- Panel: title (`--text-3xl`/800) + toolbar IconButtons → `Tabs` → identity row → Add / New-collection buttons → `LinkRow` list → divider → Linkbase-footer toggle card.
- Live preview mirrors edits (adding a link prepends to the preview stack).

### Marketing site
1120px wrapper, 32px side padding, ~90px section padding. Section order: nav → chartreuse hero (headline + `linkbase.to/` input + Get-started) → alternating full-bleed color feature sections (cobalt / berry / sage; text one side, media the other, `flip` alternates) → white logo cloud → 2×2 color feature-card grid → centered testimonial → berry FAQ (`Accordion onDark`) → grape CTA → dark footer (4 link columns + wordmark + socials).
- Feature text: eyebrow (uppercase, `.06em`) + display headline (40/900, tight) + body (17, `--gray-700` or white-on-dark) + Button (`green` on dark, `primary` on light).
- **Imagery is placeholder** — no real photography/logos ship. Replace placeholder blocks with real assets.

---

## Accessibility notes

**Defined by the system**
- IconButton requires `label` → `aria-label`. Icon-only controls must always pass it.
- SidebarNav sets `aria-current="page"` on the active item.
- Tabs set `role="tablist"/"tab"` + `aria-selected`.
- Toggle uses a real hidden `<input type="checkbox">` (keyboard + form semantics intact); focus-visible shows the ring.
- Accordion header is a `<button>` with `aria-expanded`.
- ProfileHeader socials are `<a aria-label>`.
- Focus ring: `--focus-ring` (soft green) on inputs/toggles.

**TBD / add during build**
- **`prefers-reduced-motion`** — not implemented; gate the scale/height/slide transitions on it.
- **Tab panels** — `role="tabpanel"` + `aria-labelledby` linkage is not provided.
- **Accordion `aria-controls`** — header↔panel id linkage not provided.
- **Menus** — LinkRow / ProfileLinkButton kebabs fire `onMenu` but ship no menu; add a keyboard-navigable menu with `aria-haspopup`/`aria-expanded`.
- **Color contrast** — verify per pairing. Watch: `--gray-400` text on white; `--green` white text on `#1cb454`; `--accent`(`#43e660`) surfaces need dark text (`--accent-ink`), never white.
- **Link styling** — define global `a` / `a:hover` colors (`--text-link` / `--text-link-hover`) so unstyled links don't fall back to browser blue.
- **Skip links / landmarks / focus order** for full pages — not defined here.
