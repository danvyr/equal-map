// Inlines the country geometry and writes both shapes of the page:
//   index.html    — a complete standalone document, for GitHub Pages or any static host
//   artifact.html — head-less fragment, for publishing via the Artifact tool
// Usage: node build.mjs
import { readFileSync, writeFileSync } from "node:fs";

const tpl  = readFileSync("src/app.html", "utf8");
const topo = readFileSync("data/countries-50m.json", "utf8").trim();

if (topo.includes("</script")) throw new Error("topology would break out of its <script> tag");
if (!tpl.includes("__TOPO__")) throw new Error("template is missing the __TOPO__ placeholder");

const page = tpl.replace("__TOPO__", () => topo);

// the fragment carries its own <title>; a standalone document wants it in <head>
const title = (page.match(/<title>([\s\S]*?)<\/title>/) || [, "Equal Earth True Size"])[1];
const body  = page.replace(/<title>[\s\S]*?<\/title>\s*/, "");

const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="Drag any country across 20 map projections and watch area stay true while shape bends.">
<meta name="color-scheme" content="light dark">
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
