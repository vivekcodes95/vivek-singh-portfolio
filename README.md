# Vivek Singh — personal website

A local-first, white editorial website with a persistent sidebar, a centered profile, Instax-style previews, four topic collections, and individual reading pages. Built with semantic HTML, CSS, and a small amount of JavaScript. No application dependencies, accounts, newsletter service, or hosting are required.

## Run locally

Requires Node.js 20 or newer. From this project directory:

```sh
npm run build
npm run dev
```

Open http://127.0.0.1:4173. Leave the terminal running. Stop with Ctrl+C. The server serves only `dist` and listens on this computer's loopback interface. Rebuild after editing source files, then refresh the page.

## Edit content

- `scripts/content.mjs`: profile, topic descriptions, and sample drafts.
- `scripts/build.mjs`: shared navigation, home, collections, and reading-page layouts.
- `scripts/style.css`: responsive styling and motion preferences.
- `scripts/app.js`: mobile menu, subtle card tilt/cursor cue, reading progress.
- `dist/assets/`: authored image assets. Keep these files; the build preserves them.
- `dist/`: generated pages, ready for any ordinary static file server. Authored assets and output are intentionally tracked.

All article copy is labeled sample draft, and its dates are draft-creation dates rather than claimed publication dates. Photography cards are explicitly planned collections; their dates are planning dates. No reference images were copied into the site. The supplied portrait is used on the homepage. Current location is not asserted: the page says “From Uttarakhand, India”.

To replace the portrait, put the optimized image in `dist/assets/` and update `profile.portrait` to its root-relative path. Replace the profile location when confirmed. To add actual photographs, extend the content records with image paths, original captions, locations and capture dates, and render those fields in the photography card/detail branches in `scripts/build.mjs`.

## Remaining content

1. Vivek's confirmed current city.
2. Approved three-line biography and journey wording.
3. Original UX, history and spatial-design essays, with publication dates and historical references as applicable.
4. Original photographs with captions, location and capture date; final collection names.

## Checks

`npm run check` checks all generated pages, internal links, and local asset references. The optional `scripts/browser-check.mjs` is a development-only browser check using the current Mac's bundled Playwright installation and Chrome; its import path is machine-specific and is not required to run the website. Screenshots and results are written to ignored `qa/`.

The site uses Google Fonts (DM Sans and Manrope), with local system fallbacks when offline. Navigation and reading work without JavaScript on desktop; mobile navigation is enhanced with an expandable menu. Cards retain the normal system cursor; a small supplementary reading cue and gentle tilt appear only on fine-pointer devices when reduced motion is off.

## Design references and original artwork

User-supplied reference images informed whitespace, restrained forest colours, and print-like composition only. They are not website assets.

Interaction research: [Codrops magnetic buttons](https://tympanus.net/codrops/2020/08/05/magnetic-buttons/) and [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion). The site implements a modest independent interpretation, without copying their code.

`dist/assets/foothills.webp` is an original illustration generated with the built-in image tool, not a photograph by Vivek or a factual depiction of a specific location. The uncompressed source was generated outside the checkout. Final prompt:

> Original square editorial gouache and risograph-like landscape inspired by Uttarakhand foothills and sal forest near Corbett. Layered emerald and blue-green hills, simplified leafy forest silhouettes, small pale winding river, light morning mist. Refined painterly illustration with subtle fine grain; readable at small size. Nearly white negative space across the top 40 percent, landscape in lower 60 percent. Peaceful, restrained morning mood. Deep emerald, blue-green, mint mist, warm white sky. No frame, animals, people, text, logos, watermark, buildings, or decorative graphics. Not a photograph; no reference copying.

No site was registered, hosted, or deployed.

## Walking tiger logo and homepage cards

The bottom-left logo is a right-facing tiger walking slowly in place, rendered with locally bundled Three.js 0.186.0. `scripts/tiger.js` drives a 3.2-second four-beat cycle through its skeleton, with longer planted phases, low paw clearance, toe articulation, shoulder/hip weight transfer, head counter-motion and a tail wave. The existing skin weights deform the mesh with the bones; this is procedural animation, not a muscle or motion-capture simulation. Feline lateral-sequence timing is informed by [Frigon et al., 2014, Journal of Neurophysiology](https://journals.physiology.org/doi/full/10.1152/jn.00524.2013).

The tiger stays at the logo position across sidebar navigation. A small green dot marks the active tab; the homepage tab is labeled “Myself”. Browser back/forward and modified clicks retain their expected behavior. Reduced-motion settings show a standing tiger. If WebGL or model loading fails, a static image appears instead.

Homepage cards begin as a centered pile of paper cards and spread into their grid positions as the user scrolls. The mobile layout spreads vertically. Motion follows scroll position in both directions, without scroll interception. Keyboard focus unfolds the cards so all links remain reachable, and reduced motion or disabled JavaScript shows the ordinary grid. The homepage keeps generous bottom padding and omits the former notebook heading and draft-count label. `scripts/check-home-refresh.mjs` checks the logo, active dots, card layouts, mobile overflow and reduced-motion behavior.

Hover also opens the card fan. A quick back-and-forth pointer shake, similar to the macOS cursor-locator gesture, or the “Shuffle articles” button cycles three different sample articles from the nine-article pool. The physical cards stay mounted as they move from front to back, with each incoming card receiving its new article before it is revealed. All nine articles have different mountain paintings. After a shuffle, the cards expand automatically and remain open. A faint cursor fog effect keeps the cards visible throughout.

The top-right weather control offers Sun (white), Night (black), and Rain (dark green). The knotted pull rope cycles these modes with a weighted rebound; each icon is also a normal accessible button. Night adds fireflies and three flat-colored eye pairs, each assigned to a separate clear region of the page. Rain uses a lightweight animated canvas. The tiger is emerald in daylight, mint green at night, and pale leaf green in rain, with 60% opacity. Its desktop size is 62 × 41 pixels, half the original size. There is no audio control or playback. Preferences persist locally; reduced-motion settings disable decorative animations.

The homepage name uses the “Personal signature” custom lettering as a transparent image mask, colored forest green, mint, or sage to match the active theme. The underlying heading remains readable by assistive technology. The image and its generation prompt are stored in `dist/assets/vivek-singh-signature.png` and `dist/assets/personal-signature.md`.

`scripts/check-deck-interactions.mjs` verifies hover, cursor shake, new article images, mobile and reduced motion. `scripts/check-stack-weave.mjs` checks continuous card visibility, sequential content changes and automatic expansion. `scripts/check-weather.mjs` verifies the themes, rope interaction, eye distribution, tiger colors, persistence and mobile controls. These optional browser checks currently use the author's local Playwright installation; update their import paths for another development environment.

`dist/assets/tiger-rig.glb`: **Tiger** by **Nyilonelycompany**, licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Original model identifier: [Sketchfab 51ed5186afb04487ae6adb51f8ffd09b](https://sketchfab.com/3d-models/tiger-51ed5186afb04487ae6adb51f8ffd09b). Retrieved from the [Objaverse archive](https://huggingface.co/datasets/allenai/objaverse/resolve/main/glbs/000-157/51ed5186afb04487ae6adb51f8ffd09b.glb), whose metadata preserves the creator and license. Adaptations: custom flat green/white material and procedural standing, reclining, stepping, and tail poses. Three.js is MIT licensed; its license is bundled in `dist/vendor/three/LICENSE`.

The built-in image generation tool created the static fallback `dist/assets/tiger-marker.png`.

Generation prompt: “Right-facing reclining tiger, extended forepaws, relaxed alert head, distinct ears; flat forest-green silhouette with transparent stripe cutouts; wide 3:1 transparent canvas; raised hooked tail entirely left of torso with one small attachment root, designed for vertical separation and independent rotation; no outlines, shadows, gradients, text, floor, or additional objects.”
