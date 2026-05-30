/**
 * Capture tile/hero screenshots for each app that has a public `liveUrl`.
 *
 * Playwright is intentionally NOT a project dependency (keeps the server build
 * lean). Run this locally on demand:
 *
 *   npm install --no-save playwright
 *   npx playwright install chromium
 *   node scripts/capture-screenshots.mjs
 *
 * Images are written to public/screenshots/<slug>.<ext>. After running, set
 * `screenshot: /screenshots/<slug>.<ext>` in the matching src/content/apps file.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appsDir = join(root, 'src/content/apps');
const outDir = join(root, 'public/screenshots');
mkdirSync(outDir, { recursive: true });

// Minimal frontmatter read — just the fields we need.
const field = (src, key) => src.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].trim();

const targets = readdirSync(appsDir)
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => {
    const src = readFileSync(join(appsDir, f), 'utf8');
    return { slug: f.replace(/\.mdx$/, ''), liveUrl: field(src, 'liveUrl') };
  })
  .filter((t) => t.liveUrl);

const isImage = (url) => /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

for (const { slug, liveUrl } of targets) {
  try {
    if (isImage(liveUrl)) {
      // The "app" is itself an image (e.g. d2r generator) — fetch it directly.
      const ext = liveUrl.match(/\.(png|jpe?g|gif|webp|svg)/i)[1].toLowerCase();
      const res = await fetch(liveUrl);
      const buf = Buffer.from(await res.arrayBuffer());
      const out = join(outDir, `${slug}.${ext}`);
      writeFileSync(out, buf);
      console.log(`✓ ${slug} -> /screenshots/${slug}.${ext} (fetched image)`);
    } else {
      await page.goto(liveUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1500); // let fonts/animations settle
      const out = join(outDir, `${slug}.jpg`);
      await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
      console.log(`✓ ${slug} -> /screenshots/${slug}.jpg`);
    }
  } catch (err) {
    console.warn(`✗ ${slug}: ${err.message}`);
  }
}

await browser.close();
