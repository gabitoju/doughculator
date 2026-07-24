# Repository Guidelines

## Project Structure & Module Organization

Doughculator is a dependency-free single-page app for calculating dough ingredient weights and baker's percentages. Keep the browser-delivered app small and easy to inspect:

- `index.html` for the page structure and application entry point.
- `js/` for focused JavaScript modules, such as `js/calculator.js`.
- `css/` for stylesheets.
- `assets/` for static images or icons.
- `test/` for browser-independent calculation tests, if tests are added.

Do not add framework, bundler, or package-manager dependencies. Use native ES modules and browser APIs.

## Build, Test, and Development Commands

No build step or package scripts are required. Run the app through a local static server so module loading matches a normal browser environment:

- `python3 -m http.server 8000` — serve the repository at `http://localhost:8000`.
- Open `http://localhost:8000` and verify calculations in a modern browser.

The app should not need environment variables, credentials, or a backend.

## Coding Style & Naming Conventions

Use plain HTML, CSS, and modern browser JavaScript; do not introduce TypeScript or third-party libraries. Prefer two-space indentation, semicolons, single quotes, and trailing commas where supported. Name files and directories in `kebab-case` (for example, `dough-calculator.js`), functions and variables in `camelCase`, and CSS classes in `kebab-case`.

Keep calculation logic separate from DOM updates. Use semantic HTML, accessible labels, and native form controls. Extract pure calculation functions so they are easy to verify independently.

## Testing Guidelines

Manually verify each change in a modern browser. Check normal inputs, decimal values, zero and blank inputs, and invalid values. Confirm that flour weight, hydration, salt percentage, and total dough weight produce correct results. If tests are added, keep them dependency-free where practical and use descriptive names such as `calculates hydration from flour and water`.

## Commit & Pull Request Guidelines

The available Git history has only an `Initial commit`, so no established commit convention exists. Use short, imperative commit subjects, optionally following Conventional Commits: `feat: add dough hydration calculator` or `fix: handle zero flour weight`.

Pull requests should explain the change, identify any related issue, include test results, and attach screenshots for visible UI changes. Keep each pull request narrowly scoped and update documentation when behavior or setup changes.
