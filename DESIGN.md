---
name: BantuAds Auto
description: KawanBantu's ad submission form for NGOs, kept like a savings passbook.
colors:
  ink: "#2B2033"
  ink-soft: "#5C5466"
  ink-faint: "#6E6779"
  paper: "#F6F5F9"
  paper-deep: "#ECEAF2"
  leaf-white: "#FFFFFF"
  line: "#E4E1EB"
  line-strong: "#CDC8D8"
  brand: "#2A9E99"
  brand-deep: "#1E7672"
  brand-tint: "#E2F2F0"
  plum: "#8A59B3"
  plum-deep: "#6E3F97"
  plum-tint: "#F2ECF8"
  danger: "#C2413B"
  danger-tint: "#FBEDEC"
  warn: "#9A5F0E"
  warn-tint: "#FDF3E1"
typography:
  headline:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  section-title:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  body-small:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.43
  ledger-kind:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.06em"
  figure:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    fontFeature: "tnum"
  figure-badge:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    fontFeature: "tnum"
rounded:
  xs: "6px"
  sm: "8px"
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
    backgroundColor: "{colors.brand-deep}"
    textColor: "{colors.leaf-white}"
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
    rounded: "{rounded.sm}"
    padding: "6px 10px"
  button-ghost-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  field:
    backgroundColor: "{colors.leaf-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
  leaf:
    backgroundColor: "{colors.leaf-white}"
    rounded: "{rounded.leaf}"
  card-badge:
    backgroundColor: "{colors.plum-tint}"
    textColor: "{colors.plum-deep}"
    typography: "{typography.figure-badge}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  card-badge-active:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.leaf-white}"
  rail-icon:
    backgroundColor: "{colors.plum-tint}"
    textColor: "{colors.plum-deep}"
    rounded: "{rounded.pill}"
    size: "36px"
  chip-complete:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-deep}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  chip-incomplete:
    backgroundColor: "{colors.danger-tint}"
    textColor: "{colors.danger}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  tab:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  tab-active:
    backgroundColor: "{colors.plum-tint}"
    textColor: "{colors.plum-deep}"
  step-current:
    backgroundColor: "{colors.plum}"
    textColor: "{colors.leaf-white}"
    rounded: "{rounded.pill}"
    size: "24px"
  editing-banner:
    backgroundColor: "{colors.plum-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "16px 20px"
  detected-strip:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-deep}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
---

# Design System: BantuAds Auto

## Overview

**Creative North Star: "The Buku Tabungan"**

The submission is a savings passbook kept at a clean teller counter (Buku Tabungan, with Kwitansi cleanliness). A cool lavender-grey paper ground carries white leaves edged in hairlines; every ad the NGO describes prints as a numbered line in a ledger beside the form, and a successful send earns the teller's plum stamp. The passbook lives in its own places (number badges, the ledger, printed figures, the stamp); form controls stay plain, generous and receipt-clean.

Colour follows 70:20:10. Neutrals carry the page, teal does the work (actions, links, focus, done states), and plum marks identity and state (which card, which step, which tab, how far the send has got). One typeface carries every word; a monospace appears only where a figure is printed. Only the card being edited lifts.

**Key Characteristics:**
- Lavender-grey paper ground, white hairline leaves, flat at rest; one raised leaf.
- Teal for acting, plum for marking; a solid deep-teal primary button, no gradient.
- Poppins for every word; Martian Mono only for figures (ad numbers, counters, IDs, dates).
- Each ad card is a head plus three titled sections on a plum rail with icon circles.
- A sticky, fixed-height side column: one tabbed card (Pratinjau / Rincian iklan) above the action card.

## Colors

A calm KawanBantu palette in roughly 70:20:10: plum-tinted neutrals, a working teal, a marking plum.

### Primary
- **Counter Teal** (brand): focus ring, caret, selection wash, the selected creative-type segment, completed send steps, the character budget bar.
- **Deep Teal** (brand-deep): the primary button fill; teal whenever it is text (links, "Tambah ..." ghost actions, secondary button label, "Lengkap" chip, detected-files message).
- **Teal Wash** (brand-tint): "Lengkap" chip, detected-files strip, secondary hover, instructional note panels.

### Secondary
- **KawanBantu Plum** (plum): active card badge, header current step and its connecting rules, send progress bar and active step ring, the stamp's rings, the rail line (at 25%).
- **Deep Plum** (plum-deep): ledger figures, preview ad number, rail icons, active tab label, done header steps, stamp lettering, replacement note.
- **Plum Wash** (plum-tint): resting card badge, rail icon circles, active ledger rows, active tab, editing banner, partnership note.

### Neutral
- **Plum Ink** (ink): all primary text and headings.
- **Soft Ink** (ink-soft): supporting copy, hints, ghost labels, column heads, idle tabs.
- **Faint Ink** (ink-faint): placeholders, creative row numbers, blank ledger lines, metadata.
- **Passbook Paper** (paper): page ground, ghost hover, inset wells.
- **Deep Paper** (paper-deep): empty bar tracks, the ledger tab's idle count chip, preview media ground.
- **Leaf White** (leaf-white): leaves, fields, header step pill.
- **Hairline** (line) and **Strong Hairline** (line-strong): leaf borders and dividers; field borders, the ledger's double total rule, dashed blank lines.

### Status
- **Missing Red** (danger) on **Missing Wash** (danger-tint): required asterisks, field errors, invalid borders, "belum lengkap" chips, the missing-items list, delete hover.
- **Amber Cut** (warn) on **Amber Wash** (warn-tint): text past Meta's cut-off, a folder whose file count could not be read, duplicate-name notice. A guide, never a blocker.

### Named Rules
**The Teal Acts Rule.** Anything the NGO presses, follows or has finished is teal: buttons, links, focus, done and complete states. Deep teal whenever teal is text or a button fill.

**The Plum Marks Rule.** Plum says which and where (this card, this step, this tab, this far, received). It never fills an action button.

**The Red Means Missing Rule.** Danger red is reserved for missing or invalid input and the delete hover. It never decorates.

## Typography

**Body Font:** Poppins (with ui-sans-serif, system-ui), weights 400 to 700
**Figure Font:** Martian Mono (with ui-monospace), weights 400 and 500, tabular numerals

**Character:** A round, friendly geometric sans speaks plain Indonesian; a squared monospace is the passbook printer, used only where a number is printed.

### Hierarchy
- **Headline** (700, 1.75rem, tight, -0.02em): one per screen ("Submission Iklan", "Review Sebelum Kirim", "Submission Terkirim").
- **Title** (600, 16px): ad name in a card head, progress and review card titles. Modal title 1.125rem bold.
- **Section title** (600, 15px): the three rail sections ("Info iklan", "Creatives", "Teks iklan").
- **Body** (400, 15px, relaxed): intros under the headline. Field text is 14px.
- **Body small** (400, 13px): hints, summaries, section notes, ledger names (600 when the line's title).
- **Label** (600, 14px): field labels, red asterisk when required.
- **Ledger kind** (600, 11px, 0.06em, capitals as data): VIDEO, GAMBAR, POST in the Sumber column.
- **Figure** (Martian Mono 400 to 500, 12px; 14px in the card badge).

### Named Rules
**The Printed Figure Rule.** A number the system prints (ad number, counter, character budget, submission ID, receipt date, percentage) is Martian Mono with tabular numerals. Every word stays in Poppins.

**The Zero-Pad Rule.** Card numbers are two digits ("01"), ledger lines three ("001"); a blank ledger line prints "---".

## Layout

A 1280px container with 16px gutters (32px from 640px). The header is not sticky: logo left, a white pill of three numbered steps right, and it scrolls away with the page. There is no fixed bottom bar.

From 1024px the form screen is two columns 32px apart: a fluid form column (title, intro, optional editing banner, Nama NGO leaf, ad cards, dashed "Tambah Iklan" slot) and a sticky side column of 380px (400px from 1280px) that sits 20px from the top with a fixed height of the viewport minus 6.5rem (minimum 32rem). The column holds one tabbed card that takes the remaining height above the action card. The ledger list scrolls inside its tab while its header row and Total line always show. Below 1024px the panel stacks under the form and the ledger caps at 18rem.

Form column items sit 20px apart; ad cards 16px apart. Card head pads 24px by 16px; body 24px sides, 24px top, 28px bottom; rail sections are 32px apart. Review is a centred 768px column, success 576px. Spacing runs on a 4px base, mostly 8, 12, 16, 20, 24, 32.

### Named Rules
**The Total Always Shows Rule.** However long the ledger grows, its column heads and "Total iklan di Meta" line stay fixed; only the rows scroll.

## Elevation & Depth

Flat by default: depth is tonal (white leaves on lavender paper) and drawn with 1px hairlines. Shadows appear only to say something: this card is being edited, this is the action, or this layer floats.

### Shadow Vocabulary
- **Active leaf** (`0 1px 2px rgb(43 32 51 / 0.05), 0 16px 36px -20px rgb(110 63 151 / 0.45)`): the card being edited, border mixed 30% toward plum. Plum-tinted because it marks which card.
- **Primary lift** (`0 6px 16px -8px` deep teal at 70%): under the primary button only.
- **Feed card** (`0 6px 20px -12px rgb(43 32 51 / 0.35)`): the mock Meta post in Pratinjau.
- **Segment thumb** (`0 1px 3px rgb(43 32 51 / 0.12)`): the chosen source segment.
- **Modal** (`0 24px 48px -20px rgb(43 32 51 / 0.45)`) over a 50% ink scrim: the Drive guide.

### Named Rules
**The One Raised Leaf Rule.** At rest no leaf carries a shadow. Only the card being edited lifts.

## Shapes

Soft rounding that grows with the surface: 6px for small segments, 8px for ghosts, tabs, number badges and inline strips, 10px for fields, 12px for buttons, inset wells and notes, 14px for leaves, 16px for the editing banner, success note, feed card and the dashed add slot. Chips, step dots, rail icons and the progress bar are fully round. Borders are 1px hairlines; the secondary button uses 1.5px teal. Passbook marks: a 2px double rule above the ledger total, dashed strokes for anything not yet filled (blank ledger lines, the "Tambah Iklan" slot in teal at 50%), and the stamp, a 144px circle with 3px and 1px plum rings rotated -6deg.

## Components

### Buttons
Few and plain; one primary per screen.
- **Primary:** solid deep teal, white 15px bold label, 12px radius, primary lift; hover darkens 16% toward black, press nudges 1px, disabled 55% opacity. "Review Sebelum Kirim", "Kirim ke KawanBantu".
- **Secondary:** white with a 1.5px teal border, deep teal 600 label; hover fills teal wash.
- **Ghost:** no fill, soft ink 14px 600, 8px radius; hover paper and ink. Deep-teal ghosts are the "Tambah ..." actions; icon-only ghosts collapse and delete (delete hovers red).

### Chips
- **Lengkap:** teal wash, deep teal 12px 600 with a check, fully round.
- **Belum lengkap:** red wash, red label with a printed count.

### Leaves (cards / containers)
- **Corner / Background / Border:** 14px, white, 1px hairline; the active card takes the plum-mixed border and Active leaf shadow.
- **Padding:** 16px (side panel cards, Nama NGO 20px by 16px), 20 to 24px (review, progress), 24 to 32px (success).

### Inputs / Fields
- **Style:** white, 1px strong hairline, 10px radius, 10px by 12px, 14px text; hover darkens the border.
- **Focus:** teal border and a 3px teal halo at 18%.
- **Error:** red border, warm-white fill, red halo on focus, 13px red message beneath.
- **Character budget:** 4px deep-paper track filling teal, amber past the cut, printed "n/limit" at right.

### Navigation (step header)
A white hairline pill of three 24px dots with printed numbers joined by short rules. Current: plum dot, white figure, ink label. Done: plum wash dot with a check, deep plum label, plum rule. Upcoming: paper dot, faint label (label hidden below 640px).

### Ad card (signature)
- **Head:** plum number badge (plum wash and deep plum at rest, solid plum with white when active), 16px semibold name over a 13px summary (counts and campaign link), "Lengkap" or "belum lengkap" chip, collapse and delete ghosts; hairline below when open.
- **Body:** three titled sections on a vertical plum rail (1px at 25%), each marked by a 36px plum-wash icon circle (link for Info iklan, video or image for Creatives or Postingan, text lines for Teks iklan), not by numbers. Title 15px semibold with a 13px note; an optional aside at right ("Panduan Upload Link Drive").
- **Creative rows:** sit directly on the rail with 10px between them, no nested box: a faint row number, the field, a Video/Gambar segment (selected is solid teal). A Drive folder adds an inline strip: teal wash when files are detected, amber wash when the count must be typed.
- **Source switch:** a paper well segmented control; chosen half is white with the segment thumb.

### Side panel
- **Tabbed card:** a tab strip of two equal tabs (Pratinjau / Rincian iklan with a printed ad count); active tab plum wash with deep plum label. Pratinjau shows "Iklan 01 · name" and the mock feed card; Rincian iklan shows the ledger.
- **Ledger:** fixed three-column grid (44px No, fluid "Iklan di Meta", 68px Sumber) under an 11px column band on paper; rows carry a deep-plum three-digit figure, 13px semibold name over 11px faint detail, and the ledger kind. Rows are buttons that jump to their card; the active card's rows take plum wash. Rows print in left to right (220ms, cubic-bezier(0.16, 1, 0.3, 1)).
- **Action card:** printed counts ("iklan diisi", "iklan di Meta"), the red-wash missing list (up to five items, each jumping to its field), and the full-width primary button.

### Review and send
Review stacks a summary leaf (NGO, ad count, source, date; figures in mono), one leaf per card repeating the ledger numbering, and an inline action leaf (Kembali Edit, Kirim ke KawanBantu; on failure a red alert, retry and a WhatsApp fallback ghost). Sending swaps that leaf for **SendProgress**: title with a printed percentage, a 10px plum bar with a moving sheen (role=progressbar), three steps (done teal check, active plum ring with a pulsing dot, upcoming hairline), and a visually hidden live label announcing the current step.

### Success and stamp (signature)
The success leaf pairs the headline with the **stamp**: a plum double ring rotated -6deg reading KAWANBANTU / DITERIMA in tracked bold capitals over the printed submission tail and receipt date, landing with a 260ms scale-down from 1.25. A replacement note in deep plum names the submission it supersedes. Below: a teal-wash partnership note, Download Salinan ZIP (secondary), Edit Submission (ghost) with a note that a re-send replaces this version, and Buat Submission Baru (ghost). All motion is removed under reduced motion.

## Do's and Don'ts

### Do:
- **Do** keep the page on passbook paper and every container on a white leaf with a 1px hairline.
- **Do** raise only the card being edited (Active leaf shadow and plum-mixed border).
- **Do** use teal for actions, links, focus and done states; deep teal when it is text or a fill.
- **Do** use plum for identity and state: card badge, active card, current step, rail, ledger figures, active rows and tab, editing banner, progress bar, stamp.
- **Do** print every system figure in Martian Mono with tabular numerals, zero-padded on badges and ledger lines.
- **Do** mark card sections with rail icons, and keep creative rows directly on the rail.
- **Do** show unfilled things as dashed lines rather than hiding them.

### Don't:
- **Don't** put a gradient or plum on any button; the primary is solid deep teal.
- **Don't** make the header sticky or add a fixed bottom bar; the action lives in the side column.
- **Don't** nest creative rows in their own bordered box inside a card.
- **Don't** shadow resting leaves; only the active card, the primary button, the feed card, the segment thumb and the modal lift.
- **Don't** use red for anything but missing or invalid input and delete hover.
- **Don't** set words in Martian Mono, or printed figures in Poppins.
