# Equal Earth True Size

A drag-the-countries map in the spirit of [thetruesize.com](https://thetruesize.com),
built on the [Equal Earth](https://equal-earth.com) projection
(Šavrič, Patterson & Jenny, 2018) instead of Mercator.

Mercator lies about size, so on thetruesize.com dragging a country makes it swell or
shrink. Equal Earth is equal-area, so the same drag holds area at **1.00× everywhere** —
what changes instead is **shape**. The app measures both, live.

## What it does

- Click any country (or search) to lift it off the map, then drag it anywhere.
  Countries move by true spherical rotation, so the carried outline is the shape the
  country really has at that spot; a north-up correction keeps it upright.
  Shift+drag spins it.
- Per country it reports **area as drawn** (screen area ÷ the equal-area expectation)
  and **max angular deformation ω** — the Tissot measure of how far right angles get
  bent — plus its true area in km².
- 20 projections, grouped by the property each one keeps honest, so you can watch the
  same countries balloon or bend as you switch:
  - **True size (equal-area)** — Equal Earth, Mollweide, Hammer, Briesemeister,
    Eckert II, Eckert IV, Eckert VI, Goode Homolosine, Goode interrupted,
    Boggs Eumorphic interrupted, Sinusoidal, Bonne, Lambert cylindrical, Gall–Peters.
    All report 1.00× for every country.
  - **True angles (conformal)** — Mercator, Peirce Quincuncial. Both report ω = 0.0°
    for every country, and areas anywhere from 0.77× to 24×.
  - **Compromise** — Natural Earth, Robinson, Winkel Tripel, Equirectangular.
- The distortion-ellipse overlay draws Tissot indicatrices. On Equal Earth every
  ellipse has the *same area* and a different shape; on Mercator they are all circles
  of wildly different sizes. That single overlay is the whole argument.
- Cursor readout gives lat/lon, local areal scale and ω anywhere on the map.

Keyboard: arrows nudge the selected country (Shift = 5°), `[` `]` rotate,
`H` sends it home, `Delete` removes it, `Esc` deselects.

## Build

`index.html` is generated — the country geometry is inlined so the page makes no
runtime data fetches.

```sh
node build.mjs
```

It writes two files from the same source:

| file | shape | for |
|---|---|---|
| `index.html` | complete document, `<meta charset="utf-8">` declared | GitHub Pages, any static host, opening locally |
| `artifact.html` | head-less fragment | publishing through the Artifact tool, which supplies its own head |

The charset declaration is not optional for self-hosting: without it a server that
sends `text/html` with no charset makes the browser fall back to Latin-1, and every
`°`, `²` and `Š` on the page turns into mojibake (`1.0Â°N`, `kmÂ²`).

- `src/app.html` — the app; edit this, not `index.html`
- `data/countries-50m.json` — Natural Earth 1:50m via
  [world-atlas](https://github.com/topojson/world-atlas)
- d3 v7 and topojson 3 load from cdnjs; d3-geo-projection 4 from jsdelivr

## Icons and social card

The mark is the site's own map: the real Equal Earth outline in the plate magenta with
land knocked out in bone, on the ink ground the map uses. `favicon.svg` is generated,
not drawn — `d3.geoEqualEarth().fitExtent(...)` at a 64-unit viewBox, then the land path
is decimated (points closer than 0.4 units dropped, shapes under 0.8 sq units removed)
to get from 595 KB of 1:50m detail down to 8 KB that still reads as a world map at 32px.
The thin band along the bottom is Antarctica, which Equal Earth genuinely flattens that
way.

`og.png` is a real screenshot of the app at 1200x630, so a shared link previews the
thing itself. Regenerating either means re-running the steps in git history; they are
committed as assets, not built by `build.mjs`.

Shipped: `favicon.svg`, `favicon.ico` (16/32/48), `favicon-32.png`, `icon-192.png`,
`icon-512.png`, `apple-touch-icon.png` (opaque, iOS masks it itself), `site.webmanifest`.
Icon paths in the HTML are relative so the site also works from the `/equal-map/`
project path.

## Sharing a view

The address bar always holds the current state, so a view can be copied straight out of
it — or with the **Copy link** button in the panel footer. The format is deliberately
readable:

```
https://truesize.earth/#p=goodeCut&c=brazil@0,0;japan@-100,40&t=1
```

| key | meaning |
|---|---|
| `p` | projection key — `equalEarth`, `mercator`, `peirce`, `goodeCut`, … |
| `c` | countries, `;`-separated: `<slug>@<lon>,<lat>` plus `,<spin>` when rotated |
| `g` | `0` to hide the graticule (omitted when on) |
| `t` | `1` to show distortion ellipses (omitted when off) |

Countries are keyed by a slug of their name rather than an ISO code: the `id` field in
world-atlas is missing on five entries (Somaliland, Kosovo, N. Cyprus, Indian Ocean
Ter., Siachen Glacier) and `036` is used twice, so ids are neither complete nor unique.
All 241 name slugs are unique and URL-safe — and a slug says what it restores.

Coordinates round to 0.1° (~11 km). Updates are debounced 250 ms and written with
`history.replaceState`, so dragging does not flood the back button. Editing the hash by
hand — or hitting back — re-boots the view through the same path. An unrecognised
projection falls back to Equal Earth, and unknown country slugs are skipped rather than
failing the whole link. Zoom and pan are deliberately not encoded: the pan offset is in
pixels and would not survive a different window size.

## Hosting on GitHub Pages at truesize.earth

No server side — one HTML file, three CDN scripts, no runtime fetches, no build step at
serve time. `CNAME` in this repo already contains `truesize.earth`, so Pages picks the
domain up on the first push.

### 1. Register the domain

`truesize.earth` was unregistered as of the last check. Most major registrars carry
`.earth` (Namecheap, Porkbun, Gandi); it prices well above `.com`, so check before
committing.

### 2. Push the repo

```sh
git init -b main
git add -A
git commit -m "Equal Earth True Size"
git remote add origin git@github.com:<user>/<repo>.git
git push -u origin main
```

The repo must be **public** unless you are on a paid plan.

### 3. Point DNS at GitHub — do this before step 4

Four `A` records on the apex. Pages publishes no `AAAA` records, so there is no IPv6
row to add:

| Type | Host | Value | TTL |
|---|---|---|---|
| A | `@` | `185.199.108.153` | 300 |
| A | `@` | `185.199.109.153` | 300 |
| A | `@` | `185.199.110.153` | 300 |
| A | `@` | `185.199.111.153` | 300 |
| CNAME | `www` | `<user>.github.io.` | 300 |

Keep TTL low until it works, then raise it. Check propagation with
`dig +short A truesize.earth` — you want those four addresses back.

**On Cloudflare DNS:** set the records to *DNS only* (grey cloud, not orange). Proxying
them before GitHub has issued the certificate makes provisioning fail. Turn the proxy
on afterwards if you want it.

### 4. Turn Pages on

Repo → **Settings → Pages**:

- **Source:** Deploy from a branch → `main` / `/ (root)`
- **Custom domain:** `truesize.earth` → Save (it will already be filled in from `CNAME`)
- Wait for the certificate, then tick **Enforce HTTPS**

The site lands at `https://truesize.earth/`, with `www` redirecting to the apex. No
Actions workflow is needed; `.nojekyll` keeps Pages from running the tree through
Jekyll. First build takes a minute or two, certificate issuance up to an hour.

### 5. Optional — claim the domain against takeover

**Settings → Pages → Verified domains** gives you a `TXT` record to add at
`_github-pages-challenge-<user>.truesize.earth`. It stops anyone else pointing their
Pages site at your domain if you ever remove it from this repo.

### Things worth knowing

- **Pages sites are public**, on every plan. If the point is to keep this off the open
  web, use a host with real access control instead — Cloudflare Access, Netlify
  password protection, or a private VPS.
- **Redeploying** is just `node build.mjs && git commit -am "..." && git push`.
- **Payload:** `index.html` is ~785 KB because the topology is inlined, so the whole
  file is re-fetched whenever the app code changes. If that matters, split the topology
  into a separate `.json` and `fetch()` it — the CSP constraint that forced inlining
  applies to Artifacts, not to Pages.

## The math

- **Moving a country** composes two d3 rotations: `r0 = geoRotation([-λ₀,-φ₀])` brings
  its centroid to (0,0), an optional roll `[0,0,γ]` spins it there, and
  `r1.invert` where `r1 = geoRotation([-λ₁,-φ₁])` carries it to the target. Rotation is
  rigid on the sphere, so true shape and area survive the trip intact.
- **Distortion** comes from the numerical Jacobian of the projection at a point,
  normalised by `projection.scale()` (d3's `scale(1)` is the unit sphere). A 2×2 SVD
  gives the Tissot semi-axes `a`, `b` and their orientation; areal scale is `|det J|`
  and `ω = 2·asin((a−b)/(a+b))`.
- **Area as drawn** is `path.area(moved) / (geoArea(country) · scale²)` — the projected
  screen area against what an undistorted equal-area rendering would give.

Verified against known values: Equal Earth returns areal scale 1.0000 at every point;
Mercator returns sec²φ (2.00 at 45°, 14.93 at 75°) with ω = 0; equirectangular
stretches sec φ east–west with no north–south change. The SVD ellipse orientation
matches a brute-force search of the unit circle's image to 0.1°. End-to-end, all seven
equal-area projections return 1.00× on real country geometry — Greenland, Russia,
Antarctica, Indonesia, Chile — while Mercator returns 16.4× for Greenland and 23.7×
for Antarctica. ω can exceed 90° (Bonne reaches 108°, Lambert cylindrical 111°), so the
shape meter runs to its true 180° maximum rather than clamping at 90°.

## Rebuilding the interrupted projections

d3's interrupted clip mis-joins polygons that straddle a lobe boundary. On interrupted
Goode, Greenland is drawn as a single slab spanning both northern lobes, measuring
**6.55×** its true area; on interrupted Boggs, 8.11×. Antarctica smears into a bar
across the bottom. It is a visible rendering defect, not just a bad number.

The lobe boundaries are plain meridians — 40°W in the north; 100°W, 20°W and 80°E in
the south — so the app cuts the geometry itself before handing it over
(`cutIntoLobes`): unwrap each ring's longitudes so they stay continuous across the
antimeridian, Sutherland–Hodgman clip against each lobe's lon/lat box, and reassemble
as a MultiPolygon. Two details matter:

- The interior boundaries are inset by 0.01°, because pieces whose edges land *exactly*
  on a boundary get re-joined by d3's clip — the split is silently undone without it.
- Lobe boxes stop at ±89.995° rather than the pole, since a polygon edge running along
  a pole is a single point on the sphere and d3 reads the result as the complement
  (Antarctica measures 203× without this).

Only shapes that actually cross a boundary are rebuilt — 7 of 239 countries — so
everything else keeps the geometry d3 already got right. After the fix, 6 of those 7
measure exactly 1.000; Greenland lands at 0.99 and Antarctica at 0.93, the latter
because its ring carries the south pole on its boundary rather than inside it
(`d3.geoContains(Antarctica, [0,-90])` is `false`). Both beat the 6.55× and 3.11× they
started at, and both now *draw* correctly.

Orthographic is still out: it clips the far hemisphere, so a country dragged around the
back would have only its visible sliver measured.

## Two projections that need constructing

- **Briesemeister** is not exported by d3-geo-projection. It is built here as
  `d3.geoHammer().coefficient(1.75).rotate([-10, -45])` — an oblique Hammer with a 1.75
  axis ratio centred on 45°N, 10°E. `hammerRaw` called with one argument sets A = B, so
  the projection stays equal-area at any coefficient; verified at 1.0000 everywhere.
- **Gall–Peters** and **Lambert cylindrical** are the same family at different standard
  parallels — `geoCylindricalEqualArea().parallel(45)` and `.parallel(0)`.

The Bonne projection is named after Rigobert Bonne (1727–1795); it is set here to a
45° standard parallel, which gives the familiar cordiform outline.

## Why there is no "true size *and* true shape" projection

There cannot be one. A sphere has intrinsic curvature and a plane does not, so no
mapping between them preserves distance — that is Gauss's *Theorema Egregium* (1827).
Every flat map keeps area, or keeps angles, or neither; never both. Peirce Quincuncial
(равноугольная проекция Пирса) is *conformal*: it is in the second group, alongside
Mercator, and it distorts area by design. Equal Earth is already the honest-area
answer. The only object that gets both right is a globe.
