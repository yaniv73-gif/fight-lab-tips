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
- **Data store:** one Google Sheet, two tabs (`Tips`, `Publications`), acting purely as an invisible backing store. Yaniv never needs to open it — the app is the only interface for reading and writing data. It exists as an inspectable/exportable backup, not as a UI he manages.
- **Reads:** the app fetches the Sheet's published data on load.
- **Writes:** a single Google Apps Script Web App bound to the Sheet, exposing endpoints for: add idea, attach video to a tip, log a publish. One-time setup in Yaniv's Google account (~5 minutes, walked through, no coding needed from him).
- **Video:** clips are uploaded to YouTube (unlisted for internal-library-only clips, or public/unlisted per platform norms when actually published — the "published" log entry captures wherever it actually lives).
- **Access:** a simple PIN screen gates the whole app before load. Not real security — a speed bump against casual snooping, not a system to maintain.

## Data model

Status is **derived**, never manually set, to avoid drift between reality and a stale flag:

| Status | Rule |
|---|---|
| Idea | no `youtube_url` |
| Filmed (and not published) | `youtube_url` set, zero `Publications` rows |
| Published | `youtube_url` set, one or more `Publications` rows |

**Tips** (tab 1)
| Field | Notes |
|---|---|
| id | row identifier |
| title | concept/technique name (Hebrew) |
| category | free text — open-ended, typed or picked from existing values, not a fixed enum |
| tags | comma-separated technique tags, many-to-many by nature (one concept can tag multiple techniques) |
| youtube_url | nullable until filmed |
| note | short one-line explanation |
| date_added | |
| date_filmed | nullable, set when `youtube_url` first attached |

**Publications** (tab 2) — one Tip can have many Publications (e.g. posted to Instagram today, TikTok next week)
| Field | Notes |
|---|---|
| id | |
| tip_id | FK to Tips |
| platform | YouTube / Instagram / Facebook / TikTok |
| published_date | |
| post_url | optional, link to the actual live post (needed later for Phase 2 engagement sync) |

## Screens

1. **Browse / filter** — search bar + multi-select filter chips (category, technique tags, and status: idea=gray outline, filmed=black, published=brand red), results as a thumbnail grid. Multi-select chips chosen deliberately over single-category tabs because tags are many-to-many, not mutually exclusive.
2. **Detail (full page)** — own URL/back button, not a modal, so a specific tip is shareable/bookmarkable. Shows embedded video (if filmed), title, tags, note, and publication history. Two contextual actions: "Mark as filmed" (opens video-link field, only shown for Idea-status tips) and "Log a publish" (platform, date, optional post link — only shown once filmed).
3. **Add-tip wizard (3 steps)** — chosen over a single long form because this gets filled out often and repeatedly, and shorter focused screens beat one big scroll for a repeated task.
   - Step 1: paste YouTube link (**skippable** — skipping saves an Idea-only entry with no video, to be filmed later).
   - Step 2: title + category (type new or pick existing).
   - Step 3: technique tags + short note → save.

## Phase 2 (separate effort, not designed yet)

Daily automated engagement sync (likes/comments/views pulled from Instagram/Facebook/TikTok into the app). Explicitly deferred because:
- Requires confirming whether Yaniv's existing Meta connection covers **organic post insights** (different permission scope than ad-account/ads-insights access he already has).
- May need a genuinely separate one-time API setup with Meta, which could involve app review delay — not something to design blind.
- Will get its own spec once Phase 1 is live and access is confirmed.

## Edge cases considered

- **Re-filming a tip:** overwriting `youtube_url` is sufficient for v1; no version history of video links.
- **Multiple publishes of the same tip:** supported natively via multiple `Publications` rows per `tip_id`.
- **Unlisted YouTube privacy:** anyone with the exact link can view — acceptable for internal clips, but not true privacy; flagged to Yaniv, not a security guarantee.
- **PIN gate:** client-side only, deters casual browsing, not a real access control — acceptable given this is a personal tool with no sensitive data beyond training content.
- **Category sprawl:** open-ended categories mean typos could fragment the list (e.g. "שליטה ולחץ" vs "שליטה ולחץ "). Add-tip wizard should suggest/autocomplete from existing category values to reduce drift.
