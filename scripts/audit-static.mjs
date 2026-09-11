import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanRoots = ["app", "components", "lib"].map((dir) => path.join(root, dir));
const allowedExtensions = new Set([".ts", ".tsx", ".js", ".mjs"]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const failures = [];
for (const base of scanRoots) {
  for (const file of walk(base).filter((item) => allowedExtensions.has(path.extname(item)))) {
    const text = fs.readFileSync(file, "utf8");
    if (text.includes("SUPABASE_SERVICE_ROLE_KEY")) failures.push(`Secret server-only referenciado desde ${path.relative(root, file)}`);
    if (/console\.(log|debug)\s*\([^)]*(questionnaire|response|password|token)/is.test(text)) failures.push(`Log potencialmente sensible en ${path.relative(root, file)}`);
  }
}

const sql = fs.readdirSync(path.join(root, "supabase", "migrations"))
  .filter((name) => name.endsWith(".sql"))
  .sort()
  .map((name) => fs.readFileSync(path.join(root, "supabase", "migrations", name), "utf8"))
  .join("\n");

const tables = [...sql.matchAll(/create table(?: if not exists)? public\.([a-zA-Z0-9_]+)/gi)].map((match) => match[1]);
const rls = new Set([...sql.matchAll(/alter table public\.([a-zA-Z0-9_]+) enable row level security/gi)].map((match) => match[1]));
const missingRls = [...new Set(tables)].filter((table) => !rls.has(table));
if (missingRls.length) failures.push(`Tablas sin RLS: ${missingRls.join(", ")}`);

if (failures.length) {
  console.error("Auditoría estática fallida:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Auditoría estática OK: ${new Set(tables).size} tablas de aplicación con RLS y sin secretos server-only en frontend.`);
