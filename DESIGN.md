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
  text-dim: "#64748B"
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
  status-active:
    backgroundColor: "{colors.tertiary}"
    rounded: "{rounded.full}"
    size: 7px
  status-evolving:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
    size: 7px
  status-experimental:
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

Spiny is the mascot and primary visual signature. The normal Spiny asset belongs in branding and the homepage hero; the dead Spiny variant belongs on the 404 page. Mascot artwork must retain its source aspect ratio and must not be recoloured, redrawn or visually distorted without an explicit design decision.

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

Use `backdrop-filter` only as progressive enhancement. Content must remain understandable when blur is unsupported.

## Shapes

The shape language is rounded but controlled:

- content cards use approximately **1rem** corners;
- larger grouped panels may use **1.25rem** corners;
- buttons and compact links use **0.5–0.7rem** corners;
- tags, status dots and circular icon buttons use fully rounded geometry.

Avoid mixing severe square corners into established card groups. Do not over-round large architecture layers or every text container; rounded shapes should communicate containment or interactivity.

Spiny assets have fixed intrinsic proportions:

- normal Spiny: **449:425**;
- dead Spiny: **404:377**.

Render both with `object-fit: contain`. The profile portrait uses a square container and `object-fit: cover`.

## Components

### Header and navigation

The header is transparent at the top and gains a translucent base-surface background, subtle border, shadow and blur after scrolling. Desktop navigation is centered. Mobile navigation appears as an elevated menu beneath the header.

Active and hover navigation states use heading-colour text and a thin brand-gradient indicator. Keyboard focus uses a clearly visible cyan outline with offset.

### Hero

The hero centers Spiny, an uppercase eyebrow, the oversized Hypershell wordmark and concise explanatory copy. Keep one dominant visual focus. Decorative orbit rings and glows must remain subdued.

Spiny floats slowly. On initial page load, two temporary colour-separated glitch layers may animate over the base image and must then stop. Do not run the glitch continuously. Respect `prefers-reduced-motion` by disabling glitch and reveal effects.

### Glass cards

Cards contain related information and use the shared glass treatment. Domain cards use a bordered icon tile, heading, concise description and optional tags. Project cards use small uppercase metadata, a status dot and a larger title.

Hover effects enhance existing borders and glow; they must not move content enough to disturb reading or pointer targeting.

### Architecture diagram

The public architecture view is a simplified responsibility stack, not an infrastructure topology. Layers are rounded, low-contrast surfaces connected by cyan arrows. Selected boundary layers may receive the brand-gradient border treatment.

Never expose internal addresses, ports, hostnames, credentials or a complete attack-relevant topology through this component.

### Buttons, links and tags

Primary-looking links use an elevated dark fill with a gradient border rather than a solid neon fill. Icon buttons are circular and 44px by 44px on larger screens. Tags are compact pills with muted text and subtle borders.

All interactive elements require visible hover and keyboard-focus states. Avoid interactions that depend exclusively on hover.

### Mascot and imagery

Use the supplied mascot assets rather than approximations. The normal Spiny is used for the brand icon and homepage hero. Dead Spiny is reserved for the custom 404 page. The portrait is presented in a square crop with a restrained gradient glow.

Images must declare intrinsic width and height to prevent layout shift. Decorative duplicate glitch layers are hidden from assistive technology.

## Do's and Don'ts

- **Do** preserve the dark-only navy foundation and the pink-blue-cyan accent relationship.
- **Do** use neon as a precise accent for identity, focus, status and boundaries.
- **Do** keep body text readable, restrained and structurally clear.
- **Do** maintain semantic HTML, visible keyboard focus and reduced-motion support.
- **Do** test desktop, tablet and narrow mobile viewports for overflow and content order.
- **Do** keep `DESIGN.md` and `src/styles.css` synchronized when normative values change.
- **Don't** turn large surfaces into opaque neon gradients.
- **Don't** add remote fonts, UI frameworks or runtime design libraries without a concrete requirement.
- **Don't** stretch, crop or casually recolour Spiny assets.
- **Don't** run glitch or reveal animations indefinitely.
- **Don't** sacrifice contrast, accessible focus or motion preferences for visual effects.
- **Don't** publish operational details that materially expose the private homelab.
