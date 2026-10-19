---
name: BantuAds Auto
description: KawanBantu's ad submission form for NGOs, kept like a savings passbook.
colors:
  ink: "#2B2033"
  ink-soft: "#5C5466"
  ink-faint: "#6E6779"
  paper: "#F2F7F6"
  paper-deep: "#E5EFED"
  leaf-white: "#FFFFFF"
  line: "#DCE6E4"
  line-strong: "#C4D4D1"
  brand: "#2A9E99"
  brand-deep: "#1E7672"
  brand-tint: "#E2F2F0"
  plum: "#8A59B3"
  plum-deep: "#6E3F97"
  danger: "#C2413B"
  danger-tint: "#FBEDEC"
  warn: "#9A5F0E"
  warn-tint: "#FDF3E1"
typography:
  headline:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
  section-title:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.43
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.625
  body-small:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.43
  ledger-kind:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.06em"
  figure:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    fontFeature: "tnum"
  figure-stub:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "1.125rem"
    fontWeight: 500
    fontFeature: "tnum"
rounded:
  sm: "6px"
  ghost: "8px"
  field: "10px"
  button: "12px"
  inset: "12px"
  leaf: "14px"
  panel: "16px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.leaf-white}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "12px 22px"
  button-secondary:
    backgroundColor: "{colors.leaf-white}"
    textColor: "{colors.brand-deep}"
    rounded: "{rounded.button}"
    padding: "11px 19px"
  button-secondary-hover:
    backgroundColor: "{colors.brand-tint}"
  button-ghost:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.ghost}"
    padding: "6px 10px"
  button-ghost-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  field:
    backgroundColor: "{colors.leaf-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
  field-invalid:
    textColor: "{colors.ink}"
  leaf:
    backgroundColor: "{colors.leaf-white}"
    rounded: "{rounded.leaf}"
  status-complete:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-deep}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  status-incomplete:
    backgroundColor: "{colors.danger-tint}"
    textColor: "{colors.danger}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  note-tint:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inset}"
    padding: "14px 16px"
  segmented:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.inset}"
    padding: "4px"
  segmented-on:
    backgroundColor: "{colors.leaf-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.ghost}"
    padding: "8px 16px"
  step-active:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.leaf-white}"
    rounded: "{rounded.pill}"
    size: "24px"
---

# Design System: BantuAds Auto

## Overview

**Creative North Star: "The Buku Tabungan"**

The submission is a savings passbook kept at a clean teller counter. A cool, teal-tinted paper ground carries pure white leaves edged in hairlines; every ad the NGO describes prints as a numbered line in a ledger that runs beside the form, and sending earns the teller's violet stamp. The passbook stays in its own places (the ledger, the stub numerals, the stamp) and never dresses up the form controls, which stay plain, generous and receipt-clean (the Kwitansi half of the world).

Density is calm. One typeface carries every word; a monospace appears only where a figure is printed. Teal does all the work of action, selection and printed numbers; KawanBantu purple is held back for the single primary button's gradient and the stamp. Rank is shown once: the leaf being edited is the only one that lifts.

**Key Characteristics:**
- Teal-tinted paper ground with white hairline leaves, flat at rest.
- One raised leaf: the one being edited.
- Figtree for every word; Martian Mono only for printed figures (ledger numbers, counts, budgets, submission numbers).
- Zero-padded stub numerals ("01", "003") as the passbook's signature.
- Ledger lines print in left to right; the success screen carries a rotated violet ring stamp.

## Colors

A cool, low-chroma passbook palette in KawanBantu brand colours: teal as the working accent, purple as the rare ceremonial one, plum-ink for text.

### Primary
- **Passbook Teal** (brand): actions, selection, focus rings, caret, active step dot, the budget bar, the gradient's starting colour. The colour of anything the NGO can act on or has chosen.
- **Deep Teal** (brand-deep): teal text on white or tint (secondary button label, ghost "Tambah" actions, printed ledger numbers, the active leaf's stub numeral, "Lengkap" status). Use it whenever teal must read as text.
- **Teal Wash** (brand-tint): selected ledger line, secondary hover, completed-status pill, the instructional note panels.

### Secondary
- **KawanBantu Violet** (plum): only the end of the primary button gradient, its glow, and the stamp's rings.
- **Stamp Ink** (plum-deep): the stamp's lettering.

### Neutral
- **Plum Ink** (ink): all primary text and headings.
- **Soft Ink** (ink-soft): supporting copy, hints, ghost button labels, column heads.
- **Faint Ink** (ink-faint): placeholders, idle stub numerals, blank ledger lines, secondary metadata.
- **Passbook Paper** (paper): page ground, ghost hover, inset wells (segmented control, creative rows).
- **Deep Paper** (paper-deep): the budget bar's empty track, the preview's CTA chip.
- **Leaf White** (leaf-white): leaves, fields, header and bottom bar.
- **Hairline** (line): leaf borders and every divider.
- **Strong Hairline** (line-strong): field borders, the active leaf's border, the double rule above the ledger total, dashed blank lines.

### Status
- **Missing Red** (danger) on **Missing Wash** (danger-tint): required asterisks, field errors, invalid field borders, "belum lengkap" pills and the issue toggle. Red means a field is missing or wrong, nothing else.
- **Amber Cut** (warn) on **Amber Wash** (warn-tint): character budgets past Meta's cut-off and the folder file-count notice. A guide, never a blocker.

### Named Rules
**The Teal Works Rule.** Every action, selection and printed figure is teal. If something is clickable or chosen and it is not teal, white-with-teal, or ghost ink, it is off-system.

**The Violet Is Ceremony Rule.** Purple appears in exactly two places: the primary button's teal-to-violet gradient (120deg, brand 10% to plum 100%) and the validation stamp. Never as text, borders, icons or backgrounds anywhere else.

**The Red Means Missing Rule.** Danger red is reserved for missing or invalid input and the delete hover. It never decorates.

## Typography

**Body Font:** Figtree (with ui-sans-serif, system-ui), weights 400 to 800
**Figure Font:** Martian Mono (with ui-monospace), weights 400 and 500, always with tabular numerals

**Character:** A friendly, open geometric sans does all the talking in plain Indonesian; a squared monospace is the passbook printer, used only where a number is printed.

### Hierarchy
- **Headline** (800, 1.75rem, tight leading, -0.02em): one per screen ("Submission Iklan", "Review Sebelum Kirim", "Submission Terkirim").
- **Title** (700, 1rem): a leaf's ad name in its stub. Modal titles step up to 1.125rem bold.
- **Section title** (700, 0.875rem): panel heads such as "Pratinjau" and "Rincian iklan", note headings.
- **Body** (400, 15px, relaxed leading): intros under the headline; fields also set at 15px.
- **Body small** (400, 13px): hints, summaries, panel asides, ledger names (600 when it is the line's title).
- **Label** (600, 0.875rem): field labels, with a red asterisk for required fields.
- **Ledger kind** (600, 11px, 0.06em tracking, capitals as data): the Sumber column values VIDEO, GAMBAR, POST.
- **Figure** (Martian Mono 400 to 500, 12px default, 18px for leaf stubs): all printed numbers.

### Named Rules
**The Printed Figure Rule.** A number that the system prints (ledger number, ad stub, count, character budget, submission number, receipt date) is set in Martian Mono with tabular numerals. Numbers inside running prose, and every word, stay in Figtree.

**The Zero-Pad Rule.** Leaf stubs are two digits ("01"), ledger lines three ("001"); a blank ledger line prints "---".

## Layout

The page sits in a 1280px container (max-w-7xl) with 16px gutters on mobile and 32px from 640px. The header is a sticky 64px white bar with a hairline bottom: logo left, three numbered steps right (inactive step labels hide below 640px).

The form screen is two columns from 1024px: a fluid form column and a sticky side panel of 380px (400px from 1280px) that fills the viewport height below the header, preview leaf on top and ledger leaf filling the rest. Below 1024px the panel stacks under the form. Leaves stack with a 16px gap; columns separate by 32px. A fixed white bottom bar with a hairline top holds counts on the left and the primary action on the right; the page reserves 96px so content clears it. Review and success screens narrow to a centered single column (success at 576px).

Inside a leaf, the stub runs 20px horizontal by 14px vertical; the body pads 20px with 24px between field groups and 20px between related fields. Spacing follows a 4px base, mostly 8, 12, 16, 20, 24 and 32.

## Elevation & Depth

Flat by default: depth is tonal (white leaves on teal paper) and drawn with 1px hairlines. Shadows appear only to say something: this leaf is being edited, this is the one primary action, or this layer floats above the page.

### Shadow Vocabulary
- **Active leaf** (`0 1px 2px rgb(43 32 51 / 0.05), 0 14px 32px -18px rgb(30 118 114 / 0.45)`): the single leaf being edited, with its border stepped to the strong hairline. Teal-tinted, so the lift reads as selection.
- **Primary glow** (`0 6px 16px -8px` violet at 70%): under the gradient button only.
- **Feed card** (`0 6px 20px -12px rgb(43 32 51 / 0.35)`): the mock Meta feed card in the preview, which depicts a phone surface.
- **Segment thumb** (`0 1px 3px rgb(43 32 51 / 0.12)`): the chosen half of a segmented control.
- **Popover** (`0 12px 32px -12px rgb(43 32 51 / 0.35)`): the issue guide floating above the bottom bar.
- **Modal** (`0 24px 48px -20px rgb(43 32 51 / 0.45)`) over a 50% ink scrim.

### Named Rules
**The One Raised Leaf Rule.** At rest, no leaf or panel on the page carries a shadow. Only the leaf being edited lifts; every other leaf stays flat.

## Shapes

Soft, consistent rounding that grows with the size of the surface: 6px for tiny toggles and chips, 8px for ghost buttons and segment thumbs, 10px for fields, 12px for buttons and inset wells, 14px for leaves, 16px for the feed card, success note and the dashed "add" slot. Pills and step dots are fully round. Borders are 1px hairlines everywhere; the secondary button uses 1.5px teal. Two passbook marks are special: the double rule (2px double, strong hairline) above the ledger total, and dashed strokes for anything not yet filled (blank ledger lines, the "Tambah Iklan" slot in dashed teal at 50%). The stamp is a 144px circle with a 3px outer ring and 1px inner ring, rotated -6deg.

## Components

### Buttons
Confident but few; one gradient per screen.
- **Shape:** gently rounded (12px).
- **Primary:** white 15px bold label on the teal-to-violet gradient with the violet glow; hover brightens 6%, press nudges down 1px, disabled drops to 55% opacity. One per screen: the step's forward action.
- **Secondary:** white with a 1.5px teal border and deep teal 600 label; hover fills with teal wash.
- **Ghost:** no fill, soft ink 14px 600 label, 8px radius; hover fills with paper and darkens to ink. Teal-labelled ghosts are the "Tambah ..." add actions; icon-only ghosts (6px padding) collapse and delete, and delete hovers red.

### Status pills
- **Complete:** teal wash, deep teal 12px 600 label with a check, fully round.
- **Incomplete:** red wash, red label with a printed count ("3 belum lengkap").

### Leaves (cards / containers)
- **Corner Style:** 14px.
- **Background:** white on passbook paper.
- **Shadow Strategy:** flat; the active leaf takes the Active leaf shadow (see Elevation).
- **Border:** 1px hairline; strong hairline when active.
- **Internal Padding:** 20px (ad leaves), 16px (side panels), 24 to 32px (success leaf).
- **Ad leaf stub:** printed two-digit numeral (faint, deep teal when active), bold ad name, 13px summary line, status pill, collapse and delete ghosts, hairline under the stub when open.

### Inputs / Fields
- **Style:** white, 1px strong hairline, 10px radius, 10px by 12px padding, 15px text; placeholders in faint ink. Hover darkens the border slightly.
- **Focus:** teal border plus a 3px teal halo at 18%.
- **Error:** red border, faint warm-white fill, red halo on focus, 13px red message beneath.
- **Character budget:** a 4px track in deep paper filling teal, amber past Meta's cut, with a printed "n/limit" figure at the right.

### Segmented control
An inset paper well (12px radius, 4px padding, hairline border) with 8px-radius segments; the chosen segment is white with ink text and the segment thumb shadow. Smaller variant (creative type) is a white well with 6px segments.

### Navigation (step header)
Three steps as 24px round dots with printed numbers, joined by short hairline rules. Active: teal dot, white figure, ink label. Done: teal wash dot with a check, deep teal label, teal rule. Upcoming: paper dot, faint label.

### Ledger (signature)
The "Rincian iklan" leaf: fixed three-column grid (44px No, fluid Iklan di Meta, 68px Sumber), 11px column heads on a paper band between hairlines, one row per ad with a deep teal three-digit figure, a 13px semibold name over an 11px faint detail, and the tracked kind label. Rows are buttons that jump to their leaf; the active card's rows take the teal wash. Each row prints in with a left-to-right clip reveal (220ms, cubic-bezier(0.16, 1, 0.3, 1)). A double rule closes the list above "Total iklan di Meta" and its printed total.

### Validation stamp (signature)
On a successful send: a violet double-ring circle, rotated -6deg, reading KAWANBANTU / DITERIMA in tracked bold capitals over the printed submission tail and receipt date. It lands with a 260ms scale-down from 1.25. Both animations are removed under reduced motion.

## Do's and Don'ts

### Do:
- **Do** set the page on passbook paper and every container on a white leaf with a 1px hairline.
- **Do** raise only the leaf being edited (Active leaf shadow plus strong hairline).
- **Do** print every system figure in Martian Mono with tabular numerals, zero-padded on stubs and ledger lines.
- **Do** use teal for actions and selection, deep teal whenever teal is text.
- **Do** keep one gradient primary button per screen, on the forward action.
- **Do** show unfilled things as dashed lines rather than hiding them.
- **Do** keep the ledger's columns fixed; only rows are added.

### Don't:
- **Don't** use purple anywhere except the primary gradient and the stamp.
- **Don't** put shadows on resting leaves or panels; overlays (popover, modal) and the depicted feed card are the only other lifted surfaces.
- **Don't** use red for anything but missing or invalid input and delete hover.
- **Don't** set words in Martian Mono, or figures meant to be printed in Figtree.
- **Don't** carry passbook decoration (ledger rules, stamps, mono) into form controls; fields stay plain.
