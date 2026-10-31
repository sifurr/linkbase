# Linkbase — UI Components

Component contracts for the Next.js build, pulled from `components/*`. Props, variants, and states below are what the system actually defines; gaps are marked **TBD**. Tokens referenced here are specified in [`design-system.md`](./design-system.md).

**Conventions**
- All primitives are presentational React components styled from CSS variables / Tailwind tokens — no CSS-in-JS libs, React only.
- Icons: **Lucide** (substitution flagged). 18–22px glyphs; ink on light, white on dark/active tiles, gray `#8c8c8c` for muted.
- No emoji, no unicode glyphs as icons.

---

## Component index
| Component | Group | Variants | Sizes |
|---|---|---|---|
| [Button](#button) | core | primary, secondary, outline, action, ghost | sm, md, lg |
| [IconButton](#iconbutton) | core | soft, solid, outline, ghost | sm, md, lg |
| [Avatar](#avatar) | core | circle, square | any px |
| [Badge](#badge) | core | neutral, solid, green, outline, lime | sm, md |
| [SectionCard](#sectioncard) | core | elevated, bordered | — |
| [LinkCard](#linkcard) | core | centered, list | — |
| [NavItem](#navitem) | core | active / inactive | — |
| [Input](#input) | forms | with/without prefix | md, lg |
| [Switch](#switch) | forms | on / off | — |
| [Tabs](#tabs) | forms | underline | — |

---

## Button
Pill-shaped primary action — the core CTA across Linkbase (Add, Continue, Upgrade, Claim your Linkbase).

**Props:** `variant` (`'primary'|'secondary'|'outline'|'action'|'ghost'`, default `primary`) · `size` (`'sm'|'md'|'lg'`, default `md`) · `fullWidth` · `disabled` · `leadingIcon` · `trailingIcon` · `...button` attrs.

### Variants
| Variant | Background | Text | Border |
|---|---|---|---|
| primary | `--lb-ink` `#0e0e0e` | white | same as bg |
| secondary | `--lb-gray-100` `#f2f2f2` | ink | transparent |
| outline | white | ink | `--border-strong` `#d4d4d4` |
| action | `--lb-green-action` `#22c55e` | white | same as bg |
| ghost | transparent | ink | transparent |

### Sizes
| Size | Padding | Font | Min-height |
|---|---|---|---|
| sm | `8px 16px` | 14px | 36px |
| md | `12px 22px` | 16px | 48px |
| lg | `16px 28px` | 18px | 56px |

All: `font-weight: 700`, `letter-spacing: -0.01em`, `border-radius: 999px`, `line-height: 1`, flex row with icon gap 6/8/10px.

### States
| State | Treatment |
|---|---|
| Hover | **TBD** for primary/secondary/action (no hover rule in source — recommend `brightness(0.95)` to match system) |
| Active / press | `transform: scale(0.97)` |
| Disabled | `opacity: 0.45`, `cursor: not-allowed` |
| Focus-visible | **TBD** — add a visible ring (e.g. 2px `--lb-ink` offset) for a11y |

```jsx
<Button variant="primary" leadingIcon={<Plus/>}>Add</Button>
<Button variant="secondary">New collection</Button>
<Button variant="outline" fullWidth size="lg">Continue</Button>
<Button variant="action" size="sm">Upgrade</Button>
```

---

## IconButton
Circular icon-only button: share, settings, kebab, filter, reorder.

**Props:** `size` (`'sm'|'md'|'lg'`, default `md`) · `variant` (`'soft'|'solid'|'outline'|'ghost'`, default `soft`) · `label` (**required for a11y** — maps to `aria-label`) · `children` (icon).

### Sizes
| Size | Diameter |
|---|---|
| sm | 32px |
| md | 40px |
| lg | 48px |

### Variants
| Variant | Background | Icon | Border |
|---|---|---|---|
| soft | `--lb-gray-100` | ink | transparent |
| solid | `--lb-ink` | white | ink |
| outline | white | ink | `--border-strong` |
| ghost | transparent | `--lb-gray-600` | transparent |

### States
| State | Treatment |
|---|---|
| Hover | `filter: brightness(0.95)` |
| Active / press | **TBD** |
| Disabled | **TBD** |
| Focus-visible | **TBD** — add visible ring |

```jsx
<IconButton label="Share" variant="soft"><Share/></IconButton>
<IconButton label="More" variant="ghost" size="sm"><Dots/></IconButton>
```

---

## Avatar
Round (or rounded-square) image with first-initial fallback. Profile headers, link thumbnails.

**Props:** `src` · `name` (drives initial fallback) · `size` (px, default 56) · `square` (rounded-square instead of circle).

- No image → `--lb-gray-200` fill, `--lb-gray-600` initial (uppercase first char), weight 700, font-size `size × 0.42`.
- Circle = `rounded-full`; square = `--radius-md` (12px).
- States: **TBD** (static display element).

```jsx
<Avatar src="/me.jpg" name="gabbasdev" size={96} />
<Avatar name="Linkbase" size={40} square />
```

---

## Badge
Pill tag/chip: URL pills, "Upgrade" chip, category tags, status markers.

**Props:** `variant` (`'neutral'|'solid'|'green'|'outline'|'lime'`, default `neutral`) · `size` (`'sm'|'md'`, default `md`) · `leadingIcon`.

### Variants
| Variant | Background | Text / border |
|---|---|---|
| neutral | `--lb-gray-100` | ink |
| solid | `--lb-ink` | white |
| green | `--lb-green-action` | white |
| outline | white | ink; `inset 0 0 0 1px --border-strong` |
| lime | `--lb-lime` | `--lb-lime-ink` |

### Sizes
| Size | Padding | Font |
|---|---|---|
| sm | `3px 10px` | 12px |
| md | `6px 14px` | 14px |

All: `font-weight: 600`, `border-radius: 999px`, `white-space: nowrap`, icon gap 6px. States: **TBD** (typically static; make interactive only when used as a button).

```jsx
<Badge variant="outline" leadingIcon={<Link/>}>linktr.ee/you</Badge>
<Badge variant="green" leadingIcon={<Bolt/>}>Upgrade</Badge>
<Badge variant="lime">New</Badge>
```

---

## SectionCard
White rounded surface panel — base container for dashboard content, previews, grouped sections.

**Props:** `padding` (px, default 24) · `radius` (CSS value, default `--radius-xl` = 24px) · `elevated` (default `true`).

| `elevated` | Treatment |
|---|---|
| true | `--shadow-card`, no border |
| false | 1px `--border-subtle` border, no shadow |

Background `--surface-card` (white). States: **TBD**.

```jsx
<SectionCard padding={28}>…</SectionCard>
<SectionCard elevated={false} radius="var(--radius-lg)">…</SectionCard>
```

---

## LinkCard
The signature link-in-bio row.

**Props:** `title` (required) · `meta` (list layout only) · `thumbnail` (leading node) · `layout` (`'centered'|'list'`, default `centered`) · `onMore` · `onClick` (via `...rest`).

| Layout | Use | Padding | Title |
|---|---|---|---|
| centered | Public profile | `20px 18px` | bold, centered, wraps |
| list | Dashboard | `12px 14px` | bold, left, truncates (ellipsis) |

- Surface: white, `--radius-lg` (16px), `--shadow-card`.
- Trailing kebab (`⋮`) button — `onMore` fires with `stopPropagation`.
- `meta` line: 12px `--text-muted`, truncates.

### States
| State | Treatment |
|---|---|
| Hover | shadow `card` → `md` |
| Active / press | `transform: scale(0.99)` |
| Focus-visible | **TBD** — row is `onClick` div; add keyboard affordance + ring for a11y |

```jsx
<LinkCard title="Coding With Abbas | YouTube" />
<LinkCard layout="list" thumbnail={<Avatar size={44} square/>}
  title="Instagram" meta="0 clicks · instagram.com" onMore={...} />
```

---

## NavItem
Vertical nav-rail item — stacked icon tile over label. Dashboard sidebar (Content / Header / Design / Settings).

**Props:** `icon` · `label` · `active` · `onClick`.

| State | Icon tile | Label |
|---|---|---|
| inactive | `--lb-gray-100` bg, `--lb-gray-600` glyph | 12px, weight 500, gray-600 |
| active | `--lb-ink` bg, white glyph | 12px, weight 700, ink |

Tile is 52×52 `rounded-full`; 6px gap to label; transition `background/color .15s ease`. Focus-visible: **TBD**.

```jsx
<NavItem icon={<Box/>} label="Content" active />
<NavItem icon={<Cog/>} label="Settings" />
```

---

## Input
Soft gray-filled text field with optional inline prefix (`linktr.ee/`).

**Props:** `prefix` · `size` (`'md'|'lg'`, default `md`) · `wrapperStyle` · native `<input>` attrs.

| Size | Padding | Font | Min-height |
|---|---|---|---|
| md | `12px 16px` | 16px | 48px |
| lg | `16px 18px` | 18px | 56px |

- Wrapper: `--lb-gray-100` fill, `--radius-lg` (16px), 1px transparent border (transitions on `border-color`).
- Prefix: `--text-muted`, nowrap. Input text: ink, weight 500, transparent bg, no outline.

### States
| State | Treatment |
|---|---|
| Focus | border-color transition defined; **focus color value TBD** — recommend `--lb-ink` or `--accent` 1px border |
| Error | **TBD** |
| Disabled | **TBD** |

```jsx
<Input placeholder="Email" />
<Input prefix="linktr.ee/" defaultValue="gabbasdev" size="lg" />
```

---

## Switch
Green pill toggle for settings and feature flags.

**Props:** `checked` · `onChange(next: boolean)` · `disabled`.

| State | Track | Knob |
|---|---|---|
| on | `--lb-green-action` `#22c55e` | white, `translateX(22px)` |
| off | `--lb-gray-300` `#d4d4d4` | white, `translateX(0)` |
| disabled | `opacity: 0.5`, `cursor: not-allowed` | — |

Dimensions: 52×30 track, 24×24 knob, 3px inset, `--shadow-sm` on knob, `transition: .18s ease`. `role="switch"`, `aria-checked` set. Focus-visible: **TBD**.

```jsx
const [on, setOn] = useState(true);
<Switch checked={on} onChange={setOn} />
```

---

## Tabs
Underline tab strip (Links / Shop).

**Props:** `tabs` (`string[]` or `{label,value}[]`) · `value` · `onChange(value)`.

| State | Label | Underline |
|---|---|---|
| active | `--text-primary`, weight 700, 18px | 2px `--lb-ink` bar, opacity 1 |
| inactive | `--text-muted`, weight 700 | opacity 0 |

Strip: 28px gap between tabs, 1px `--border-subtle` bottom border, 12px bottom padding on each tab. Transition `color/opacity .15s ease`. Keyboard roving-tabindex / `role="tablist"`: **TBD** — add for a11y.

```jsx
const [tab, setTab] = useState('links');
<Tabs value={tab} onChange={setTab}
  tabs={[{label:'Links',value:'links'},{label:'Shop',value:'shop'}]} />
```

---

## Layout patterns

### Dashboard (3-column shell)
Fixed black **promo bar** (full-width, white text + green "Upgrade" badge) → **app header** (back IconButton · centered URL pill badge · "Enhance" outline button) → body:
1. **Nav rail** — vertical `NavItem` stack, ~22px gap.
2. **Content panel** — `SectionCard` (white, `--radius-xl`): title + action IconButtons, `Tabs`, profile row, `Add`/`New collection` buttons, `LinkCard` (list) rows, footer `Switch`.
3. **Live preview** — floating phone mock (`--surface-preview`, `--radius-2xl`, `--shadow-float`) + adjust/open IconButtons.

Container ~1280px. Responsive collapse: **TBD**.

### Public profile
Centered column (~680px) on `--surface-preview`: top bar (brand tile + share) → centered Avatar + username → `LinkCard` (centered) stack with 16px gap → legal footer links → **bottom CTA band with protection gradient** (transparent → near-black `rgba(20,20,20,.9)`) holding a white URL badge + "Join … on Linkbase" line.

### Marketing
Full-bleed **color-block sections** (one saturated bg each), max content 1120px. Pill-shaped floating nav on white. Alternating image/copy splits; headlines flip to lime on dark grounds. Email-capture = `Input` + `Button` inline. Deep-purple final CTA, black footer with circular social IconButtons.

---

## Accessibility notes

**Defined by the system**
- `IconButton` requires a `label` → `aria-label`.
- `Switch` sets `role="switch"` + `aria-checked`.
- Color: ink `#0e0e0e` on white and white on `--lb-ink` both exceed 7:1. Lime headlines on cobalt/berry/purple grounds are used at display scale (≥24px) — verify each pairing meets ≥3:1 for large text.

**TBD / add during build**
- **Focus-visible rings** — no focus styles defined on any component; add a consistent visible ring (recommend 2px `--lb-ink` with 2px offset) across Button, IconButton, LinkCard, NavItem, Input, Switch, Tabs.
- **Tabs** need `role="tablist"`/`tab`/`tabpanel` wiring + arrow-key roving tabindex.
- **LinkCard** is a clickable `<div>` — make it a real `<a>`/`<button>` (or add `role`/`tabIndex`/keydown) so it's keyboard-operable.
- **Badge** used as the dismissable URL pill has a bare `✕` span — make the dismiss a real `<button aria-label="Dismiss">`.
- **Reduced motion** — gate all transforms/transitions behind `prefers-reduced-motion`.
- **Contrast of muted text** (`--lb-gray-500` `#8c8c8c` on white ≈ 3.5:1) — passes for ≥18px only; avoid for body-size meta where 4.5:1 is required, or darken to `--lb-gray-600`.
- Form labeling (visible `<label>`/`aria-label` for `Input`), error messaging, and `aria-live` for toasts: **TBD**.
