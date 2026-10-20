# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Staff at Indonesian NGOs (yayasan, community fundraisers) who run donation campaigns on KawanBantu. They fill this in mostly on a laptop, copying Google Drive links and ad copy from their own documents, usually for several stories at once. Many are not marketers or technical users. The second audience is the KawanBantu team, who receive the submission and turn it into Meta ads.

## Product Purpose
BantuAds Auto turns an NGO's ad content (Drive videos or images, or existing Instagram/Facebook posts, plus copy and a campaign link) into a submission that KawanBantu can run as Meta ads from the shared BantuAds ad account. Success: the NGO sends a complete, correct submission in one sitting without asking for help, and KawanBantu can process it without chasing missing details.

## Positioning
The NGO never touches Meta Ads Manager. They describe their ads in plain Indonesian; KawanBantu's pipeline does the Meta side (videos, ad sets, partnership identity).

## Operating Context
- Three steps NGOs already know: fill in the form, review, send ("Kirim ke KawanBantu"). Sending also saves a ZIP copy to Downloads as a backup.
- One card per story or campaign page; each Drive file or post inside a card becomes one ad, named "<Nama Iklan> 1", "2", ...
- Field order NGOs know: Nama NGO; per ad: sumber (Drive files or an existing IG/FB post), Nama Iklan, Link Halaman Campaign, creatives (Drive links, Video/Gambar, folder file counts) or post links, Primary Text, Headline.
- Existing-post ads require @kawanbantu as a collaborator and an accepted Partnership Ads request.
- Submissions land in KawanBantu's Google Sheet tracker; the NGO gets a submission number.

## Capabilities and Constraints
- Browser-only React app (Vite, Tailwind v4), hosted on Vercel; drafts autosave in localStorage.
- The generated XLSX and Python script must stay byte-identical for Drive ads (Meta bulk import and KawanBantu's pipeline depend on them).
- An unpublished "NGO own ad account" mode exists on a separate local branch and will be rebuilt on top of this app later.
- Meta truncates primary text after about 125 characters and headlines after about 40.

## Brand Commitments
- The BantuAds logo (`public/logo.png`) and KawanBantu's brand colours (teal #2A9E99, purple #8A59B3, ink #2B2033) stay. Type and everything else are open.
- Familiarity is binding: keep the same 3 steps, the same fields in the same order, one card per story with "+ Tambah Iklan", and the same Indonesian wording NGOs already know, so there is little to no learning curve.
- Interface copy is Indonesian.

## Evidence on Hand
- Real submission examples: ~60 past NGO ZIPs in ~/Documents/BANTUADSAUTO ZIPS (copy, campaign links, Drive files).
- No testimonials, metrics or claims are approved for the interface; do not invent any.

## Product Principles
- Nothing new to learn: an NGO who used the old form recognizes every step and field.
- Never leave them stuck: always say what is missing and take them to it.
- Show the ad they are making, so copy is written for the feed, not the form.
- Sending must never lose work: backup ZIP, retry, WhatsApp fallback.
