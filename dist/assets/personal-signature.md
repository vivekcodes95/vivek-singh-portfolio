# Personal signature lettering

Asset: `vivek-singh-signature.png`.

Generated with the built-in image tool in background-extraction/edit mode, using option 6 from the earlier lettering comparison. It is custom lettering, not an installed font. The site uses its transparent alpha as a theme-colored mask and retains an accessible text heading.

Final prompt:

> Use case: background-extraction.
> Asset type: personal website signature name graphic.
> Input image 1 is the EDIT TARGET, a six-option typography sheet. Extract ONLY option 6, the bottom-right lettering labeled "Personal signature". Preserve the handwritten signature letterforms exactly: a tall sweeping V, thin flowing connected lowercase letters, a large looping S, descending g, and the long final h exit stroke. Exact text: "Vivek Singh". Keep it naturally handwritten and readable. Remove the label "6 — Personal signature", all other lettering options, and the white background. Output ONLY that one signature, in solid dark forest green, on a genuinely transparent alpha background. No checkerboard pixels, white paper, gradients, shadows, texture, border, or extra text. Horizontal composition, close framing with a small even transparent margin; all ascenders, descenders and flourishes intact. Do not use serif or Indic headline lettering.


The name now uses inline SVG from `scripts/signature.mjs`: narrow paths trace the
original pen movements and reveal the existing ink silhouette with animated
stroke offsets. The full name retains the original alpha artwork; the sidebar
uses its vector outline. Reduced-motion preferences show the finished signature.
