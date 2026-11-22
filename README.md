# Surat Homes: tracking practice site (fictional, educational)

Static HTML/CSS/vanilla JS. No backend, database, or paid service. Enquiry data is never sent or stored.
**CAPI is NOT implemented.** Sending conversions to Meta's Conversions API needs a real server-side backend or a supported integration (e.g. GTM server container). This site only provides a `Lead` event with a unique `event_id` you can later use to deduplicate browser and server events.

## 1. Add your GTM container ID
Edit `js/config.js` and replace `GTM-XXXXXXX`. Nothing else is needed; `js/tracking.js` loads GTM on every page. Do not put Meta Pixel or GA4 IDs in the code; add them as tags inside GTM.

## 2. Upload to GitHub
1. Create a GitHub account, then **New repository** (e.g. `surat-homes`, Public).
2. Click **uploading an existing file**, drag in the *contents* of this folder (index.html at the repo root, plus `css/` and `js/` folders; include `.nojekyll` if visible), then **Commit changes**.
   (Or with git: `git init && git add . && git commit -m "init" && git branch -M main && git remote add origin <repo-url> && git push -u origin main`.)

## 3. Publish with GitHub Pages
Repo **Settings > Pages > Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, folder `/ (root)`, **Save**. After 1-2 minutes the site is at `https://<username>.github.io/surat-homes/`. All paths are relative, so the sub-path works.

## 4. Events
| Visitor action | Event | Fires when | Extra fields |
|---|---|---|---|
| Any page opens | `PageView` | Once per page load (DOM ready) | page_url, page_path, page_title, UTMs |
| Property details viewed | `ViewContent` | Once on `property.html?id=...` when the property loads | property_id, property_name, value, currency |
| Enquiry button clicked | `Contact` | Click on "Enquire About This Property" (once per page load) | property_id, property_name |
| Enquiry submitted | `Lead` | Only after all required fields validate and the simulated 0.6s submit finishes; never on an invalid click; once per page | property_id, property_name, value, currency, form_id |

Every event also carries a unique `event_id`, `page_url` and any `utm_*` values. No name, phone, email or message is ever included.
Meta tip: `PageView` is pushed to dataLayer. If you trigger your Meta Pixel PageView from this custom event, don't also fire the Pixel base on "All Pages", or it will count twice. Use `event_id` as the Pixel `eventID` for Lead.

## 5. UTM parameters
Try: `index.html?utm_source=facebook&utm_medium=paid_social&utm_campaign=diwali_2026&utm_content=video1&utm_term=surat_flats`
They are saved in `sessionStorage` (this tab only) and attached to every event. Add `?debug=1` to any URL for an on-screen panel showing current UTMs and every event pushed (turns off when the tab closes).

## 6. Testing dataLayer
**Console (works without GTM):** open DevTools (F12), Console, type `dataLayer` and expand entries; look for `event: "PageView"` etc.
**On Android Chrome:** use the `?debug=1` panel, or connect via USB and open `chrome://inspect` on desktop Chrome.
**GTM Preview:** in GTM click **Preview**, enter your GitHub Pages URL, connect, then use the site. In Tag Assistant's left panel select each event and open the **Data Layer** tab.
**Setup in GTM:** create Custom Event triggers named exactly `PageView`, `ViewContent`, `Contact`, `Lead`; create Data Layer Variables for `event_id`, `property_id`, `value`, `utm_source`, etc.; attach your Meta Pixel and GA4 event tags to those triggers.
**Checks:** invalid form = no `Lead`; valid form = exactly one `Lead`; reload `property.html?id=SH-101` = one new `ViewContent`.

## Replacing images
Property pictures are generated illustrations (so the site has no external dependencies). To use real photos, add files to an `images/` folder and set `img: 'images/name.jpg'` on the property in `js/data.js`. Use only photos you have rights to.
