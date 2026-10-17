# John Eliseo Portfolio

A standalone static portfolio with five main pages and eight project case studies, located at `C:\xampp\htdocs\JohnEliseoPortfolio`.

## Scroll experience

The home page opens with a typography-only greeting. Its six-second sequence includes a two-second dissolve overlapping a slow homepage reveal. It plays once per tab session, with Skip, Escape, and Replay intro controls. Reduced-motion preferences, deep links, and history restoration bypass the opening. The page stays accessible without JavaScript; a bounded watchdog removes the overlay if its script fails. Edit the opening in `intro-content.mjs`, `css/intro.css`, and `js/intro.js`.

The home page uses locally bundled GSAP and ScrollTrigger. On desktop viewports at least 901px wide and 720px tall, the hero pins while the supplied assembled photograph transitions into the supplied exploded photograph and its copy transitions. The selected-work gallery then pins and translates horizontally in response to native vertical scrolling. Its project buttons, keyboard focus, and skip links provide direct navigation. Mobile and shorter screens use a vertical gallery with subtle parallax. Reduced-motion and JavaScript-disabled visitors get the complete static page without pinned sections.

The laptop experience adapts the ten component masks and assembly offsets from the supplied `laptop-scroll.html` in `assembly-content.mjs`. Transparent cutout derivatives in `assets/images/laptop/` remove the white backgrounds. `js/laptop-images.js` physically translates the SVG components through disassembly/reassembly and settles onto the supplied rear three-quarter assembled photograph. Six selectable groups—display, keyboard, cooling, motherboard, battery, and chassis—describe my everyday coding setup. Scrolling, buttons, hotspots, and an accessible range control operate the same sequence. The original photographs and extracted animation sources are retained. Reduced-motion controls update immediately, and a no-JavaScript link opens the full exploded photograph.

The home and services pages share an interactive service explorer. Its accessible tabs switch between responsive-layout, request-routing, API round-trip, and deployment illustrations. Each includes deliverables and a related case study. These demos run entirely in the browser; they do not submit requests or deploy software. All service descriptions remain visible without JavaScript.

## Preview

From `C:\xampp\htdocs\JohnEliseoPortfolio`:

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5177/. With Apache running, the folder also works at http://localhost/JohnEliseoPortfolio/.

## Editing and deployment

- Edit page content in `build.mjs`, the home composition in `home-content.mjs`, services in `services-content.mjs`, and project content in `projects-data.js`.
- Run `npm ci` to install the project's own dependencies from its lockfile.
- Run `npm run build` to regenerate all HTML pages and the bundled laptop interactions, then package the deployable site in `dist/`.
- Styles live in `css/main.css`, `css/scroll.css`, `css/sculpture.css`, `css/laptop-images.css`, and `css/services.css`; interactions live in `js/main.js`, `js/scroll.js`, `js/services.js`, and `js/laptop-images.js`. The build bundles `js/laptop-images.js` into the existing `js/sculpture.bundle.js` runtime filename; no Three.js or WebGL is loaded.
- Deploy the contents of `dist/` to any static host. The generated site needs no server-side runtime. Build sources, dependencies, and test screenshots stay outside the deployment output.
- GSAP 3.15.0 is pinned in `package-lock.json`; bundled distribution files retain their original license headers. To update, install the desired version here and copy `node_modules/gsap/dist/gsap.min.js` and `node_modules/gsap/dist/ScrollTrigger.min.js` to `js/vendor/`.
- The contact form opens a mailto draft; it does not transmit or store submissions. Email delivery requires the visitor to send the draft from an email app.
- Google Fonts supplies Manrope, with Arial and system sans-serif fallbacks.

## Content sources

Biography, education, contact details, skills, project capabilities, screenshots, and résumé were taken from the supplied old portfolio source. Case-study narratives summarize documented capabilities; no client testimonials, revenue, usage metrics, or project dates were invented. RealEstate Chain retains its source status as ongoing. Review project status and the résumé before publishing.

## Verification

For Vercel, import the repository root. `vercel.json` selects the static-site preset, runs `npm run build`, and publishes `dist/`. Run `npm run verify:dist` to test that exact output before deploying.

`npm run verify` runs a temporary local server and Playwright against installed Microsoft Edge. It checks all 13 pages, local links, images, desktop/mobile overflow, filters, service navigation, mobile navigation and Escape, email validation/copy, the laptop photograph controls, text sizing, and JavaScript errors. It also runs `verify-motion.mjs`: wheel-driven animation, forward/reverse scrolling, gallery controls, keyboard case-study access, skip links, resizing during a pin, laptop/mobile layouts, live reduced-motion changes, and a no-JavaScript fallback. Screenshots go to `test-results/screenshots/`. The script closes its server/browser afterward.

The motion checks also verify project separation, uncropped screenshot proportions, and frame/caption clearance. `verify-sculpture.mjs` checks the original photograph sources, component movement, transparent backgrounds, scroll reassembly, six layer groups and hotspots, toggle/reset, keyboard slider, mobile layouts, reduced motion, and no-JavaScript access.

`verify-services.mjs` checks tab keyboard/focus behavior, every demo flow, cancellation on service changes, reduced motion, project links, 320px/mobile layouts, and the no-JavaScript fallback on both service explorer routes.
