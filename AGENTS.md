# Project notes for coding agents

- `web/` is an **Astro 7** static site (TypeScript). The contact form backend is a Cloudflare Pages Function in `web/functions/`. There is no server adapter: keep `output: "static"`.
- `studio/` is a standalone **Sanity Studio** (v6), deployed to `*.sanity.studio`. It is not embedded in the website.
- Each package has its own `package.json` and lock file. Run npm commands inside `web/` or `studio/`, not at the repo root.
- UI strings live in `web/src/i18n/en.ts`. Don't hard-code user-facing text in components; add a key and use `t()`.
- Running cost must stay $0/month (plus the domain): no databases, paid services or extra infrastructure.
- Read `README.md` for setup, environment variables and deployment.
