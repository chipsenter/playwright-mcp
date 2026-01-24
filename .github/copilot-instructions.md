# Copilot Instructions for `mcp-playwright`

## Project Overview
- **Purpose:** Automated smoke and manual testing for EZRouting web apps using Playwright and custom scripts.
- **Structure:**
  - `scripts/`: Node.js scripts for smoke/manual tests and environment setup.
  - `pages/`: Playwright Page Object Models (POMs) for UI abstraction.
  - `tests/`: Playwright Test specs (TypeScript).
  - `manual-test-cases/`: Markdown reports from manual/automated test runs.
  - `config/environments.json`: Maps environment names to URLs/branches.

## Key Workflows
- **Smoke Test:** `npm run smoke [-- --env uat|qa|dev|prod|... --headed|--headless|--close|--allow-redirects|--url <url>]`
  - Defaults: headless, closes automatically unless `--headed`.
  - Screenshots saved to `artifacts/`.
  - Fails if redirected off-host (override with `--allow-redirects`).
- **Manual/Scenario Test:** `node scripts/student-save-time-testqa.js [options]`
  - Options: `--headed`, `--toggle=wheelchair|sped`, `--out=<md>`, `--base-url=<url>`
  - Requires `.env` with `AUTOMATION_SUPER_USER` and `AUTOMATION_SUPER_PASSWORD`.
  - Generates Markdown report in `manual-test-cases/`.
- **Playwright Test:** `npx playwright test tests/login-uat-admin.spec.ts --headed`

## Environment & Config
- **.env:** Required for credentials. See `.env.example`.
- **Playwright Browsers Path:** Scripts force a stable cache path (see `playwright.config.cjs`, scripts) to avoid sandbox issues in CI/agent environments.
- **Environment URLs:** Use `config/environments.json` for mapping names to URLs/branches.

## Patterns & Conventions
- **Page Objects:** All UI interactions go through `pages/` classes (e.g., `LoginPage`, `DashboardPage`).
- **Locators:** Prefer `data-testid` and accessible roles for selectors. See `playwright-mcp.config.json` for testId attribute.
- **Manual Test Reports:** Always redact PII in Markdown outputs. Use timestamp change as a save-completion signal.
- **Artifacts:** All screenshots and reports go to `artifacts/` and `manual-test-cases/`.
- **Headless/Headed:** Headless is default; headed for debugging/manual runs.
- **CI/Agent Compatibility:** Scripts handle environment quirks (e.g., browser cache path, login flows).

## Integration Points
- **External:**
  - `@playwright/mcp` for Playwright MCP server integration.
  - Environment variables for credentials and base URLs.
- **Cross-component:**
  - Scripts and tests share Page Objects for consistency.
  - Reports and artifacts are generated for both manual and automated runs.

## Examples
- **Run smoke test in UAT, headed:**
  ```bash
  npm run smoke -- --env uat --headed
  ```
- **Run manual save-time scenario:**
  ```bash
  node scripts/student-save-time-testqa.js --headed --toggle=sped
  ```
- **Run Playwright Test spec:**
  ```bash
  npx playwright test tests/login-uat-admin.spec.ts --headed
  ```

## References
- See `README.md` for more details and usage examples.
- See `manual-test-cases/` for report format and test documentation.
- See `pages/` for Page Object patterns.
