// Centre lines follow the original custom lettering, including pen lifts, loops,
// dots, and the final flourish. They reveal the ink silhouette, never a rectangle.
const fullStrokes = [
  ['M151 279 C143 370 43 643 82 697 C95 753 251 373 411 224', 46, 520],
  ['M300 533 C276 579 263 624 301 594 L365 536 C348 590 352 618 381 576 L415 530 C415 560 434 566 451 550', 39, 250],
  ['M446 554 C522 506 484 477 449 549 C423 616 492 574 540 529', 38, 160],
  // Separate pen lifts into their own animations. A compound dashed path can
  // expose later subpaths before the pen reaches them.
  ['M535 539 C586 482 642 388 642 364 C609 388 544 516 529 587', 34, 250],
  ['M540 552 L604 497', 32, 90],
  ['M545 554 C563 575 621 553 738 546', 32, 150],
  ['M316 484 L318 482', 40, 65],
  ['M986 328 C1210 103 815 271 755 370 C702 468 1003 439 989 548 C978 620 782 716 690 734 C546 771 874 563 1063 500', 35, 760],
  ['M1065 496 C1038 551 1047 572 1091 532 L1128 496', 39, 160],
  ['M1128 495 L1121 540 C1166 495 1178 472 1179 510 C1172 548 1201 538 1228 508', 40, 155],
  ['M1226 514 C1277 440 1302 488 1247 521 C1213 537 1223 493 1263 480 L1281 480', 33, 210],
  ['M1281 480 C1270 576 1241 675 1171 735 C1040 833 1190 598 1314 497', 34, 290],
  ['M1314 497 C1385 416 1459 319 1460 295 C1443 248 1345 447 1325 541 C1348 510 1376 453 1389 501 C1397 570 1683 423 1732 479', 41, 550],
  ['M1079 446 L1082 441', 39, 70],
];
export function signatureSvg() {
  const speed = .6;
  const gap = 15;
  let delay = 90;
  const strokes = fullStrokes.map(([d, weight, duration]) => {
    const scaledDuration = Math.round(duration * speed);
    const path = `<path class="signature-pen" d="${d}" stroke-width="${weight}" pathLength="100" style="--pen-delay:${delay}ms;--pen-duration:${scaledDuration}ms"/>`;
    delay += scaledDuration + gap;
    return path;
  }).join('');
  return `<svg class="signature-writing" viewBox="0 0 1774 887" aria-hidden="true" focusable="false" style="--pen-finish:${delay}ms"><defs><mask id="full-signature-ink" maskUnits="userSpaceOnUse" x="0" y="0" width="1774" height="887" style="mask-type:alpha"><image href="/assets/vivek-singh-signature.png" width="1774" height="887"/></mask><mask id="full-signature-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="1774" height="887"><g fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round">${strokes}</g><rect class="signature-finished" width="1774" height="887" fill="white"/></mask></defs><g mask="url(#full-signature-ink)"><rect width="1774" height="887" fill="currentColor" mask="url(#full-signature-reveal)"/></g></svg>`;
}
