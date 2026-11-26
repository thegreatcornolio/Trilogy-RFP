#!/usr/bin/env node
/**
 * Render Community Fibre proposal PDFs (main + company overview) via Chrome.
 * Usage: node presentations/communityfibre/Web/build-pdfs.mjs
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../.."); // repo root
const OUT_DIR = path.join(__dirname, "assets/docs");
const ARTIFACTS = "/opt/cursor/artifacts";
const UNLOCK_KEY = "trilogyCommunityFibreUnlock";
const UNLOCK_HASH =
  "527be936b6c97e98a7fddadb7af83f419970976b21894356e6ef4ce7a2d885fa";

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
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp4": "video/mp4",
  ".webp": "image/webp",
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
        res.writeHead(200, {
          "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        });
        res.end(data);
      });
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

const jobs = [
  {
    path: "/presentations/communityfibre/Web/index.html",
    out: "RFP-Project-Mercury-Trilogy-CX-Proposal.pdf",
    title: "Project Mercury · Trilogy CX Proposal",
  },
  {
    path: "/presentations/communityfibre/Web/companydetail/index.html",
    out: "RFP-Project-Mercury-Trilogy-CX-Company-Overview.pdf",
    title: "Project Mercury · Company Overview",
  },
];

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(ARTIFACTS, { recursive: true });

const { server, port } = await startServer();

try {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
  });

  for (const job of jobs) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1600, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(
      (key, hash) => {
        try {
          sessionStorage.setItem(key, hash);
        } catch (_) {}
      },
      UNLOCK_KEY,
      UNLOCK_HASH
    );
    await page.emulateMediaType("print");
    const url = `http://127.0.0.1:${port}${job.path}?pdf=1`;
    console.log(`Rendering ${url}`);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 180000 });
    await page.evaluate(() => {
      document.documentElement.classList.remove("proposal-locked");
      const gate = document.getElementById("proposal-gate");
      if (gate) gate.remove();
      document.querySelectorAll(".reveal").forEach((n) => n.classList.add("is-visible"));
      document.querySelectorAll(".jump-nav, .cta-dock, .site-nav, nav.jump-nav").forEach((n) => {
        n.style.display = "none";
      });
      // Expand lazy images
      document.querySelectorAll("img[loading='lazy']").forEach((img) => {
        img.loading = "eager";
        if (img.dataset.src && !img.src) img.src = img.dataset.src;
      });
    });
    // Give images / fonts a moment
    await new Promise((r) => setTimeout(r, 1500));
    await page.evaluate(async () => {
      const imgs = [...document.images];
      await Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.addEventListener("load", res, { once: true });
                img.addEventListener("error", res, { once: true });
              })
        )
      );
    });

    const outPath = path.join(OUT_DIR, job.out);
    await page.pdf({
      path: outPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `
        <div style="width:100%;font-size:8px;padding:0 14mm;color:#8b949e;display:flex;justify-content:space-between;font-family:Arial,sans-serif;box-sizing:border-box;">
          <span>${job.title} · Confidential</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      margin: { top: "10mm", bottom: "14mm", left: "10mm", right: "10mm" },
    });
    const artifactPath = path.join(ARTIFACTS, job.out);
    fs.copyFileSync(outPath, artifactPath);
    const kb = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`Wrote ${outPath} (${kb} KB)`);
    console.log(`Copied ${artifactPath}`);
    await page.close();
  }

  await browser.close();
} finally {
  server.close();
}
