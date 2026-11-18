---
name: BantuAds Auto
description: KawanBantu's ad submission form for NGOs, laid out like a campaign desk ("Meja Kampanye").
colors:
  ink: "#2B2033"
  ink-soft: "#5C5466"
  ink-faint: "#6E6779"
  ground: "#FCFCFA"
  paper: "#F6F5F9"
  paper-deep: "#ECEAF2"
  leaf-white: "#FFFFFF"
  line: "#E4E1EB"
  line-strong: "#CDC8D8"
  brand: "#2A9E99"
  brand-deep: "#1E7672"
  brand-tint: "#E2F2F0"
  desk: "#17615E"
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
    fontSize: "2.5rem (2rem below 640px; 2rem on success)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  card-number:
    fontFamily: "Poppins"
    fontSize: "2.375rem open, 1.75rem collapsed, 2rem on review"
    fontWeight: 800
    letterSpacing: "-0.04em"
  card-title:
    fontFamily: "Poppins"
    fontSize: "19px"
    fontWeight: 700
  part-title:
    fontFamily: "Poppins"
    fontSize: "17px"
    fontWeight: 700
  body:
    fontFamily: "Poppins"
    fontSize: "15px intro, 14px fields, 13px notes"
    fontWeight: 400
  figure:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "11 to 15px"
    fontFeature: "tnum"
rounded:
  field: "12px"
  tile: "16px"
  slip: "18px"
  card: "22px"
  desk: "28px"
  phone: "34px outer, 26px screen"
  button: "9999px"
---

# Design System: BantuAds Auto

## Overview

**Creative North Star: "Meja Kampanye" (the campaign desk).** Dean picked this direction on 2026-11-18 over a calmer option ("Bersih"); both mockups are in `mockups/` (not deployed). It replaced the October "Buku Tabungan" passbook look after the Nov 15 2026 "no AI look" lessons (kawanbantu-knowledge `references/no-ai-look.md`).

The NGO fills in white cards that sit on a near-white ground with a soft teal and purple wash. Beside the form stands one deep teal desk where the ad they are making shows on a phone, with a white slip at the bottom holding the counts and the one button. One bold thing per area: the big ad number on each card, the phone on the desk.

**Key characteristics**
- Ground #FCFCFA with two soft radial washes (teal top left, purple bottom right), fixed behind the page.
- White borderless cards with a soft shadow; the card being edited gets a thin deep-teal ring and a teal number, others show a grey number.
- Parts of a card are set apart by space and plain bold titles. No rails, no icon circles, no tinted chips.
- Real platform logos (Google Drive, Instagram, Facebook) mark each content line.
- The deep teal desk is the only big colour plane. Text on it is white (never light teal on teal).
- Pill buttons; one primary (solid deep teal) per screen.

## Colour rules

- **Teal acts and marks.** Deep teal fills the primary button, the chosen Video/Gambar segment, the active card ring and number, done header segments, links, and the desk.
- **No tonal text.** Never a light tint of a hue on that same hue (teal on teal wash, lilac on plum). On the desk, text is white or white at 80 to 85%. Status uses a solid dot or circle with ink or red text.
- **Plum is kept small**: the success stamp, the replacement note, the "1 langkah terakhir" phrase. It never fills a button.
- **Red means missing**: required asterisks, field errors, the red ring on an invalid content tile, the "belum lengkap" status and list, delete hover.
- **Amber** only for a folder whose file count must be typed and text past Meta's cut-off.

## Typography

Poppins for every word: 800 and tightly tracked for headlines and card numbers, 700 for card and part titles, 400 for body. Martian Mono only for printed figures (ledger numbers, counters, submission ID, dates, character budgets). At most four sizes in any one area.

## Layout

1280px container, 16px gutters (32px from 640px). The header is not sticky: logo left, a three-segment progress bar right (3px rules; done and current in deep teal, upcoming in strong hairline).

From 1024px: form column plus a 400px desk (420px from 1280px), 36px apart. The desk is sticky 20px from the top, at most the viewport height minus 2.5rem; its preview or ledger scrolls inside while the action slip stays. Below 1024px the desk stacks under the form.

Form column items 24px apart. Card head 28px sides; card parts 32px apart. Review is a centred 768px column, success 576px.

## Components

### Ad card
- **Head:** big number (01), 19px name over a 13px summary ("1 video + 2 postingan · link"), status ("Lengkap" with a solid teal check circle, or red "N belum lengkap" with a red ! circle), a "Ringkas/Buka" text button (chevron on phones) and delete.
- **Info iklan:** Nama Iklan and Link Halaman Campaign side by side.
- **Creatives:** one list. Each line is a paper tile (16px radius): white logo chip, the link as an inline borderless input, a line under it with the printed position and what the link is ("Folder Google Drive", "Postingan Instagram, caption aslinya dipakai"). Drive lines carry a white pill Video/Gambar segment (under the link on phones). Folder lines add the file-count strip inside the tile. Below the list a dashed "Tempel link Drive, IG atau FB" slot: pasting one or many links adds one line each; typing a link and pressing Enter (or leaving the field) adds it.
- **Teks iklan:** Primary Text (counter, 1000 max) and Headline (40-character budget bar). Hidden when every link in the card is a post.
- **Tambah Iklan:** a dashed teal slot at the end of the list.

### Desk (side column)
- Top line: "Iklan 01 · name" and how many Meta ads this card makes.
- Pill tabs on a dark well: Pratinjau / Rincian iklan (with the total). The active tab is white with desk-teal text.
- **Pratinjau:** the feed ad inside a black phone frame (34px radius); thumbnails of each Drive file below it as a picker, with "N iklan terpisah di Meta". A card of posts only shows a short white note instead; a mixed card adds "+ N postingan IG/FB" under the phone.
- **Rincian iklan:** a white slip with the ledger: three-digit teal figures, name over detail, source (VIDEO, GAMBAR, POST), fixed column heads and "Total iklan di Meta".
- **Action slip:** white, counts in mono, the red missing list (up to five, each jumps to its field), full-width "Review Sebelum Kirim".

### Review, send and success
Review: headline, summary card, one card per ad with the big number, its text and the list of Meta ads, the collaborator step for Instagram posts, then the action card (Kembali Edit, Kirim ke KawanBantu; retry and WhatsApp fallback on failure). Sending shows SendProgress. Success keeps the plum KAWANBANTU / DITERIMA stamp, the submission number and the ZIP note.

## Do and don't

- **Do** keep the ground near-white with the soft wash, and colour in objects (the desk, the phone, logos, numbers).
- **Do** let each area have one bold element; keep the rest quiet.
- **Do** show unfilled things as dashed slots.
- **Don't** add icon circles above or beside section titles, coloured stripes on cards, or tinted pill labels.
- **Don't** put tonal text anywhere (light teal on teal, lilac on plum).
- **Don't** make the header sticky or add a fixed bottom bar.
- **Don't** set words in Martian Mono or printed figures in Poppins.
