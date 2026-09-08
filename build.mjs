// Inlines the country geometry and writes both shapes of the page:
//   index.html    — a complete standalone document, for GitHub Pages or any static host
//   artifact.html — head-less fragment, for publishing via the Artifact tool
// Usage: node build.mjs
import { readFileSync, writeFileSync } from "node:fs";

const tpl  = readFileSync("src/app.html", "utf8");
const topo = JSON.parse(readFileSync("data/countries-50m.json", "utf8"));

// ── Crimea ───────────────────────────────────────────────────────────────
// Natural Earth's default admin-0 build follows de facto control and files the
// Crimean peninsula under Russia. This map follows the internationally recognised
// border (UN GA 68/262), so the peninsula is moved back to Ukraine here rather than
// by editing data/countries-50m.json — the vendored file stays exactly as downloaded,
// and re-fetching world-atlas cannot silently undo this.
const CRIMEA_BOX = [32.0, 44.0, 37.0, 46.6];   // w, s, e, n — verified to enclose only the peninsula

function arcPoints(t, index){                   // topojson arcs are quantised deltas
  const arc = t.arcs[index < 0 ? ~index : index];
  const [sx, sy] = t.transform.scale, [tx, ty] = t.transform.translate;
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => { x += dx; y += dy; return [x*sx + tx, y*sy + ty]; });
}
function polygonBounds(t, poly){
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const ring of poly) for (const index of ring) for (const [x, y] of arcPoints(t, index)) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
}
function reassignCrimea(t){
  const geoms = t.objects.countries.geometries;
  const ru = geoms.find(g => g.properties.name === "Russia");
  const ua = geoms.find(g => g.properties.name === "Ukraine");
  if (!ru || !ua) throw new Error("Crimea fix: Russia or Ukraine missing from the topology");
  const moved = [];
  ru.arcs = ru.arcs.filter(poly => {
    const [x0, y0, x1, y1] = polygonBounds(t, poly);
    const inside = x0 >= CRIMEA_BOX[0] && y0 >= CRIMEA_BOX[1]
                && x1 <= CRIMEA_BOX[2] && y1 <= CRIMEA_BOX[3];
    if (inside) moved.push(poly);
    return !inside;
  });
  // loud rather than silent: if upstream ever reshapes this, the build stops
  if (moved.length !== 1) throw new Error(`Crimea fix: expected 1 polygon in the box, found ${moved.length}`);
  ua.arcs.push(...moved);
}
reassignCrimea(topo);

const topoText = JSON.stringify(topo);
if (topoText.includes("</script")) throw new Error("topology would break out of its <script> tag");
if (!tpl.includes("__TOPO__")) throw new Error("template is missing the __TOPO__ placeholder");

const page = tpl.replace("__TOPO__", () => topoText);

// the fragment carries its own <title>; a standalone document wants it in <head>
const title = (page.match(/<title>([\s\S]*?)<\/title>/) || [, "Equal Earth True Size"])[1];
const body  = page.replace(/<title>[\s\S]*?<\/title>\s*/, "");

const DESC = "Drag any country across 20 map projections \u2014 Equal Earth, Mercator, " +
  "Peirce, Goode \u2014 and see what each one distorts: area, shape, or both.";
const SITE = "https://truesize.earth/";

// icon paths stay relative so the site also works from the /equal-map/ project path
const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${DESC}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="favicon.ico" sizes="48x48">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="canonical" href="${SITE}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="True Size">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="${SITE}">
<meta property="og:image" content="${SITE}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Greenland and India dragged across an Equal Earth map, each reading 1.00 times its true area">
<meta name="twitter:card" content="summary_large_image">
<style>:root{color-scheme:light dark}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${body}</body>
</html>
`;

writeFileSync("index.html", doc);
writeFileSync("artifact.html", page);
const kb = n => (n / 1024).toFixed(0).padStart(4);
console.log(`index.html    ${kb(doc.length)} KB  standalone (charset declared)`);
console.log(`artifact.html ${kb(page.length)} KB  fragment`);
