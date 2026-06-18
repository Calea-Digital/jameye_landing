# Jameye Landing — Data & Cookies Inventory

> **Purpose:** Source-of-truth record of every cookie, storage mechanism, tracker,
> third-party request, and piece of personal data touched by the **jameye.com
> landing site**. Use this as the factual basis for drafting the Cookie Policy,
> Privacy Policy, and Terms of Service.
>
> **Scope:** This document covers **only the marketing/landing site** in this
> repository (`jameye_landing`, served at `jameye.com`). It does **not** cover
> the product app at `staging.jameye.com` / the eventual production app, which
> handles login (Google OAuth) and gameplay and needs its own inventory.
>
> **Last verified:** 2026-06-18 (against the `main` branch source **and** the
> built `dist/` output).

---

## 1. Executive summary (the headline)

**As of today, the landing site sets ZERO cookies and runs ZERO analytics or
advertising trackers.**

Confirmed by scanning both source and the compiled `dist/`:

| Mechanism | Present? |
|---|---|
| First-party cookies (`document.cookie`) | ❌ None |
| `localStorage` / `sessionStorage` | ❌ None |
| Google Analytics / GTM | ❌ None |
| Meta (Facebook) Pixel | ❌ None |
| Hotjar / Microsoft Clarity / PostHog / Segment / Mixpanel / Plausible / Fathom | ❌ None |
| Cookie-consent banner | ❌ None (nothing today legally requires one) |
| YouTube / Vimeo embeds (which set cookies) | ❌ None — video is self-hosted MP4 |

**What this means for the legal docs:** Right now a strict "cookie banner" is
arguably not required, because the site sets no cookies of its own and no
tracking cookies. **However**, the site does make third-party requests
(Google Fonts, Polymarket thumbnails) that transmit the visitor's IP address,
and it collects personal data via the waitlist form. Those facts still need to
be disclosed in a Privacy Policy. See §3 and §4.

> 🚧 **PLANNED — this is about to change.** The team intends to add **Google
> Analytics 4**, **Google Ads** conversion/remarketing, **X / TikTok / Reddit**
> advertising pixels, and **Google OAuth login**. Once any of these ship, the
> site **will set cookies** (analytics + marketing categories) and a
> **consent banner (CMP) will be legally required** in the EU/UK before
> non-essential cookies may fire. The full anticipated cookie list — names,
> domains, durations, and consent categories — is in **§9**. The Cookie Policy
> should be drafted against §9 now, so it's ready the day the tags go live.

> ⚠️ **Forward-looking:** If/when analytics, ads, A/B testing, or a session
> tool are added, this changes immediately and a consent mechanism will likely
> be required (GDPR/ePrivacy in the EU). See §6 for the watch-list.

---

## 2. Cookies & client-side storage

### 2.1 Cookies set by Jameye (first-party)
**None.** No code writes `document.cookie`. No server `Set-Cookie` is issued by
the static site (it's served as static files via nginx).

### 2.2 Cookies set by third parties
**None loaded directly by the site.** The site embeds no third-party scripts
that set cookies. Note the nuance in §3 about third-party *requests* (fonts,
images) — these can in principle carry cookies set by those providers, but the
landing site itself plants nothing.

### 2.3 `localStorage` / `sessionStorage`
**None.** No persistent or session web-storage is used.

### 2.4 URL parameters (not a cookie, but a data flow worth disclosing)
- **`?ref=<nickname>`** — referral deep-link. Read **client-side only** to
  pre-fill the waitlist modal's "referred by" field and auto-open it. It is
  **not** written to any cookie or storage; it lives only in the URL and is
  sent to the waitlist backend if the visitor completes signup.
  - Source: `src/components/common/WaitlistModal.astro` (referral deep-link),
    `referralLink()` builds outgoing `?ref=` share links.

---

## 3. Third-party requests (no cookies, but personal data — IP — leaves the browser)

These are loaded directly by the visitor's browser, so the third party receives
the visitor's **IP address**, user-agent, and request metadata. None are
tracking cookies, but they are data transfers that a Privacy Policy should name.

| Service | Domain(s) | When | What is sent | Why |
|---|---|---|---|---|
| **Google Fonts** | `fonts.googleapis.com`, `fonts.gstatic.com` | Every page load | IP, user-agent (to fetch font CSS + font files) | Web fonts (Inter Tight, Space Grotesk, JetBrains Mono, Instrument Serif). Source: `src/layouts/Layout.astro` `<head>`. |
| **Polymarket thumbnails** | Polymarket-hosted image/CDN URLs | On pages rendering the "Markets" card | IP, user-agent (to load remote market thumbnail images) | Live market preview images. The market **data** is fetched at **build time** (server-side, see below) but the **thumbnail image `src` is remote**, so the browser loads it at runtime. Source: `src/utils/polymarket.ts`, rendered in `src/components/sections/HowItWorks.astro`. |

> 📌 **Google Fonts note for the lawyer:** Self-hosting Google Fonts (bundling
> the font files locally) removes this third-party request entirely and is a
> common GDPR-hardening step. Flagging as an option, not a finding.

> 📌 **Polymarket thumbnails note:** These can be proxied/self-hosted at build
> time to avoid the runtime third-party image request. Optional hardening.

### Server-side / build-time only (visitor browser NOT involved)
- **Polymarket Gamma API** (`gamma-api.polymarket.com/markets`) — queried
  **at build time** to populate the markets card. This request comes from the
  build server, not the visitor, so **no visitor data is shared** with
  Polymarket via this call. Source: `src/utils/polymarket.ts`.

---

## 4. Personal data collected — the Waitlist form

The only place the landing site collects personal data is the **waitlist
modal**. Data is sent to Jameye's own backend at **`https://waitlist.jameye.com`**.

### 4.1 Data fields collected
| Field | Required? | Notes |
|---|---|---|
| **Email address** | ✅ Required | Direct personal data. Validated client-side; checked for uniqueness against the backend. |
| **Nickname / handle** | Optional | Auto-generated (e.g. "Cosmic Oracle 481") if left blank. Pseudonymous. |
| **Referred-by nickname** | Optional | Another user's nickname, captured from the `?ref=` link or typed in. |
| **Avatar choice** | Optional | One of `avatar_1`…`avatar_4`. Cosmetic, non-identifying. |

> Note: the signup payload sends `name = nickname` (no separate legal/real name
> is collected by the current code). An older `example.env` references a "Name"
> field from a legacy Google Forms flow — **not used by the current backend
> flow**. Confirm with backend team that the real name field is fully retired.

### 4.2 Backend endpoints called (all to `waitlist.jameye.com`)
| Endpoint | Method | Data sent | Purpose |
|---|---|---|---|
| `/api/waitlist/count` | GET | none | Display live signup count (Hero). |
| `/api/waitlist/check?email=&nickname=` | GET | email and/or nickname | Real-time uniqueness check while typing. **Sends email to the backend before submit.** |
| `/api/waitlist/signup` | POST | name(=nickname), email, nickname, referred, avatar | Create the waitlist entry. |
| `/api/waitlist/entries` | GET | none | Populate the public `/leaderboard` page. |

Sources: `src/components/common/WaitlistModal.astro`, `src/components/sections/Hero.astro`, `src/components/sections/Leaderboard.astro`.

### 4.3 Public exposure of data — the Leaderboard ⚠️
The `/leaderboard` page (and `/es/leaderboard`) **publicly displays** waitlist
entries: **nicknames, avatars, referral points, and weekly movement**. This is
public-facing personal data (pseudonymous) and **must be disclosed** to users at
signup — i.e., "your chosen handle and avatar will be shown on a public
leaderboard." Emails are **not** shown publicly (confirm the `/entries`
endpoint does not return raw emails).

### 4.4 Where the data ultimately lives (needs backend confirmation)
The `example.env` documents a **Google Forms → Google Sheets** pipeline as the
historical storage layer (form responses published as CSV for uniqueness/
leaderboard reads). The current code points at the custom `waitlist.jameye.com`
API instead. **Action: confirm with backend/infra exactly where waitlist data
is stored (Google Sheets? a database? both?) and who the processor is** — the
Privacy Policy must name the storage location, processor, and retention period.

---

## 5. Third-party processors & sub-processors to name in the Privacy Policy

Based on the landing site alone:

1. **Google LLC** — Google Fonts (font delivery; receives IP). *Possibly* Google
   Sheets/Forms as waitlist storage — **confirm**.
2. **Polymarket** — remote market thumbnail images (receives IP at runtime).
3. **Jameye's own infrastructure** — `waitlist.jameye.com` API and hosting
   (nginx static host; see `Dockerfile`/`nginx/`). Name the hosting provider.

> The product app (Google OAuth login, gameplay) will add more processors —
> out of scope here but flag for the app's own inventory.

---

## 6. Watch-list — things that would CHANGE the cookie/consent picture

Add these to this doc (and trigger a consent-banner decision) the moment any
are introduced. **Checked = confirmed planned (detailed in §9).**

- [x] **Analytics — Google Analytics 4** *(planned — see §9.1)*
- [x] **Advertising / retargeting — Google Ads** *(planned — see §9.2)*
- [x] **Advertising / retargeting — X (Twitter), TikTok, Reddit pixels** *(planned — see §9.3)*
- [x] **Login/auth — Google OAuth** (`@react-oauth/google` + `jwt-decode` already
      in `package.json`; planned to go live — see §9.4)
- [x] **Consent Management Platform (CMP)** — now **required** because of the
      analytics + ad pixels above *(see §9.5)*
- [ ] Meta (Facebook/Instagram) Pixel — *not planned for now*
- [ ] A/B testing or feature-flag tools that set cookies
- [ ] Session-replay / heatmaps (Hotjar, Clarity, FullStory)
- [ ] Embedding YouTube/Vimeo/social widgets (these set third-party cookies)
- [ ] A CDN/WAF that sets functional cookies (e.g., Cloudflare `__cf_bm`)
- [ ] Any chat widget (Intercom, Crisp, etc.)

---

## 7. Checklist for the legal docs

**Cookie Policy**
- State plainly: the landing site currently sets no cookies and uses no tracking.
- Describe the URL-parameter referral mechanism (`?ref=`) as non-cookie.
- Reserve language for future analytics/consent if added.

**Privacy Policy**
- Personal data collected: email (required), nickname, referral, avatar (§4.1).
- Third-party data transfers: Google Fonts (IP), Polymarket images (IP) (§3).
- Public leaderboard exposure of nickname/avatar (§4.3).
- Processors/sub-processors (§5) + waitlist storage location & retention (§4.4 — confirm).
- Legal basis (consent for waitlist signup), user rights (access/deletion),
  contact for data requests.
- Note EU/UK transfer considerations for Google/Polymarket (US processors).

**Terms of Service**
- Waitlist participation terms; leaderboard/referral mechanics; the $100K+
  prize-pool / tournament claims made in marketing copy (set expectations:
  pre-launch, subject to change).
- Eligibility/age, acceptable use, IP ownership, disclaimers, governing law.

---

## 8. Source references (for re-verification)

- `src/layouts/Layout.astro` — `<head>`, Google Fonts links, SEO meta. No trackers.
- `src/components/common/BasicScripts.astro` — only UI behavior (mobile menu, scroll). No storage/cookies.
- `src/components/common/WaitlistModal.astro` — waitlist fields, uniqueness check, signup POST, `?ref=` handling.
- `src/components/sections/Hero.astro` — live count fetch (`/api/waitlist/count`).
- `src/components/sections/Leaderboard.astro` — public leaderboard fetch (`/api/waitlist/entries`).
- `src/components/sections/VideoShowcase.astro` — self-hosted MP4 (`/videos/...`), no embed cookies.
- `src/utils/polymarket.ts` — build-time Polymarket API + remote thumbnail URLs.
- `example.env` — documents the (legacy) Google Forms/Sheets waitlist pipeline.
- `config.ts` — `APP_URL = staging.jameye.com/login` (auth handled off the landing site).

> To re-verify the "no cookies/trackers" claim after future changes:
> ```
> grep -rniE "cookie|localStorage|sessionStorage|gtag|gtm|analytics|fbq|pixel|hotjar|clarity|posthog|segment|mixpanel" src/
> grep -rEoi "google-analytics|googletagmanager|gtag|fbevents|hotjar|clarity\.ms|doubleclick|posthog|segment\." dist/
> ```

---

## 9. ANTICIPATED cookies & trackers (PLANNED — not yet live)

> **Status:** None of the cookies below exist on the site **today**. This section
> forecasts what *will* be set once the planned tools ship, so the Cookie Policy
> and consent banner can be drafted in advance. Cookie **names, durations, and
> domains are set by the third parties and can change** — re-verify with a live
> cookie scan (browser DevTools → Application → Cookies, or a tool like
> Cookiebot/CookieServe) once the tags are deployed, then promote the confirmed
> rows out of "anticipated" into the live inventory (§2).
>
> **Planned stack:** Google Analytics 4 · Google Ads (conversion + remarketing) ·
> X / TikTok / Reddit advertising pixels · Google OAuth login. Delivery is most
> likely via **Google Tag Manager** (GTM itself sets no cookies; the tags it
> fires do).

### Consent categories (legend)
- **Necessary** — required for the site/login to function; may be set without consent.
- **Analytics** — measurement; **opt-in consent required in EU/UK**.
- **Marketing** — advertising/retargeting; **opt-in consent required in EU/UK**.

---

### 9.1 Google Analytics 4 — category: **Analytics**
Fired via gtag.js / GTM. All first-party (set on `.jameye.com`).

| Cookie | Party | Typical duration | Purpose |
|---|---|---|---|
| `_ga` | First-party | 2 years | Distinguishes unique users (client ID). |
| `_ga_<container-id>` | First-party | 2 years | GA4 session state & session counter (the `<container-id>` is your Measurement ID, e.g. `_ga_ABC123DEF4`). |
| `_gid` | First-party | 24 hours | Distinguishes users (may appear depending on config; legacy carry-over). |
| `_gat` / `_gat_gtag_<id>` | First-party | ~1 minute | Throttles request rate to GA. |

> Personal data: GA4 processes IP (truncated/anonymized by default in GA4),
> client ID, device/browser, on-site behavior. Google is a **processor/
> sub-processor** to name in the Privacy Policy; for EEA users, Google Consent
> Mode v2 + a data-processing agreement apply.

---

### 9.2 Google Ads (conversion tracking + remarketing) — category: **Marketing**

| Cookie | Party | Typical duration | Purpose |
|---|---|---|---|
| `_gcl_au` | First-party (`.jameye.com`) | 90 days | Conversion Linker — stores ad-click info to attribute conversions. |
| `_gcl_aw`, `_gcl_dc`, `_gcl_gb` | First-party | ~90 days | Conversion linker variants (Ads / Campaign Manager). |
| `_gac_<id>` | First-party | 90 days | Campaign/ad-click info, linked to GA. |
| `IDE` | Third-party (`doubleclick.net`) | up to 13 months | Ad targeting, measurement, remarketing. |
| `test_cookie` | Third-party (`doubleclick.net`) | ~15 minutes | Checks whether the browser accepts cookies. |
| `NID` | Third-party (`google.com`) | ~6 months | Ads preferences / personalization. |
| `DSID` / `FLC` / `AID` / `TAID` | Third-party (`google.com`/`doubleclick.net`) | varies | Cross-device conversion linking & personalization. |

---

### 9.3 Social advertising pixels — category: **Marketing**

**X (Twitter) Pixel**

| Cookie | Party | Typical duration | Purpose |
|---|---|---|---|
| `muc_ads` | Third-party (`.t.co` / `.x.com`) | ~13 months | Ads measurement & optimization. |
| `personalization_id` | Third-party (`.x.com`/`.twitter.com`) | ~2 years | Ads personalization across X. |
| (first-party event id, varies) | First-party | session/short | Deduplicates pixel events. |

**TikTok Pixel**

| Cookie | Party | Typical duration | Purpose |
|---|---|---|---|
| `_ttp` | First-party (`.jameye.com`) | ~13 months | Links events across pages for ads measurement. |
| `ttwid` | Third-party (`.tiktok.com`) | ~1 year | Ad delivery, measurement, analytics. |
| `tt_*` (e.g. `tt_sessionId`) | Third/first-party | varies | Session/event correlation for the pixel. |

**Reddit Pixel**

| Cookie | Party | Typical duration | Purpose |
|---|---|---|---|
| `_rdt_uuid` | First-party (`.jameye.com`) | ~90 days | Identifies the user/session for Reddit conversion & remarketing. |
| `reddaid` | Third-party (`.reddit.com`) | ~1 year | Advertising identifier. |

> Each network is its own **processor** + acts as an independent controller for
> its ad platform — name all three in the Privacy Policy, with links to their
> respective privacy/cookie policies. All require **prior opt-in consent** in
> the EU/UK.

---

### 9.4 Google OAuth login — category: **Necessary / Functional**
`@react-oauth/google` and `jwt-decode` are already dependencies. When login goes
live (here or on the app domain):

| Cookie / token | Party | Typical duration | Purpose |
|---|---|---|---|
| Jameye session token (e.g. `jameye_session` cookie, **or** a JWT in `localStorage`) | First-party | session / configurable | Keeps the user logged in. **Decide cookie vs. localStorage** — a cookie is the more standard, more securable choice (`HttpOnly`, `Secure`, `SameSite`). |
| `g_state` | First-party | ~persistent | Google Identity Services — remembers the "auto sign-in" / dismissed-prompt state. |
| `SID`, `HSID`, `SSID`, `SAPISID`, `APISID`, `__Secure-*`, `SIDCC`, `LSID`, `NID` | Third-party (`google.com` / `accounts.google.com`) | months–years | Set by **Google** when the user authenticates with their Google account. Owned/controlled by Google. |
| `_GRECAPTCHA` | Third-party (`google.com`) | ~6 months | Only if reCAPTCHA is added to login or the waitlist form (bot/abuse protection). |

> These are largely **strictly-necessary/functional** (the user is actively
> choosing to log in), so they generally don't need consent — **but** the
> Google account cookies are Google's, and reCAPTCHA has its own disclosure
> requirements. Confirm whether the session is a cookie or `localStorage`
> (currently `jwt-decode` suggests a client-held JWT) and document the final choice.

---

### 9.5 Consent Management Platform (CMP) — category: **Necessary**
Because §9.1–9.3 add analytics + marketing cookies, an EU/UK-compliant consent
banner becomes **mandatory** (GDPR + ePrivacy: prior opt-in before non-essential
cookies fire; Google Consent Mode v2 for Ads/Analytics in the EEA).

| Cookie | Party | Typical duration | Purpose |
|---|---|---|---|
| Consent record (e.g. `CookieConsent` for Cookiebot, `OptanonConsent`+`OptanonAlertBoxClosed` for OneTrust, or a custom `jameye_consent`) | First-party | 6–12 months | Stores the visitor's consent choices per category. **Strictly necessary** — set without consent. |

**Options:** managed CMP (Cookiebot / OneTrust / Osano / iubenda) or a custom
banner wired to Google Consent Mode v2. A managed CMP auto-generates and keeps
the cookie table current — recommended given the multi-pixel stack.

---

### 9.6 Implementation notes for whoever wires this up
- **Gate every §9.1–9.3 tag behind consent** — no analytics/marketing cookie may
  be written before the user opts in (EU/UK). Default Consent Mode v2 state =
  denied until consent.
- **Prefer GTM** as the single delivery point so tags can be consent-gated centrally.
- After deployment, run a **live cookie scan** and move confirmed cookies from
  this §9 into the live inventory (§2), updating real durations/domains.
- Re-run the verification greps in §8 — they will now (correctly) report hits.
- Update the §1 executive summary table from "❌ None" to the live state.
