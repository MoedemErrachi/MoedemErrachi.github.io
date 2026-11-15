# Moedem Errachi — Portfolio

Personal portfolio and résumé site for **ERRACHI Moedem**, software engineering student at the
Faculty of Sciences of Tunis (FST).

- **Live site:** <https://moedemerrachi.github.io/>
- **Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Motion
- **Hosting:** GitHub Pages (static export, deployed by GitHub Actions)

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command          | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| `npm run dev`    | Start the dev server with hot reload                        |
| `npm run build`  | Build the static site into `out/`                           |
| `npm run start`  | Serve `out/` locally (static export — no `next start`)      |
| `npm run lint`   | Run ESLint over the app                                     |

The site is a **static export** (`output: "export"`), so the build produces plain HTML, CSS and
JS in `out/`. That is what gets published to GitHub Pages.

---

## Design — the Grand Prix theme

The site is styled as a personal **Grand Prix**: the career framed as a championship. Internships
are *race seats*, hackathons are *championship rounds*, projects are *garage entries*, education
is the *driver academy*, and contact is the *pit radio*. The vocabulary is content-driven — every
label comes from `content/portfolio.json`, so the whole theme can be renamed from the CMS without
touching code. Visuals are pure CSS (carbon weave, chequered strips, corner brackets, light
trails); no third-party imagery, no team or series marks.

---

## Where the content lives

All editable content is in a single file: [`content/portfolio.json`](content/portfolio.json),
typed by [`content/schema.ts`](content/schema.ts) and loaded through
[`lib/content.ts`](lib/content.ts).

```
content/portfolio.json   <- everything the visitor sees (profile, about, sections, skills…)
public/                  <- static files served from the site root (photo, CVs, uploads)
app/                     <- layout, page and global styles
components/              <- the sections of the page
```

Edit `content/portfolio.json` by hand, or use the local CMS below.

---

## Local CMS

A small dependency-free admin panel lives in [`cms/`](cms). It runs only on your machine
(`127.0.0.1`) and lets you edit every field, upload images, preview the result and publish it
to GitHub.

```bash
node cms/server.mjs        # http://127.0.0.1:4321
```

Optional environment variables:

| Variable        | Default                 | Description                              |
| --------------- | ----------------------- | ---------------------------------------- |
| `CMS_PORT`      | `4321`                  | Port for the CMS server                  |
| `PORTFOLIO_ROOT`| repository root         | Folder that holds the site               |

The panel has these sections:

- **Profile** — name, role, tagline, hero label, status chip, summary, contact details, photo, CV files, social links
- **About** — the introduction copy and the three highlight cards
- **Experience** — internships ("race seats") with role, company, stack and bullets
- **Section headings** — eyebrow, title and description for every section of the page
- **Skill groups** — categories with their technologies
- **Hackathons** — event, entry name, award, optional exact position, tags and repository links
- **Projects** — projects with highlights, tech stack, repository, demo and works-entry flag
- **Education** — academic background, certifications ("licences") and languages
- **SEO** — page title and meta description
- **Media** — upload, preview, copy path and delete files in `public/`
- **Publish** — review pending changes, then build, commit and push

### Publishing flow

1. Edit the content and press **Save** (writes `content/portfolio.json`).
2. Press **Build preview** to compile the site into `out/` and see it in the side panel.
3. Press **Publish** — the CMS runs the build, commits every change with your message and
   pushes to `origin`. The GitHub Actions workflow then deploys the fresh build to GitHub Pages.

Uploads are written to `public/uploads/`. The CMS never serves anything beyond `127.0.0.1`, and
nothing is pushed until you explicitly publish.

---

## Deployment

GitHub Pages is served from the `main` branch via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. `npm ci --no-audit --no-fund`
2. `npm run build`
3. upload `out/` as the Pages artifact and deploy it

> **One-time manual step:** in the repository, go to
> **Settings → Pages → Build and deployment → Source** and set it to **GitHub Actions**.

The site is published at <https://moedemerrachi.github.io/>.

---

## Notes

- `next.config.ts` sets `trailingSlash: true` and `images.unoptimized: true` because GitHub Pages
  serves static files without an image optimiser.
- Tailwind CSS 4 runs through the standard PostCSS plugin (`postcss.config.mjs`); the theme and
  custom animations live in `app/globals.css`.
- The CMS folder is excluded from ESLint and TypeScript since it is a standalone Node script and
  plain browser JavaScript, not part of the Next.js app.
