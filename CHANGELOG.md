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

## [1.0.0] - 2025-07-11

### Added

- ✅ Initial Netlify Function `csp-report.js` to receive CSP violation reports via `POST`.
- ✅ Report filtering to ignore low-value sources (e.g. `img-src`, `chrome-extension://`, etc.).
- ✅ High-risk directive detection (`script-src`, `form-action`, etc.).
- ✅ Deduplication logic to prevent spam from duplicate CSP reports.
- ✅ Alert delivery to `https://ntfy.neteng.pro/csp-alerts` for high-risk CSP events.
- ✅ Minimal static landing page (`public/index.html`) confirming the endpoint is online.
- ✅ `netlify.toml` with:
  - `functions = "netlify/functions"`
  - `publish = "public"`
  - `NODE_VERSION = "22"` in `build.environment`
- ✅ ESLint and Prettier configuration with ESM support, but with JSON linting removed due to compatibility friction.

### Changed

- 🔁 CSP header in main SvelteKit project updated to point to new report URI:

```bash
https://csp.netwk.pro/.netlify/functions/csp-report
```

### Removed

- 🗑️ Deprecated inline CSP reporting route (`/api/csp-report`) from original SvelteKit project.

---

<!-- Link references -->

[Unreleased]: https://github.com/netwk-pro/netwk-pro.github.io/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/netwk-pro/csp-endpoint/releases/tag/v1.0.0
