# App Launcher

A single, good-looking landing page that lists the apps and websites I've built
over the years. Each app gets a **tile** you can _launch_ (open the live app) and
a **detail page** describing what it is, how it was built, and an architecture
diagram. It doubles as a portfolio/resume showcase.

Built with [Astro](https://astro.build) + content collections + MDX + Tailwind,
deployed to GitHub Pages via GitHub Actions.

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in ./dist
npm run preview    # serve the production build
```

## Adding a new app

Adding an app is **one file** — no layout changes:

1. Create `src/content/apps/<slug>.mdx`.
2. Fill in the frontmatter (validated at build time):

   ```yaml
   ---
   name: My App                       # required
   tagline: One-line pitch            # required
   description: A sentence for SEO    # required
   liveUrl: https://example.com       # optional — omit -> "Not publicly hosted"
   repoUrl: https://github.com/...    # optional
   tech: ["Go", "React", "MySQL"]     # stack tags (also used by the filter)
   screenshot: /apps/my-app.png       # optional — else a monogram tile is generated
   accent: "#22c55e"                  # tile/page accent color
   status: live                       # live | wip | archived
   featured: true                     # optional — sorts to the front
   order: 1                           # optional — manual sort
   ---
   ```

3. Below the frontmatter, write the detail page in Markdown/MDX. For an
   architecture diagram, import and use the `Diagram` component:

   ```mdx
   import Diagram from '../../components/Diagram.astro';

   <Diagram code={`flowchart LR
     A[Client] --> B[API] --> C[(DB)]`} />
   ```

4. Drop an optional screenshot in `public/apps/`. Commit and push — CI builds
   and deploys.

## Deployment

Self-hosted on the same Linode as `family-chat` / `forex`, served as static
files by nginx (no app process — a static site needs no pm2/systemd).

Pushing to `main` triggers `.github/workflows/deploy.yml`: it builds in CI to
catch errors, then SSHes into the server (`appleboy/ssh-action`, secrets
`DEPLOY_HOST` / `DEPLOY_USER` / `DEPLOY_KEY`) and rebuilds in place at
`/root/src/app-launcher`. Nginx serves the resulting `dist/`.

**One-time server setup** (see [deploy/nginx.conf](deploy/nginx.conf)):

```bash
# on the server
cd /root/src && git clone git@github.com:joeyrivera/app-launcher.git
cd app-launcher && npm ci && npm run build

cp deploy/nginx.conf /etc/nginx/sites-available/app-launcher
ln -s /etc/nginx/sites-available/app-launcher /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d apps.myexperiments.app
```

DNS: an `A` record for `apps.myexperiments.app` → the server IP. `site` in
`astro.config.mjs` should match the domain (used for the sitemap).

## Project structure

```
src/
  content/apps/        # one .mdx per app (the data)
  content/config.ts    # Zod frontmatter schema (the contract)
  components/          # AppTile, TileGrid, FilterBar, Diagram, badges, theme
  layouts/             # BaseLayout, AppDetailLayout
  pages/               # index.astro (grid), apps/[slug].astro (detail)
```
