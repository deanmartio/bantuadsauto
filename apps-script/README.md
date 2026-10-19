# BantuAds intake (Google Apps Script)

`Code.gs` receives submissions from the "Kirim ke KawanBantu" button, saves each ZIP to the
Drive folder **BantuAds Submissions** (one subfolder per submission) and logs one row in the
Google Sheet **BantuAds Submission Tracker**.

## First-time deploy
1. Open https://script.google.com with deanmartio@kawanbantu.com and create a **New project**.
   Rename it "BantuAds Intake".
2. Delete the sample code in `Code.gs`, paste this folder's `Code.gs`, and save.
3. Choose `setup` in the function menu, click **Run**, and approve the permission prompts.
   The log shows the folder and tracker links.
4. **Deploy > New deployment > Web app**. Set Execute as **Me** and Who has access **Anyone**,
   then Deploy. Copy the Web app URL that ends in `/exec`.
5. Put that URL in `src/config.js` as `SUBMIT_URL`, then commit and push.
6. Run `showAdminKey`, and save the URL and key for the processing command in
   `~/Documents/BANTUADSAUTO ZIPS/.bantuads_tracker.json` as `{"url": "...", "key": "..."}`.
   That file must never go into git.

## Updating the code later
Paste the new `Code.gs`, save, then **Deploy > Manage deployments > edit (pencil) >
Version: New version > Deploy**. The `/exec` URL stays the same.

## Actions
| action | who | body |
|---|---|---|
| `submit` | public (the app) | `ngoName, submissionDate, adCount, mode, postLinks, zipName, zipBase64` |
| `list` | admin key | optional `status` (e.g. `Received`) |
| `update` | admin key | `submissionId`, optional `status`, optional `note` (appended with a timestamp) |
| `zip` | admin key | `submissionId`, returns the ZIP as base64 |

Status values: Received, Processed, Ready to publish, Published, Problem.
