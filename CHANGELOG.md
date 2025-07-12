# Changelog

<!-- markdownlint-disable MD024 -->

<!-- Use sections: Added, Changed, Deprecated, Removed, Fixed, Security -->

All notable changes to this project will be documented in this file.

This project adheres to [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

- ⏳ Logging backend integration (e.g. Supabase, Logtail, etc.)
- ⏳ Optional `report-to` support for modern browsers.
- ⏳ Monitoring dashboard or violation analytics.

---

## [1.0.1] - 2025-07-12

### Changed

- Version bumped to `v1.0.1`.
- `UTF-8` to `utf-8` in `public/index.html` to maintain case consistency.
- `.gitignore` in order to align more closely with this project's requirements.

### Removed

- `svelte` from `eslint-validate` key in `.vscode/settings.json`.

---

## [1.0.0] - 2025-07-11

### Added

- Initial Netlify Function `csp-report.js` to receive CSP violation reports via `POST`.
- Report filtering to ignore low-value sources (e.g. `img-src`, `chrome-extension://`, etc.).
- High-risk directive detection (`script-src`, `form-action`, etc.).
- Deduplication logic to prevent spam from duplicate CSP reports.
- Alert delivery to `https://ntfy.neteng.pro/csp-alerts` for high-risk CSP events.
- Minimal static landing page (`public/index.html`) confirming the endpoint is online.
- `netlify.toml` with:
  - `functions = "netlify/functions"`
  - `publish = "public"`
- ESLint and Prettier configuration with ESM support, but with JSON linting removed due to compatibility friction.
- `.node-version` and `.nvmrc` for proper Node.js resolution.
  - Ensures compatibility with Netlify’s dynamic Node version installation.
  - Uses explicit version `24.4.0` to avoid ambiguous builds and failures.

### Changed

- 🔁 CSP header in main SvelteKit project updated to point to new report URI:

```bash
https://csp.netwk.pro/.netlify/functions/csp-report
```

### Removed

- 🗑️ Deprecated inline CSP reporting route (`/api/csp-report`) from original SvelteKit project.

---

<!-- Link references -->

[Unreleased]: https://github.com/netwk-pro/netwk-pro.github.io/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/netwk-pro/csp-endpoint/releases/tag/v1.0.1
[1.0.0]: https://github.com/netwk-pro/csp-endpoint/releases/tag/v1.0.0
