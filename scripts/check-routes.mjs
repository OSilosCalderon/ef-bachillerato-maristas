import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appDir = path.join(root, "app");
const sourceDirs = [appDir, path.join(root, "components")];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const pages = new Set(
  walk(appDir)
    .filter((file) => file.endsWith(`${path.sep}page.tsx`))
    .map((file) => {
      const relative = path.relative(appDir, path.dirname(file)).split(path.sep).filter((part) => !part.startsWith("("));
      return "/" + relative.join("/");
    }),
);
pages.add("/");

function matchesRoute(route) {
  if (pages.has(route)) return true;
  return [...pages].some((page) => {
    const routeParts = route.split("/").filter(Boolean);
    const pageParts = page.split("/").filter(Boolean);
    if (routeParts.length !== pageParts.length) return false;
    return pageParts.every((part, index) => part.startsWith("[") || part === routeParts[index]);
  });
}

const broken = [];
for (const dir of sourceDirs) {
  for (const file of walk(dir).filter((item) => /\.(tsx?|jsx?)$/.test(item))) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/href=["'`]([^"'`]+)["'`]/g)) {
      const href = match[1];
      if (href.startsWith("/") && !href.includes("${") && !matchesRoute(href.replace(/\/$/, "") || "/")) {
        broken.push(`${path.relative(root, file)} -> ${href}`);
      }
    }
  }
}

if (broken.length) {
  console.error("Rutas internas rotas:");
  for (const item of broken) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Navegación OK: ${pages.size} páginas detectadas y sin href estáticos rotos.`);
