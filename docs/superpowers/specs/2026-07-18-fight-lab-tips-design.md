# Fight Lab Tips — Design Spec

**Date:** 2026-07-18
**Owner:** Yaniv (Fight Lab, Tel Aviv)
**Status:** Approved for planning

## Purpose

A personal content-pipeline app for Yaniv to manage BJJ/Muay Thai/MMA teaching tips and techniques from idea through filming through publishing to social media. Fully separate from the existing Fight Lab Trainer app — different update cadence (personal content vs. member data), different owner-only audience.

Seed content: the topic/concept list Yaniv has already drafted (general principles, control & pressure, specific positions/situations — e.g. "קרוס פייס", "קו המשווה", "מרפק מעל כתף") becomes the initial batch of **Idea** entries.

## Non-goals (Phase 1)

- No automated social engagement sync (Phase 2 — see below).
- No student/member-facing view — this is Yaniv-only.
- No offline caching / installable PWA polish — can be added later if gym wifi proves to be a problem.
- No historical engagement trend tracking — out of scope until Phase 2 exists at all.

## Architecture

- **New standalone repo** (`fight-lab-tips`), React + Vite, deployed to its own GitHub Pages URL — mirrors the stack of the existing Fight Lab Trainer app so Yaniv's existing deploy workflow (`npm run deploy`) applies to app-code changes.
- **Data store:** Supabase (Postgres) — a real relational database, reusing the same platform Yaniv already runs for Fight Lab Trainer (separate project, not shared data). Two tables: `tips` and `publications` (a normal foreign key, `publications.tip_id → tips.id` — no subcollection workaround needed like Firestore would have required). Free tier covers Phase 1 easily.
- **Reads/writes:** the React app talks to Supabase directly via the `@supabase/supabase-js` client (already a proven dependency from the trainer app). No separate write-API layer to build or deploy. Data can update live via Supabase's realtime subscriptions without a page reload.
- **Access:** Supabase Auth, a single email/password login (Yaniv's only). Row Level Security (RLS) policies restrict all reads/writes to that one authenticated user — this is real access control, not a speed bump, and replaces the earlier PIN-screen idea entirely.
- **Video:** clips are uploaded to YouTube (unlisted for internal-library-only clips, or public/unlisted per platform norms when actually published — the "published" log entry captures wherever it actually lives).
- **One-time setup:** create a new Supabase project (separate from the trainer app's project), enable email/password auth, create Yaniv's one login, write the RLS policies — walked through together, ~10 minutes, no ongoing maintenance.
- **Cost note:** Phase 1 needs no billing — Supabase's free tier covers it. Phase 2's daily scheduled sync also needs no billing: Supabase's `pg_cron` extension runs scheduled jobs even on the free tier (unlike Firebase, which required a paid plan for this). One real caveat: free-tier projects auto-pause after 7 days of total inactivity — not a concern at Yaniv's regular usage pattern, but worth knowing if the app goes unused for a stretch.

## Data model

Status is **derived**, never manually set, to avoid drift between reality and a stale flag:

| Status | Rule |
|---|---|
| Idea | no `youtube_url` |
| Filmed (and not published) | `youtube_url` set, zero rows in `publications` for this tip |
| Published | `youtube_url` set, one or more rows in `publications` |

**`tips` table** — one row per tip
| Column | Type | Notes |
|---|---|---|
| id | uuid, primary key | |
| title | text | concept/technique name (Hebrew) |
| category | text | free text — open-ended, typed or picked from existing values, not a fixed enum |
| tags | text[] | real Postgres array column, many-to-many by nature (one concept can tag multiple techniques) — no comma-splitting a string |
| youtube_url | text, nullable | nullable until filmed |
| note | text | short one-line explanation |
| date_added | timestamptz | defaults to `now()` |
| date_filmed | timestamptz, nullable | set when `youtube_url` first attached |

**`publications` table** — one row per platform post, real foreign key back to its tip
| Column | Type | Notes |
|---|---|---|
| id | uuid, primary key | |
| tip_id | uuid, references `tips(id)` | standard FK — Postgres makes this the natural choice, no workaround needed |
| platform | text | YouTube / Instagram / Facebook / TikTok |
| published_date | timestamptz | |
| post_url | text, nullable | optional, link to the actual live post (needed later for Phase 2 engagement sync) |

## Screens

1. **Browse / filter** — search bar, then two visually and structurally separate filter groups, not one flat row:
   - **Status** (its own labeled group: idea=gray outline, filmed=black, published=brand red) — a pipeline stage, not a content category.
   - **Category & technique tags** (a separate labeled group, multi-select chips) — content classification, many-to-many by nature.

   Results as a thumbnail grid. Multi-select chips chosen deliberately over single-category tabs for the category/tag group because tags are many-to-many, not mutually exclusive — but that reasoning doesn't extend to status, which is why status stays its own group rather than joining the same chip row.
2. **Detail (full page)** — own URL/back button, not a modal, so a specific tip is shareable/bookmarkable. Shows embedded video (if filmed), title, tags, note, and publication history. Two contextual actions: "Mark as filmed" (opens video-link field, only shown for Idea-status tips) and "Log a publish" (platform, date, optional post link — only shown once filmed).
3. **Add-tip wizard (3 steps)** — chosen over a single long form because this gets filled out often and repeatedly, and shorter focused screens beat one big scroll for a repeated task.
   - Step 1: **record now** (in-browser camera capture via `MediaRecorder`, then hand the clip to the phone's native Share sheet to finish uploading through the YouTube app — no API integration, no Google review), **paste an existing YouTube link**, or **skip entirely** (saves an Idea-only entry with no video, to be filmed later).
   - Step 2: title + category (type new or pick existing).
   - Step 3: technique tags + short note → save.

## Phase 2 (separate effort, not designed yet)

Daily automated engagement sync (likes/comments/views pulled from Instagram/Facebook/TikTok into the app). Explicitly deferred because:
- Requires confirming whether Yaniv's existing Meta connection covers **organic post insights** (different permission scope than ad-account/ads-insights access he already has).
- May need a genuinely separate one-time API setup with Meta, which could involve app review delay — not something to design blind.
- Will get its own spec once Phase 1 is live and access is confirmed.

## Flagged, not scoped: automated cross-posting

Publishing stays a **manual act** in this design (Yaniv posts via each platform's own app, then logs it in ours). Auto-publishing straight from the app — one tap to push a clip to Instagram/TikTok — was considered and is explicitly **not** part of any current phase. Real costs, checked directly against Meta/TikTok's current requirements:

| Cost type | Instagram (Meta Content Publishing API) | TikTok (Content Posting API) |
|---|---|---|
| API usage fee | None — free at the platform level | None |
| Approval process | Meta App Review + Business Verification (official business documents, tax paperwork), a recorded screencast showing the exact auth+publish flow, a hosted privacy policy | Manual audit, typically multiple feedback rounds, demo video/screenshots, hosted privacy policy |
| Timeline | 2–4 weeks per review round; budget 6–8 weeks realistically | 2–6 weeks |
| Until approved | N/A once live | Posts restricted to **private-only** visibility until the audit passes — useless for real publishing in the meantime |
| Rate limits | ~25 posts/24hr per account (a non-issue at Yaniv's cadence) | ~15 posts/24hr per creator account |
| Hidden infrastructure cost | Both APIs require the video at a plain public file URL — a YouTube watch link doesn't qualify. Would force raw video onto paid file storage (Supabase Storage or similar) after all, reintroducing the storage/bandwidth cost Phase 1 deliberately avoided | Same |
| Ongoing cost | Token refresh logic that must never silently break; Meta ships API changes quarterly, requiring periodic maintenance | Similar ongoing maintenance burden |

**Recommendation: don't build this.** The entire task it would replace is a ~10-second manual tap to post from a phone's native app — the review timelines, paperwork, and ongoing maintenance cost badly outweigh the time saved for a solo user's posting cadence. Documented here so it's a deliberate skip, not an oversight — revisit only if publishing volume grows enough that the manual step becomes a genuine bottleneck.

**Related, same reasoning: no direct API auto-upload to YouTube either.** In-app camera recording (Step 1 of the add-tip wizard) is in scope — but automatically pushing that recording straight onto YouTube as unlisted via the YouTube Data API is not. Google restricts unverified apps to **private-only** uploads (not unlisted/public); getting real unlisted upload access requires passing Google's own compliance audit (demo video, ToS agreement, review) — a real process, in the same category of cost as the Meta/TikTok audits above, just lighter weight. Instead, the recorded clip is handed to the phone's native Share sheet to finish uploading through the YouTube app itself (one tap, no API, no audit) — Yaniv pastes the resulting link back into the wizard exactly as if he'd filmed with the native camera app.

## Edge cases considered

- **Re-filming a tip:** overwriting `youtube_url` is sufficient for v1; no version history of video links.
- **Multiple publishes of the same tip:** supported natively via multiple rows in `publications` sharing the same `tip_id`.
- **Unlisted YouTube privacy:** anyone with the exact link can view — acceptable for internal clips, but not true privacy; flagged to Yaniv, not a security guarantee.
- **Row Level Security policies:** must explicitly restrict all reads/writes on both tables to Yaniv's authenticated user id — RLS is opt-in per table in Supabase, and a table left without policies enabled defaults to fully accessible via the API. This is a real access-control point to get right during implementation, not an afterthought.
- **Category sprawl:** open-ended categories mean typos could fragment the list (e.g. "שליטה ולחץ" vs "שליטה ולחץ "). Add-tip wizard should suggest/autocomplete from existing category values to reduce drift.
- **In-app recording browser support:** `MediaRecorder` + camera access is well-supported on Android Chrome (Yaniv's S23 Ultra) and on iOS Safari 14.5+. The recorded format (WebM on Chrome, MP4 on Safari) needs `MediaRecorder.isTypeSupported()` feature detection so the app picks a format the device can actually produce, rather than assuming one codec everywhere.
