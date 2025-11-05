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

## [1.0.2] - 2025-11-05

### Added

- **Dynamic alert priority system** via `getPriority(directiveKey)`:
  - `script-src`, `form-action`, `frame-ancestors`, `base-uri` → Priority `5`
  - `style-src`, `connect-src` → Priority `3`
  - All others → Priority `2`
- `X-Title` and `X-Priority` headers to ntfy alert requests for enhanced filtering and display.
- Introduced new `npm-run-all` `devDependency` for more efficient linting.
- Added new unit test (`csp-report.test.mjs`) to test CSP endpoint functionality.

### Changed

- Refactored `csp-report.js` **Netlify function** to improve clarity, reliability, and alerting functionality:
  - Extracted in-line cleanup logic to a reusable helper function `cleanUpOldViolations(map, ttl, now)`.
  - Improved documentation with detailed JSDoc annotations for all functions and types.
  - Normalized directive parsing by using `.toLowerCase()` and stripping fallback directives (e.g. `script-src-elem` → `script-src`).
  - Added URI encoding to the `X-Title` header sent to ntfy for better display and logging.
- Updated `.node-version` and `.nvmrc` to **Node.js v24.11.0** (LTS).
- Updated CI workflows to utilize the latest version of `actions@checkout`:
  - `backup-branch,yml`
  - `dependency-review.yml`
- Bumped project version to `v1.0.2`.
- Upgraded dependencies:
  - `@eslint/js` `^9.31.0` → `^9.39.1`
  - `browserslist` `^4.25.1` → `^4.27.0`
  - `eslint` `^9.31.0` → `^9.39.1`
  - `eslint-config-prettier` `^10.1.5` → `^10.1.8`
  - `globals` `^16.3.0` → `^16.5.0`
  - `markdownlint` `^0.38.0` → `^0.39.0`

### Removed

- Suppression of lower-priority CSP reports (e.g. `style-src`, `connect-src`) from being sent to `ntfy.sh`.
  - All CSP reports are now sent unless blocked by the duplicate rate limiter.
  - Only browser extension violations (`chrome-extension://`, `moz-extension://`) are still suppressed.

---

## [1.0.1] - 2025-07-12

### Added

- `.github/workflows/auto-assign.yml`, `.github/workflows/dependency-review.yml`, and `.github/workflows/backup-branch.yml` GitHub Actions workflows
- `COMMIT_GUIDE.md` to `.github` to standardize and simplify commit messages
- `.github/ISSUE_TEMPLATE/config.yml` to provide links for reporting bugs, security issues, etc.

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

[Unreleased]: https://github.com/netwk-pro/netwk-pro.github.io/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/netwk-pro/csp-endpoint/releases/tag/v1.0.2
[1.0.1]: https://github.com/netwk-pro/csp-endpoint/releases/tag/v1.0.1
[1.0.0]: https://github.com/netwk-pro/csp-endpoint/releases/tag/v1.0.0
