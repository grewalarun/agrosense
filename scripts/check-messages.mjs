// Checks every translation against messages/en.json: same keys, same {placeholders}
// (including plural arguments), same <tags>, and both ICU plural branches present.
// Usage: node scripts/check-messages.mjs
import fs from "fs";

const read = (lang) => JSON.parse(fs.readFileSync(new URL(`../messages/${lang}.json`, import.meta.url), "utf8"));
const flatten = (o, p = "", out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    const key = p ? `${p}.${k}` : k;
    if (typeof v === "object") flatten(v, key, out);
    else out[key] = v;
  }
  return out;
};
const args = (s) => [...s.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*[,}]/g)].map((m) => m[1]).sort().join(",");
const tags = (s) => [...s.matchAll(/<\/?([a-z]+)>/g)].map((m) => m[0]).sort().join("");
const plurals = (s) => [...s.matchAll(/\b(one|other)\s*\{/g)].map((m) => m[1]).sort().join(",");

const en = flatten(read("en"));
let problems = 0;
for (const lang of fs.readdirSync(new URL("../messages/", import.meta.url)).map((f) => f.replace(".json", "")).filter((l) => l !== "en")) {
  const tr = flatten(read(lang));
  const report = (msg) => { problems++; console.log(`${lang}: ${msg}`); };
  for (const key of Object.keys(en)) {
    if (!(key in tr)) { report(`missing ${key}`); continue; }
    if (!tr[key].trim() && en[key].trim()) report(`empty ${key}`);
    if (args(en[key]) !== args(tr[key])) report(`${key}: placeholders ${args(en[key])} vs ${args(tr[key])}`);
    if (tags(en[key]) !== tags(tr[key])) report(`${key}: tags ${tags(en[key])} vs ${tags(tr[key])}`);
    if (plurals(en[key]) !== plurals(tr[key])) report(`${key}: plural branches differ`);
  }
  for (const key of Object.keys(tr)) if (!(key in en)) report(`extra ${key}`);
  console.log(`${lang}: ${Object.keys(tr).length} keys checked`);
}
if (problems) {
  console.log(`${problems} problem(s)`);
  process.exit(1);
}
console.log("All translations match en.json");
