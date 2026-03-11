import { context } from "esbuild";
import express from "express";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const webSrcDir = path.join(__dirname, "src");
const webDistDir = path.join(__dirname, "dist");

const entryPoints = readdirSync(webSrcDir)
  .filter((file) => /^test\d+\.ts$/.test(file))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
  .map((file) => path.join(webSrcDir, file));

if (entryPoints.length === 0) {
  throw new Error("No test entry points found in apps/web/src");
}

const esbuildCtx = await context({
  entryPoints,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  sourcemap: true,
  outdir: webDistDir,
  logLevel: "info",
});

await esbuildCtx.watch();

const app = express();
app.use(
  express.static(projectRoot, {
    etag: false,
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "no-store");
    },
  }),
);

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  console.log(`web dev server: http://localhost:${port}/apps/web/test1.html`);
});

const shutdown = async () => {
  await esbuildCtx.dispose();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
