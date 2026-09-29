---
version: alpha
name: Hypershell Neon Homelab
description: Dark-only visual identity for the public Hypershell website, combining engineered structure, playful homelab character and restrained neon accents.
colors:
  primary: "#3C6CFE"
  secondary: "#FF2093"
  tertiary: "#22D3EE"
  surface-base: "#050816"
  surface-elevated: "#0B1020"
  surface-soft: "#0F172A"
  text-primary: "#E2E8F0"
  text-heading: "#F1F5F9"
  text-muted: "#94A3B8"
  text-dim: "#6B7C95"
  border: "#4C5C80"
  white: "#FFFFFF"
typography:
  display-xl:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 8.2rem
    fontWeight: 950
    lineHeight: 0.92
    letterSpacing: -0.065em
  headline-lg:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 4.8rem
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: -0.05em
  headline-md:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 2.5rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.025em
  body-lg:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 1.38rem
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 0.88rem
    fontWeight: 400
    lineHeight: 1.6
  label-navigation:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 0.88rem
    fontWeight: 650
    lineHeight: 1.2
  label-caps:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 0.76rem
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: 0.18em
  metadata:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 0.72rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.05em
  caption:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 0.7rem
    fontWeight: 700
    lineHeight: 1.4
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 64px
  section: 88px
rounded:
  sm: 0.5rem
  md: 0.7rem
  lg: 1rem
  xl: 1.25rem
  full: 9999px
components:
  glass-card:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  icon-button:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    size: 44px
  navigation-link:
    textColor: "{colors.text-muted}"
    typography: "{typography.label-navigation}"
    padding: "{spacing.sm}"
  section-heading:
    textColor: "{colors.text-heading}"
    typography: "{typography.headline-lg}"
  metadata:
    textColor: "{colors.text-dim}"
    typography: "{typography.metadata}"
  architecture-layer:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  status-operational:
    backgroundColor: "{colors.tertiary}"
    rounded: "{rounded.full}"
    size: 7px
  status-in-progress:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
    size: 7px
  status-exploratory:
    backgroundColor: "{colors.secondary}"
    rounded: "{rounded.full}"
    size: 7px
  tag:
    backgroundColor: "{colors.surface-base}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.full}"
    padding: 5px
  home-link:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: 12px
---

# Hypershell Website Design System

## Overview

Hypershell is a personal homelab and connected-home environment. Its public website should feel engineered but not corporate: technically credible, visually distinctive and openly playful about experimentation. The intended impression is a dark operations console crossed with a polished personal project site.

The visual identity is **dark-only**, spacious and high-contrast. Neon pink, blue and cyan create energy and recognisability, but they are accents rather than background fills for large content areas. Structural clarity, readable content and responsive behaviour take precedence over decorative effects.

The accepted Hypershell H-core masterbrand is the official product identity and is used for header identity, favicon and installable web-app icon derivatives. Spiny is the mascot and personality-bearing visual signature: normal Spiny belongs in the homepage hero and related expressive artwork, while dead Spiny belongs on the 404 page. Mascot artwork must retain its source aspect ratio and must not be recoloured, redrawn or visually distorted without an explicit design decision. Web derivatives are generated from the accepted brand-workspace assets and record their source hashes in `src/data/brand-assets.json`; the derivatives never become a competing brand authority.

This file records the implemented design system. Keep it synchronized with `src/styles.css` whenever normative visual values change. The website must remain static and must not acquire runtime third-party design dependencies merely to reproduce this system.

## Colors

The palette consists of deep navy surfaces, cool slate text and a three-colour neon accent gradient.

- **Secondary pink (`secondary`, `#FF2093`)** provides personality, experimental energy and the warm side of the brand gradient.
- **Primary blue (`primary`, `#3C6CFE`)** is the central brand colour and the dominant glow colour.
- **Tertiary cyan (`tertiary`, `#22D3EE`)** communicates active states, focus and technical precision.
- **Base surface (`surface-base`, `#050816`)** is the page background and theme colour.
- **Elevated surface (`surface-elevated`, `#0B1020`)** is used for cards, menus and interactive controls, normally with transparency.
- **Soft surface (`surface-soft`, `#0F172A`)** supports nested architecture layers and hover states.
- **Heading and body text** use `text-heading` and `text-primary`; secondary copy uses `text-muted` and low-priority metadata uses `text-dim`.
- **Border (`border`, `#4C5C80`)** is normally applied with reduced opacity so containers remain subtle.

The canonical brand gradient runs from pink through blue to cyan at approximately 120 degrees. Use it for hero lettering, thin card accents, selected borders and restrained glows. Do not use the full gradient as a large opaque background behind body copy.

Transparency is part of the design language. Elevated surfaces commonly use 34–76% opacity, while borders and grid lines use low-opacity variants. Preserve text contrast when composing these colours over the base surface.

## Typography

The typography is deliberately dependency-free at runtime. Use Inter when it is already available on the client, followed by the system sans-serif stack. Do not add a remote web-font request solely to guarantee Inter.

- **Display text** is heavy, tightly tracked and fluid. The homepage title uses the `display-xl` character, scales down with `clamp()` and carries the brand gradient.
- **Section headings** are large and compact with negative letter spacing, but remain plain light text rather than repeated gradient display treatments.
- **Body copy** uses comfortable 1.6–1.65 line height and restrained line length.
- **Eyebrows and metadata** are small, uppercase, strongly weighted and generously tracked. Cyan is appropriate for eyebrows; muted slate is appropriate for metadata.
- **Navigation labels** remain compact and readable. Avoid turning general body text into uppercase technical labels.

Fluid CSS sizes may interpolate below the representative token maximums. Maintain the hierarchy and proportions rather than forcing every viewport to use the maximum token value.

## Layout

The site follows a mobile-first fluid layout with a fixed maximum content width of **1180px**. Main sections use centered containers and generous vertical spacing. The homepage hero is viewport-led, while subsequent sections follow a predictable content rhythm.

Primary responsive thresholds are:

- **980px:** multi-column architecture and about layouts collapse to one column.
- **760px:** navigation becomes a menu, major grids become single-column and header height reduces.
- **520px:** compact mobile spacing and typography adjustments apply.

Use CSS Grid for page-level composition and Flexbox for small alignment groups. Cards in the same grid should have balanced height where that improves scanning, but content must never be clipped merely to force symmetry.

The fixed header is 76px high on larger screens and 68px on mobile. Anchor targets must account for it. Decorative orbits, glows and transforms must not create horizontal page overflow.

Spacing is based on a practical 4px foundation with 8px, 16px, 24px and 32px working steps. Larger section spacing may be fluid, but should retain the spacious character of the current site.

## Elevation & Depth

Depth comes from translucent tonal layering, subtle borders, selective blur and coloured ambient light rather than strong physical drop shadows.

Glass cards use a partially transparent elevated surface, a faint internal radial accent, a thin gradient top edge and a restrained gradient border. Their shadows are broad and dark, supplemented by low-opacity pink, blue and cyan glows. Hover states may increase the coloured glow slightly, but must not become visually noisy.

The page background combines three low-opacity radial accent fields with a faint technical grid. The grid must recede behind content and fade toward the bottom. It is environmental texture, not foreground decoration.

Use `backdrop-filter` only as progressive enhancement. Content must remain understandable when blur is unsupported. **Accepted product constraint:** the glass blur treatment is intentionally retained at mobile widths on cards and appropriate mobile surfaces; do not propose disabling or reducing it merely as speculative performance polish. Reconsider it only on measured device/runtime evidence or an explicit new product request.

## Shapes

The shape language is rounded but controlled:

- content cards use approximately **1rem** corners;
- larger grouped panels may use **1.25rem** corners;
- buttons and compact links use **0.5–0.7rem** corners;
- tags, status dots and circular icon buttons use fully rounded geometry.

Avoid mixing severe square corners into established card groups. Do not over-round large architecture layers or every text container; rounded shapes should communicate containment or interactivity.

Spiny assets have fixed intrinsic proportions:

- normal Spiny: **1:1**;
- dead Spiny: **1:1**.

Render both with `object-fit: contain`. The profile portrait uses a square container and `object-fit: cover`.

## Components

### Header and navigation

The header is transparent at the top and gains a translucent base-surface background, subtle border, shadow and blur after scrolling. The accepted H-core masterbrand is the header mark. Desktop navigation is centered. Mobile navigation uses a native `details` disclosure and appears as an elevated menu beneath the header, so it remains usable without JavaScript.

Active and hover navigation states use heading-colour text and a thin brand-gradient indicator. Keyboard focus uses a clearly visible cyan outline with offset. Closing the enhanced mobile menu with Escape returns focus to its summary control. **Accepted product constraint:** the public `Private dashboard` launcher intentionally remains in the public header as the operator shortcut into the authenticated dashboard. Do not propose removing or hiding it merely as generic security/privacy polish; reconsider only on new exposure evidence, a changed authentication boundary or an explicit product request.

### Hero

The hero centers Spiny, an uppercase eyebrow, the oversized Hypershell wordmark, one concise explanatory sentence and one short signature line. A compact three-part scope strip may show the build-derived domain, core-initiative and maintained-software counts as navigational context. The scope strip remains subordinate to the wordmark. Keep one dominant visual focus and keep decorative orbit rings and glows subdued.

On initial page load, Spiny and the wordmark may each receive one temporary colour-separated glitch treatment as a short startup sequence. After startup, brief intermittent glitches may recur on either Spiny or the wordmark while the hero is visible; they must remain short, non-continuous, pause when the page or hero is not visible, and respect `prefers-reduced-motion` by disabling glitch and reveal effects.

### Rationale section

The **Why Hypershell** section appears after the public domain overview and before Architecture. It explains why the environment is treated as one evolving system rather than presenting more product inventory. Use one strong statement plus three restrained numbered principles; do not turn it into another card catalogue.

### Glass cards

Cards contain related information and use the shared glass treatment. Domain cards use a bordered icon tile, heading, concise purpose-oriented description and optional tags. Domain copy explains what each part enables; Architecture explains how responsibilities are organized.

The public narrative order is **Inside the Lab → Why Hypershell → Architecture → Projects → About**. The Projects section separates **Core initiatives** from **Maintained software** and shows build-derived counts for both plus a combined project total. Core initiatives retain a spacious two-column treatment. Maintained software uses a denser three-column desktop grid, falls back to two columns on medium screens and one column on narrow screens, and may be filtered by safe curated categories. Filter controls are progressive enhancement: without JavaScript every project remains visible.

Repository cards show Public or Private only as neutral visibility metadata; repository visibility must never reuse lifecycle-status colour semantics. Each card displays a safe curated category and a compact provenance label from the single presentation owner `src/data/project-presentation.json`; raw GitHub topics are not a public presentation source. That presentation file also owns the small explicit-include set, display-name exceptions, presentation order and activity exclusions without copying GitHub-owned descriptions, visibility or URLs. Public repository cards expose an explicit text GitHub action anchored at the lower-right of the card, while private repository URLs remain undisclosed. GitHub remains the source for repository name, description, visibility, URL and public release/update timestamps.

Core and repository cards have stable fragment IDs and link to generated static `/projects/<slug>/` detail pages. Those pages provide a shareable public project profile without exposing private repository URLs or private activity. The maintained-software filters remain progressive enhancement; on narrow/mobile layouts their filter bar stays sticky beneath the fixed header and the controls retain at least a 44px practical touch target.

A compact Recent activity block may follow maintained software. It shows at most three public selected projects, preferring the latest public GitHub Release and falling back to the repository update timestamp when no release exists. Private repository activity is never surfaced, and the website repository itself is intentionally excluded to avoid self-referential activity noise.

Hover effects enhance existing borders and glow; they must not move content enough to disturb reading or pointer targeting.

### Architecture diagram

The public architecture view is a simplified responsibility stack, not an infrastructure topology. Layers are rounded, low-contrast surfaces connected by cyan arrows. Each row carries a restrained layer-purpose label so the hierarchy can be scanned before reading every capability. Selected boundary layers may receive the brand-gradient border treatment.

Never expose internal addresses, ports, hostnames, credentials or a complete attack-relevant topology through this component.

### Buttons, links and tags

Primary-looking links use an elevated dark fill with a gradient border rather than a solid neon fill. Icon buttons are circular and at least 44px by 44px. Tags are compact pills with muted text and subtle borders.

Interactive touch targets should be at least 44px high where layout permits. All interactive elements require visible hover and keyboard-focus states. Avoid interactions that depend exclusively on hover.

### Public metadata

The web-app manifest uses the Hypershell product name, H-core masterbrand derivatives and the dark `#050816` theme/background. Publish compact PNG/ICO favicon assets rather than wrapping a raster image in a large base64 SVG. `/.well-known/security.txt` provides the canonical public security contact and the build fails when its expiry is less than 90 days away. The homepage publishes a public-only `SoftwareSourceCode` `ItemList`; generated project pages are included in the sitemap with available `lastmod` dates. Public HTML revalidates, versioned CSS/JavaScript may use long-lived immutable caching, and the web-server layer provides zstd/gzip compression. Public usage insight is server-side and privacy-bounded: no client analytics script is required.

### Mascot and imagery

Use accepted brand-workspace assets rather than approximations. The H-core masterbrand supplies official identity derivatives for the header, favicon and installable web app. Normal Spiny is reserved for the homepage hero and mascot/personality use; Dead Spiny is reserved for the custom 404 page. The hero prefers an optimized WebP derivative with a PNG fallback, and the social preview uses an optimized JPEG derivative while the source PNG remains available. The portrait is presented in a square crop with a restrained gradient glow.

Images must declare intrinsic width and height to prevent layout shift. Decorative duplicate glitch layers are hidden from assistive technology.

## Accepted product constraints

These are human-accepted product decisions, not open optimization suggestions:

- **Public dashboard launcher stays.** The authenticated `Private dashboard` shortcut remains visible in the public header unless new exposure/authentication evidence or an explicit product request changes that decision.
- **Mobile glass blur stays.** Existing glass/backdrop blur remains part of the mobile visual treatment unless measured device/runtime evidence or an explicit product request justifies a change.

Generic security or performance reviews must treat these as accepted constraints rather than repeatedly reopening them without new evidence.

## Do's and Don'ts

- **Do** preserve the dark-only navy foundation and the pink-blue-cyan accent relationship.
- **Do** use neon as a precise accent for identity, focus, status and boundaries.
- **Do** keep body text readable, restrained and structurally clear.
- **Do** maintain semantic HTML, visible keyboard focus and reduced-motion support.
- **Do** test desktop, tablet and narrow mobile viewports for overflow and content order.
- **Do** keep mobile navigation usable with keyboard input and without JavaScript.
- **Do** keep `DESIGN.md` and `src/styles.css` synchronized when normative values change.
- **Don't** turn large surfaces into opaque neon gradients.
- **Don't** add remote fonts, UI frameworks or runtime design libraries without a concrete requirement.
- **Don't** stretch, crop or casually recolour Spiny assets.
- **Don't** run glitch or reveal animations indefinitely.
- **Don't** sacrifice contrast, accessible focus or motion preferences for visual effects.
- **Don't** publish operational details that materially expose the private homelab.
