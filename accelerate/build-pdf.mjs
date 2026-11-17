#!/usr/bin/env node
/**
 * Render Project Accelerate IM to a clean A4 PDF via Chrome.
 * Usage: node accelerate/build-pdf.mjs
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname);
const OUT = path.join(ROOT, "Project-Accelerate-Investment-Memorandum.pdf");
const CHROME =
  process.env.CHROME_PATH ||
  ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/local/bin/google-chrome"].find((p) =>
    fs.existsSync(p)
  );

if (!CHROME) {
  console.error("Chrome not found. Set CHROME_PATH.");
  process.exit(1);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      const rel = urlPath === "/" ? "/index.html" : urlPath;
      const filePath = path.normalize(path.join(ROOT, rel));
      if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

const { server, port } = await startServer();
const url = `http://127.0.0.1:${port}/index.html?pdf=1`;

try {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
  });
  const page = await browser.newPage();
  await page.emulateMediaType("print");
  await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
  // Ensure reveal animations are visible
  await page.evaluate(() => {
    document.querySelectorAll(".reveal").forEach((n) => n.classList.add("is-visible"));
  });
  await page.pdf({
    path: OUT,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: false,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: `
      <div style="width:100%;font-size:8px;padding:0 14mm;color:#5a6570;display:flex;justify-content:space-between;font-family:Arial,sans-serif;">
        <span>Project Accelerate · Confidential</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
    margin: { top: "11mm", bottom: "16mm", left: "11mm", right: "11mm" },
  });
  await browser.close();
  const size = fs.statSync(OUT).size;
  console.log(`Wrote ${OUT} (${Math.round(size / 1024)} KB)`);
} finally {
  server.close();
}
