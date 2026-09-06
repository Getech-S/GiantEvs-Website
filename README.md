# Giant Evs — giantevs.com

Marketing site for Giant Evs, Rwanda's EV charging network.

**Status:** header, footer, home hero, "Our Story", "Our Stations", "How To
Charge", the host promo band, "What we offer", the charging cost calculator,
"The Giant Evs stories", the partner logo strip, the real `/stations` map +
directory, and the `/admin` panel behind it are built. The remaining nav
destinations exist as placeholder pages so nothing 404s while the rest of the
sections are designed.

**No station data ships with this project.** The list starts empty everywhere
(the homepage teaser, `/stations`, the admin table) until an admin adds real
stations through `/admin` — see [Stations & admin panel](#stations--admin-panel)
before anyone signs in.

---

## Stack

| Concern    | Choice                                        |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 16 (App Router, React 19, TypeScript)  |
| Styling    | Tailwind CSS v4 (CSS-first `@theme` tokens)    |
| Motion     | `motion` (Framer Motion 12) + CSS keyframes    |
| Icons      | `lucide-react`                                 |

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` for canonical
URLs, Open Graph tags and the sitemap.

---

## Layout

```
src/
  proxy.ts                   nonce + CSP, and the /admin auth gate
  app/
    fonts.ts                 shared next/font loaders (both root layouts use these)
    globals.css              design tokens, @font-face, CSS entrance keyframes
    robots.ts / sitemap.ts
    (marketing)/             root layout #1 — public site, has header/footer
      layout.tsx             fonts, metadata, <Header>, <main>, <Footer>
      page.tsx                home (hero + Organization JSON-LD)
      stations/page.tsx       real map + directory (Server Component)
      partner|about|contact|news/   placeholder pages
      not-found.tsx
    admin/                   root layout #2 — admin panel, NO public header/footer
      layout.tsx              its own <html>/<body>, reuses app/fonts.ts
      login/page.tsx           public within /admin
      (protected)/            everything else — layout redirects if signed out
        layout.tsx             admin nav shell (Dashboard/Stations) + logout
        page.tsx                dashboard: stats, bay bar, top-engaged stations
        stations/page.tsx       table + quick bay adjust + add/edit/delete
        stations/new/page.tsx
        stations/[id]/edit/page.tsx
    api/
      stations/route.ts               GET (public), POST (admin)
      stations/[id]/route.ts          PATCH, DELETE (admin)
      stations/[id]/view/route.ts     POST — public, rate-limited view ping
      stations/[id]/bays/route.ts     PATCH — admin, quick bay adjust
      admin/login|logout/route.ts
  components/
    layout/    header, footer, nav-link, mobile-nav, phone-button,
               language-switcher
    sections/  hero, hero-video, our-story, stations, how-to-charge,
               host-promo, services, calculator, calculator-panel, stories,
               partners, animated-headline, coming-soon
    stations/  stations-explorer, stations-map, station-list-item
               (the public /stations page)
    admin/     login-form, station-form, coordinate-picker-map,
               delete-station-button, logout-button, quick-bay-adjuster,
               stat-card
    ui/        logo, cta-button, magnetic, inline-video, station-card,
               availability-meter, service-card, story-card
  hooks/       use-scroll-state, use-lock-body-scroll, use-reduced-motion,
               use-media-query
  lib/
    site.ts                  all copy + nav + contact
    charging.ts               calculator model
    map-tiles.ts               shared Leaflet tile config
    format.ts                  formatRelativeTime (admin timestamps)
    track-station-view.ts      client-side view-ping helper
    stations/{types,store}.ts  station data model + JSON-file store
    auth/{session,credentials,require-admin,rate-limit}.ts
    motion.ts, utils.ts
scripts/
  create-admin-password.mjs  generates the three ADMIN_*/SESSION_SECRET env vars
data/
  stations.json              the actual station data — gitignored, see below
public/
  brand/giant-evs-logo.png
  brand/giant-evs-logo-offwhite.png  footer variant — fully monochrome white
                                      (mark, wordmark, tagline)
  media/hero-charging.mp4    hero background clip
  media/story-bay.jpg        Our Story square panel (864x864)
  media/story-demo.mp4       Our Story clip (640x868, 872 KB)
  media/texture-lattice.png  background lattice, as an alpha mask
  media/stories/*.jpg        story card images (600x400, ~27-42 KB each)
  media/partners/*.png       partner logos, trimmed to their own ink
  media/promo-space.jpg      host promo band (2880x1085, 244 KB)
  fonts/README.md            how to drop in the licensed Grift files
```

**All copy, navigation and contact details live in `src/lib/site.ts`.** New
sections should read from there rather than hard-coding strings.

---

## Design tokens

Taken from the Figma spec and defined once in `src/app/globals.css`:

- **Brand green `#00A550`** is `--color-brand-500`, with a 50–900 tonal ramp
  built around it (`bg-brand-500`, `text-brand-400`, …).
- **Hero** is 700px tall at ≥1024px, `100svh` minus the header below that.
- **Page frame** is `container-page`: max-width 1440px, 60px side padding on
  desktop stepping down to 32px / 20px.
- **Buttons** are flat, per the spec — no glows or tints. The primary is solid
  `brand-500`; the secondary is fully transparent with a 1px white hairline, so
  the video reads straight through it. The phone pill is a plain green block.
- **Icons** are lucide `Globe` (20px, 1.75 stroke) and `PhoneCall` (20px, 2
  stroke) — the outlined handset-with-waves from the spec, not a filled glyph.
- **Hero copy** is centred on phones and left-aligned from `sm` (640px) up.
- **Stations section** follows the comp's frame spec exactly: 100px block
  padding, 60px inline padding, 56px between the header block and the card
  grid, 16px grid gap. That yields an 825px section against the comp's
  "Hug 823px".
- **"What we offer"** matches its frame spec exactly: 738px hug height, 100px
  block / 60px inline padding, white; cards 424 x 405 at 8px radius with 40px
  padding and `space-between`, 24px apart; icon tiles 83 x 83 at 14px radius
  with 16.5px padding (so a 50px glyph). Three across only from `lg` — at tablet
  widths the columns fall to ~236px and the copy shreds, and a two-column stage
  would orphan the third card.

  **The three icons are approximations** (lucide `PlugZap`, `BatteryCharging`,
  `Fuel`) — the comp's own SVGs could not be lifted from a screenshot. Swap them
  for the real exports when available; only the `icons` map in
  `ui/service-card.tsx` needs to change.
- **Partner logo strip** — 360px section, 118px logo rows, alternating
  `#F3F9F6` tint on the 2nd and 4th cells (only from `lg`; in the two-column
  mobile stack it would read as a vertical stripe instead of an alternating
  row, so it's gated the same way the story cards' column count is).

  Each logo file arrived at a different native size and crop — a square crest,
  a wide wordmark, one lockup with dead padding, one with a second wordmark
  bolted on 200px past the mark the comp actually uses. All four are trimmed to
  their own ink (`sharp .trim()`) and given a per-mark `width`/`height` in
  `partners` in `site.ts`, rather than one shared box — a shared box would
  either crush the wide RURA lockup or leave the square Kigali crest tiny next
  to it. Sizes were tuned against the comp's screenshot, not guessed.
- **Stories** reuses the card grid: 424px columns 24px apart, 8px radius, 16px
  padding (24px at the foot), a 3:2 image at 6px radius, then category rule,
  title and link. No frame spec came with this one, so the type follows the
  system already established: eyebrow Nueva Std 700 16/16, heading Rockwell 700
  48/53, category Grift 500 14/16 `#1D9A3E`, title Rockwell 700 18/22.5
  `#0A0A0A`, link Grift 700 14/16 `#1D9A3E`.

  Source images are 600x400, which covers the 390px display box at 1x but is
  only ~1.5x density — swap in larger exports if they should stay crisp on
  retina.
- **Calculator** matches its frame spec: 900.5px hug height, 100px block / 60px
  inline padding, `#F3F9F6`; panels 875.5 and 444.4 wide by 571.5 tall. The
  header is a server component; only the panel is client-side.
- **Host promo band** is a full-bleed image with the copy bottom-left and the
  CTA bottom-right, 628px tall at `lg`. Its legibility gradient is the comp's:
  black, **95%** at the copy edge fading to transparent across the frame. Below
  `lg` a bottom-up ramp is layered under it, because the narrower crop puts the
  copy over the bright car body rather than the dark glass. The button follows the comp's button
  spec exactly (hug 159.2 x 48, 4px radius, 1px `#00A550` border on a `#00A550`
  fill, 20.6px inline padding, 8px gap), passed to `CtaButton` as a className
  override. Headline line two carries a leading no-break space to match the
  comp's indent; `AnimatedHeadline` trims it out of the flat string and the
  joined mobile rendering.
- **How To Charge** is a server component — every animation in it is CSS, so it
  needs no hydration at all. Step markers are 68px circles; the active one
  carries the comp's `#006330 -> #00A550 -> #24C974` gradient. The connector is
  a 1003px hairline behind them, fading `0% -> 16% -> 0%` per the spec, and the
  inactive markers are filled with the section background so they occlude it
  cleanly. It goes straight from one column to three at `md` — a two-column
  stage orphans step 3 on a row of its own.
- **The header is solid white at every scroll position** — no drop shadow and
  no translucency. Scrolling only condenses its height and advances the green
  progress rule.
- **Dark section background** is a three-layer stack, per the comp's fills:
  solid `#000000`, then `linear-gradient(180deg, rgba(0,165,80,0), rgba(0,0,0,0.21))`,
  then the lattice texture tinted with its own ink colour `#009966` at 8%. The
  green cast in the section comes from that tint, not from the gradient.
- **Background lattice.** See the section below — it is a mask, not a picture,
  so reuse it anywhere and set the tint on the element itself.
- **Header** is 66px plus a 2px scroll-progress rule — exposed as
  `--spacing-header` so `main` can reserve exactly that much space.
- **Type**, per the Figma inspector:

  | Element         | Face      | Weight | Size | Line height | Colour    |
  | --------------- | --------- | ------ | ---- | ----------- | --------- |
  | Hero headline   | Rockwell  | 700    | 56px | 61.6px      | `#FFFFFF` |
  | Section heading | Rockwell  | 700    | 48px | 53px        | `#000000` |
  | Section eyebrow | Nueva Std | 700    | 16px | 16px        | `#00A550` |
  | Status pill     | Grift     | 500    | 14px | 16px        | see below |
  | Step title      | Rockwell  | 700    | 24px | 26.4px      | `#000000` |
  | Service title   | Rockwell  | 700    | 24px | 26.4px      | `#0A0A0A` |
  | Service eyebrow | Grift     | 500    | 14px | 16px        | `#1D9A3E` |
  | Service link    | Grift     | 700    | 14px | 16px        | `#1D9A3E` |
  | Hero body       | Grift     | 400    | 18px | 25px        | `#FFFFFF` |
  | Section body    | Grift     | 400    | 18px | 25px        | `#5A6E5A` |
  | Buttons         | Grift     | 700    | 18px | 25px        | —         |
  | Navigation      | Grift     | 400    | 18px | 25px        | `#5A6E5A` |
  | Nav (active)    | Grift     | 700    | 18px | 25px        | `#00A550` |
  | Language label  | Grift     | 500    | 14px | 16px        | `#5A6E5A` |

  Sizes are `clamp()`ed down on narrow viewports; the values above are what
  renders at the 1440px design width. Neither face is redistributable, so
  `--font-display` is `Rockwell` with **Rokkitt** behind it, and `--font-sans`
  is `Grift` with **Urbanist** behind it — both fallbacks self-hosted via
  `next/font`, no external requests. `--font-tag` is `Nueva Std` (section
  eyebrows) falling through to the Rockwell stack, which matches the semi-serif
  look in the comps. See `public/fonts/README.md`.

  Urbanist was picked by measuring candidates against the spec: it sets
  `Stations` at **64.2px** against the spec's 64px (0.3% off) and shares
  Grift's geometric-humanist construction. Runners-up were Hanken Grotesk
  (64.5px) and Red Hat Display (64.9px).

---

## Motion

The split is deliberate:

**Entrance animations are CSS keyframes** (`animate-line-in`, `animate-rise-in`,
`animate-curtain-up`, `animate-header-in`, `hero-video-motion`). They use
`animation-fill-mode: both`, so if the animation never runs — JavaScript
disabled, a chunk fails, an offscreen tab — the element renders in its *final*,
visible state. The hero headline is never blank, and it paints with the document
instead of waiting on hydration. These also run on the compositor.

**Scroll reveals are CSS too** (`reveal-up`, `reveal-line`, `reveal-media`,
`reveal-bar`, `reveal-draw`, `reveal-pop`),
riding a `view()` timeline rather than an IntersectionObserver. Browsers without
scroll-timeline support run them once on load instead, so the content still ends
up visible — verified in both paths. Stagger is tuned per element with
`--rev-start` / `--rev-end` (and `--rev-delay`, which only applies in the
fallback). Both ends of every range sit inside `entry`, never `cover`: a range
ending in `cover` can never complete for an element near the bottom of a short
page, because the page runs out of scroll first.

**JavaScript motion is reserved for things CSS genuinely can't do:**

- hero copy parallax + fade tied to scroll position (`useScroll`/`useTransform`)
- the opposing drift on the two Our Story panels (desktop only — in the mobile
  row it would read as a misalignment, so it is gated behind a media query)
- the station cards' hover lift
- magnetic cursor-follow on the CTAs and phone button (motion values written
  directly, so pointer movement never triggers a React render)
- the sliding active-nav indicator (`layoutId`)
- mobile drawer, language dropdown, scroll-progress bar

**Reduced motion** is honoured globally: the base layer collapses every CSS
animation and transition to ~0ms, `useReducedMotion()` disables the parallax,
and the hero video holds a still frame instead of playing.

Both videos pause themselves when they scroll out of view or the tab is hidden,
which keeps the decoder off the CPU.

---

## Security

- **Content-Security-Policy** is generated per request in `src/proxy.ts` with a
  fresh nonce and `strict-dynamic`, so no host allowlist and no
  `'unsafe-inline'` for scripts. `'unsafe-eval'` is added in development only
  (Turbopack HMR needs it) and never in production.
- `style-src` keeps `'unsafe-inline'` because React and Next inject inline
  styles for streaming and critical CSS. Inline styles are not a
  script-execution vector; this is the standard trade-off.
- The nonce is also applied to the JSON-LD block in `app/page.tsx`. Any future
  inline `<script>` must read the nonce from the `x-nonce` request header the
  same way.
- Static headers in `next.config.ts`: HSTS (2 years, preload-ready),
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, COOP/CORP `same-origin`,
  `Origin-Agent-Cluster`, and a `Permissions-Policy` that denies every powerful
  API the site doesn't use (geolocation stays `self` for the upcoming station
  finder).
- `poweredByHeader: false`, and `dangerouslyAllowSVG` is off for `next/image`.
- No third-party scripts, fonts, analytics or CDNs — every asset is same-origin,
  except the stations map's basemap tiles (`img-src` allowlists
  `*.tile.openstreetmap.org`, nothing else does).
- `npm audit --omit=dev` is clean.

Because the CSP nonce is per-request, `/` renders dynamically. The other routes
stay static. If a page ever needs to be fully static, drop `headers()` from it
and let it inherit the CSP without an inline script.

`src/proxy.ts` does one more job beyond the CSP: it's also the `/admin` auth
gate. See [Stations & admin panel](#stations--admin-panel) for the full
security model (sessions, password storage, rate limiting, CSRF).

---

## Stations & admin panel

The `/stations` page is a real, live tool, not another static section: a
zoomable map (real OpenStreetMap cartography — actual Rwandan streets, real
place names, no placeholder tiles) with a searchable, filterable station list
next to it, both backed by a small JSON-file database. `/admin` is how that
data gets in — there is no seed data and no fabricated placeholder stations
anywhere in this project. Every station a visitor sees is one an admin
actually added.

### Data store — `src/lib/stations/store.ts`

`data/stations.json`, guarded by an in-process write queue (so two concurrent
admin edits can't clobber each other) and written via write-temp-then-rename
(atomic on the same filesystem, so a crash mid-write can never corrupt the
file). No database server to run or configure.

**This does not survive a serverless/multi-instance deployment.** It assumes
one long-running Node process with a persistent disk — true for `next start`
on a VPS or a container with a mounted volume, false for Vercel/Netlify
functions (ephemeral, per-invocation filesystem) or any host that runs more
than one instance (writes to one instance's disk are invisible to the others).
If this ever moves to that kind of host, swap `store.ts` for a real database —
every other file goes through the functions it exports
(`listStations`/`getStation`/`createStation`/`updateStation`/`deleteStation`/
`recordStationView`/`setFreeBays`), so that's the only file that needs to change.

Station status (`Available`/`Occupied`) is **derived from `freeBays`**, never
stored as its own field — `stationStatus()` in `src/lib/stations/types.ts` —
so a station can't show "Available" with 0 free bays or vice versa. One number
to edit, not two facts that can drift apart.

### Admin dashboard & real engagement tracking

`/admin` is a dashboard, not just a redirect to the stations table: stat
cards (total stations, available/occupied now, bay utilization, total views),
a free/occupied bay-availability bar, and a "most visited stations" ranking.
**Every number on it is real** — computed from `data/stations.json` on each
load, nothing seeded or estimated. A fresh install shows zeros and an honest
"No visitor engagement recorded yet." rather than fabricated activity.

**How "views" are counted** (`src/lib/track-station-view.ts` on the client,
`POST /api/stations/[id]/view` on the server): a view is recorded once per
browser session, the moment a visitor actively selects a station — clicking
its row in the list, or its marker on the map — never merely for appearing in
a filtered list. De-duplication is via `sessionStorage`, so re-clicking the
same station in one visit doesn't inflate the count, but a genuinely new visit
later does. The endpoint is intentionally public (no admin session — every
visitor's browser calls it) but rate-limited (`stationViewLimiter` in
`src/lib/auth/rate-limit.ts`: 40 pings / 5 minutes / IP) to blunt trivial
inflation; `src/proxy.ts` carves this one path out of the otherwise
admin-only `/api/stations*` write gate (see `isViewTracking` there).

**Fast occupied/available management**: the stations table
(`/admin/stations`) has inline +/-1 controls per row
(`QuickBayAdjuster` → `PATCH /api/stations/[id]/bays`, admin-only) so a real
operator can update a station in one click as cars plug in and leave, instead
of opening the full edit form for a single-number change. It also has
status filter tabs (`?status=available|occupied`) with live counts, matching
the public page's filters.

`src/lib/format.ts` has the one formatting helper this needed —
`formatRelativeTime` ("2h ago", "Never") for view/activity timestamps.

### The map — `src/components/stations/stations-map.tsx`

Leaflet + `react-leaflet`, dynamic-imported with `ssr: false` (Leaflet touches
`window` at import time). Tiles come from OpenStreetMap's own tile server —
real, free, no API key — configured once in `src/lib/map-tiles.ts` and shared
by both this map and the admin coordinate picker.

**OSM's tile server is meant for light/moderate traffic**
(usage policy: <https://operations.osmfoundation.org/policies/tiles/>), not a
high-volume production site. If this site gets real traffic, move to a proper
tile provider (MapTiler, Mapbox, Stadia Maps, Thunderforest, LocationIQ — all
have a free tier requiring just an API key). That's a one-line change in
`map-tiles.ts` plus updating `MAP_TILE_CSP_HOST` and the CSP `img-src` in
`src/proxy.ts` to match the new host — nothing else references a tile URL.

(An earlier version of this used CARTO's Positron tiles for a lighter aesthetic
match to the comp; CARTO now requires an API key for that endpoint, so it was
swapped for plain OSM tiles, which stay genuinely keyless.)

Markers are `L.divIcon` (a plain coloured circle via inline SVG-free HTML), not
Leaflet's default pin — simpler, and it sidesteps the well-known Next.js/Leaflet
bug where the default marker images 404 under a bundler.

### The admin panel — `/admin`

Single admin account, no signup flow, no user table:

```bash
node scripts/create-admin-password.mjs <username> <password>
```

prints three lines to paste into `.env.local`: `ADMIN_USERNAME`,
`ADMIN_PASSWORD_HASH_B64`, `SESSION_SECRET`. Nothing works until these are set
— a fresh checkout fails every login attempt closed rather than accepting a
default credential.

**`ADMIN_PASSWORD_HASH_B64` is the bcrypt hash, base64-encoded — not the raw
hash.** This one is worth understanding before you regenerate it by hand: a
bcrypt hash always contains literal `$name$`-shaped segments (`$2b$12$…`), and
Next's built-in `.env` loader expands `$NAME` as a variable reference. Every
one of those segments silently resolves to an empty string, truncating the
hash to garbage — **with no error at load time**, so it's a very quiet failure
mode (this cost real debugging time while building it: `bcrypt.compare`
succeeded against the file's raw content, then failed at runtime, because
Next's loader had already mangled the value before `process.env` ever saw it).
Base64 has no `$`, so it can't collide with that syntax. Always use the script
to generate this value; never hand-copy a raw `$2b$…` hash into an env file.

**Auth model** (`src/lib/auth/`):

- `session.ts` — a stateless, signed session cookie: `base64url(payload).
  base64url(HMAC-SHA256)`, 8-hour expiry. Built on Web Crypto (`crypto.subtle`),
  not `node:crypto`, because this file is imported by `src/proxy.ts`, which
  runs on Next's Edge runtime — Edge only has Web Crypto, not Node's `crypto`
  module. No session table, so a compromised `SESSION_SECRET` invalidates
  everything by rotating it (which also signs every admin out).
- `credentials.ts` — bcrypt-compares the password, constant-ish time either way.
- `rate-limit.ts` — 8 failed attempts / 15 minutes / IP, in-memory (resets on
  restart — this is a single-Node-process app, so there's no multi-instance
  state to coordinate; it blunts casual brute-forcing, not a substitute for a
  WAF).
- Login always returns the same generic "Invalid username or password" — never
  confirms which of the two was wrong.

**Authorization is layered, not single-point:**

1. `src/proxy.ts` redirects unauthenticated `/admin/*` page requests to
   `/admin/login?next=…`, and returns a bare 401 for unauthenticated
   `/api/admin/*` or mutating `/api/stations*` requests — before any page or
   route handler even runs.
2. `src/app/admin/(protected)/layout.tsx` independently re-checks the session
   and redirects if it's missing. This matters because the proxy's `missing:`
   matcher condition (added for the CSP nonce, see Security above)
   intentionally skips Next's background prefetch requests — a page-level
   check is what stops a signed-out prefetch from ever rendering protected
   content, even for an instant.
3. Every mutating Route Handler (`POST /api/stations`, `PATCH`/`DELETE
   /api/stations/[id]`) checks the session itself too, rather than trusting
   the proxy alone.
4. The login route rejects a POST whose `Origin` header doesn't match the
   site's own origin — the one CSRF gap the cookie's `SameSite=Lax` doesn't
   already close for that specific endpoint (every other mutating request
   needs the session cookie, which `SameSite=Lax` already refuses to attach
   cross-site).

**Server-side validation** (`src/lib/stations/store.ts`) rejects out-of-range
coordinates, non-integer or negative bay counts, `freeBays > totalBays`, and
unrecognised connector tags — the client-side form is a convenience, not the
real gate.

### The contact form — `/contact`

`POST /api/contact` sends every submission by email to `site.email`
(`operations@giantevs.com`, in `src/lib/site.ts`) over SMTP via `nodemailer`
(`src/lib/email/send-contact-message.ts`). It needs real mailbox credentials —
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` (and optionally
`CONTACT_FROM_EMAIL`) in `.env.local`, commented there with examples. Without
them, the route still validates the input fully but returns a clear 503
("the contact form isn't fully set up yet…") instead of silently discarding
the message or pretending it sent — the same "fail loud, never fake" approach
as the rest of this app's real-data rules.

The visitor's own address is set as `replyTo`, so hitting "Reply" in the
mailbox goes straight back to them regardless of which mailbox actually sent
it. Rate-limited at 6 submissions / 10 minutes / IP (`contactFormLimiter` in
`rate-limit.ts`) — the same in-memory, per-process limiter used for login
attempts and station-view tracking, with the same single-Node-process caveat.

### Two independent root layouts

`/admin` never renders the public site's `<Header>`/`<Footer>` — they're a
different application surface, and showing customer-facing nav on top of an
internal data-entry tool is confusing at best (an admin editing station data
could wander off onto the marketing site by accident) and was an actual bug
caught while building this: the original single shared root layout put both
headers on every `/admin` page.

The fix is Next's documented "multiple root layouts" pattern: `(marketing)`
and `admin` are separate top-level route groups, each defining its own
`<html>`/`<body>` (see `src/app/(marketing)/layout.tsx` and
`src/app/admin/layout.tsx`) instead of sharing one root layout every route is
stuck with. Both pull fonts from the shared `src/app/fonts.ts` so they never
drift apart. Route groups don't add a URL segment, so this changed no route's
public path — only where its `page.tsx` lives on disk.

### Deleting a station: no native dialog

`DeleteStationButton` uses an inline "Delete 'X'? Yes, delete / Cancel"
rendered in the page's own DOM, not `window.confirm()`. Beyond the UX case
(a native dialog can't be styled and blocks the whole tab), this was a real
finding while testing: browser automation cannot reliably drive a native
`confirm()` at all, which is a good proxy for "this control is opaque to
anything but a literal mouse" — not a property worth having in an admin tool
that will eventually get end-to-end tests.

---

## Accessibility

Skip link, one `<h1>`, `header`/`nav`/`main` landmarks, `aria-current="page"` on
the active nav item, a real `role="dialog"` mobile drawer with Escape-to-close,
focus move and scroll lock, `role="menuitemradio"` language options, visible
`:focus-visible` rings, and decorative elements (the background video, the
active-nav underline) hidden from assistive tech. The animated headline exposes
one flat string rather than per-line fragments. Where the language control
collapses to its globe icon (1024–1279px), an `aria-label` still names the
current language.

Navigation weight tracks state, not interaction: only the current page is bold
and green. Hovering an inactive link changes colour and sweeps an underline in,
never the weight.

Station status is never carried by colour alone — the pill spells out
"Available"/"Occupied" and the bay count is written next to the meter, which is
`aria-hidden` since it only restates that number.

**One known contrast gap, carried over from the comp:** the Occupied pill's
`#B45309` on the card background is **3.87:1**, under the 4.5:1 WCAG AA needs
for 14px text. It is kept because the comp specifies that exact value —
`#D97706` (amber-600) would clear it at 5.6:1 with the same hue if you want the
fix. Available `#00A550` passes at 6.01:1.

---

## Charging cost calculator

The arithmetic lives in `src/lib/charging.ts`, deliberately separate from the
UI so it can be read and checked on its own. Everything a visitor sees comes
from those functions.

> **Tariffs are placeholders.** `chargerTypes` in `src/lib/charging.ts` carries
> invented RWF/kWh rates (250 / 300 / 380 / 450). **Replace them with the real
> Giant Evs tariff before launch** — they are in one array so a single edit
> updates the whole calculator.

The model, and why it is built this way:

- **Billed energy is not battery energy.** Public chargers meter at the outlet,
  and some of that energy is lost in the cable, the onboard charger and thermal
  management. So `deliveredEnergy = batteryEnergy / efficiency`, and both the
  cost and the time come off the delivered figure. Efficiency is per charger
  type (AC is worse, because the car's own AC/DC conversion sits in the path).
- **Time is integrated across state of charge, not `energy / power`.** DC
  chargers hold peak power to roughly 80% SoC and then taper steeply to protect
  the cells. A flat division badly under-states any session ending near full —
  in the model the last 20% costs 2.38 min/kWh against 1.20 min/kWh at 20-40%.
  AC charging is limited by the car's onboard charger and stays flat, so it is
  not tapered.
- **The two handles share one range.** Moving either one pushes the other rather
  than letting the target fall below the start, so the inputs can never produce
  a negative session.

Sanity-checked against real-world figures: a 60 kWh car 20 -> 80% on a 50 kW DC
charger comes out at 47 min / 39.1 kWh, and 20 -> 80% plus 80 -> 100% sums to
exactly the same as 20 -> 100%.

---

## Asset watermarks

The image and video assets from the design tool arrive with a generator
watermark burned in: a four-point star, usually bottom-right. It is removed from
the asset itself rather than cropped or masked over, so the full frame and
native resolution survive.

For stills:

```bash
python scripts/remove-image-watermark.py <src> <out> <cx> <cy>
```

A plain inpaint smears whenever the star straddles a hard edge — in the promo
image it sits right on a kerb line — so the script clones a patch from elsewhere
in the same image and Poisson-blends it in. Crucially it *searches* for the
source offset, scoring candidates on the ring of real pixels around the star, so
structures running through the frame stay continuous. Picking an offset by eye
leaves a visible step.

For the hero video, see `scripts/prepare-hero-video.py` — same problem, but the
watermark is static across frames so an inpaint over a mask works there.

---

## Footer

`src/components/layout/footer.tsx`, mounted once in `src/app/layout.tsx` so
every route — including the 404 page — gets it automatically. All copy (the
tagline, the three link columns, the social links, the legal links) lives in
`footer` in `src/lib/site.ts`.

- **Logo on black.** The shipped logo has a black "G" and black "Giant Evs"
  wordmark, invisible on the footer's `bg-black`. The footer uses
  `giant-evs-logo-offwhite.png` instead — a fully monochrome white export
  (mark, wordmark and "Simply Powerful" tag all white on transparency).
  `Logo` takes a `variant="offwhite"` prop that swaps the import; the header
  keeps `variant` unset (the default) for the original colour mark.
- **Careers** has no dedicated page yet, so it points at `/about`; **Calculator**
  links to `/#calculator-heading`, an in-page anchor on the home section.
  `Privacy Policy` and `Terms of Service` point to `/privacy` and `/terms`,
  which don't exist yet — add those pages before launch or the links 404.
- Social links open in a new tab (`target="_blank" rel="noreferrer noopener"`)
  since they leave the site; every other footer link is internal.
- The copyright year is computed at request time (`new Date().getFullYear()`),
  never hand-typed.

---

## Background lattice

`public/media/texture-lattice.png` — the design's `Layer.png`, converted for the
web and applied through the `lattice-texture` utility.

The source carries its artwork **entirely in an 0..5 alpha channel** (its RGB is
a flat `#009966`), which is why it renders as a barely-there ~2% tint over white
and looks blank in most viewers. Two conversions were needed:

- **Stored as a mask, not a picture** — and **inverted**. The source's alpha-5
  regions are the tinted *field* and its alpha-0 regions are the untinted
  *lines*, so on the original white page it reads as white lines over a faint
  green field: the lines are the lighter element. On a black section the lines
  are therefore what carries the light, so the mask is `255 - alpha`. Getting
  this backwards tints 56% of the section instead of 42% and the whole band
  reads several shades too light.

  Storing it as a mask also means one asset serves every section, with the
  colour set on the element beneath it.
- **Mirrored vertically to make it tileable.** The source is a one-off
  composition with no repeat period — an autocorrelation sweep over both axes
  finds no minimum, and its own edges differ by ~20–40%, so tiling it as-is
  leaves a visible seam. Stacking it with a vertically flipped copy makes the
  doubled tile's top and bottom edges identical, so `mask-repeat: repeat` is
  seamless however tall a section grows.

The utility pins the mask to `100% auto` width, so the 45° angles stay true at
every breakpoint and the 1440px rendering matches the comp one-to-one. The tint
(`#009966` at 8%) was matched by rendering candidates at 1:1 and comparing
against the comp's own background crop.

To rebuild after a new layer export:

```bash
node scripts/build-texture-mask.mjs path/to/Layer.png
```

---

## Video assets

Both clips are muted, looping, and carry no audio track.

### `hero-charging.mp4` — hero background

**1280x720, 24fps, 10s, ~2.7 MB.**

**Resolution.** The source clip is 720p. At the 1440px design width the browser
already upscales it 1.125x with `object-cover`, and roughly 2.25x on a 2x
display, so it is inherently soft on large screens. Nothing in the page can add
detail that is not in the file — **a higher-resolution re-export of the clip is
the only thing that improves this.** Drop a 4K version in and re-run the script
below; no code changes are needed.

**Watermark.** The source has a generator watermark burned in: a 45x43
four-point star in the bottom-right, 98px from the right edge and 99px from the
bottom. It is erased from the asset itself with an OpenCV inpaint — not cropped
around — so the full frame and the native resolution are preserved.

**No added motion.** The clip plays exactly as shot. There is no ken-burns zoom
or pan on top of it, so the framing stays locked and the video never renders at
more than the minimum upscale `object-cover` requires.

To reprocess after replacing the source clip:

```bash
python scripts/prepare-hero-video.py path/to/source.mp4
```

It rewrites `public/media/hero-charging.mp4` and prints a fresh LQIP data URI to
paste into `hero.video.lqip` in `src/lib/site.ts`. If the new clip has the
watermark somewhere else (or not at all), adjust the `STAR` constant at the top
of the script.

### `story-demo.mp4` — Our Story panel

**640x868, 30fps, 7.9s, 872 KB**, down from a 13.6 MB source.

The original is an iPhone recording: 10-bit HEVC in HLG HDR, rotated -90°. That
combination does not play in Chrome or Firefox at all, so it was transcoded to
8-bit H.264 / BT.709 with the rotation baked in and the HDR tone-mapped through
a linear-light Hable curve — a naive convert would have washed the colours out.
It is displayed portrait in a landscape box with `object-cover` (the comp's
"Scale: Crop"), biased to `50% 62%` so the two figures fill the frame.

```bash
ffmpeg -i IMG_2402.mp4   -vf "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,scale=640:-2,format=yuv420p"   -c:v libx264 -preset slow -crf 24 -movflags +faststart -an -map_metadata -1   public/media/story-demo.mp4
```
