import { readFile } from 'node:fs/promises';

const sidebarOutline = (await readFile('dist/assets/vivek-signature.svg', 'utf8')).match(/d="(M[^\"]+)"/)[1];
// Centre lines follow the original custom lettering, including pen lifts, loops,
// dots, and the final flourish. They reveal the ink silhouette, never a rectangle.
const fullStrokes = [
  ['M151 279 C143 370 43 643 82 697 C95 753 251 373 411 224', 46, 520],
  ['M300 533 C276 579 263 624 301 594 L365 536 C348 590 352 618 381 576 L415 530 C415 560 434 566 451 550', 39, 250],
  ['M446 554 C522 506 484 477 449 549 C423 616 492 574 540 529', 38, 160],
  ['M535 539 C586 482 642 388 642 364 C609 388 544 516 529 587 M540 552 L604 497 M545 554 C563 575 621 553 738 546', 40, 390],
  ['M316 484 L318 482', 40, 65],
  ['M986 328 C1210 103 815 271 755 370 C702 468 1003 439 989 548 C978 620 782 716 690 734 C546 771 874 563 1063 500', 44, 760],
  ['M1065 496 C1038 551 1047 572 1091 532 L1128 496', 39, 160],
  ['M1128 495 L1121 540 C1166 495 1178 472 1179 510 C1172 548 1201 538 1228 508', 40, 155],
  ['M1226 514 C1277 440 1302 488 1247 521 C1213 537 1223 493 1263 480 L1281 480 C1270 576 1241 675 1171 735 C1040 833 1190 598 1314 497', 43, 450],
  ['M1314 497 C1385 416 1459 319 1460 295 C1443 248 1345 447 1325 541 C1348 510 1376 453 1389 501 C1397 570 1683 423 1732 479', 41, 550],
  ['M1079 446 L1082 441', 39, 70],
];
const shortStrokes = [
  ['M11.4 13 C11.8 19 5 34 6.6 44.5 Q7 48 9.7 42.5 C17 29 24 17 31.2 9.3', 3.8, 500],
  ['M23.8 33.1 Q18.7 41 24.2 37.2 L28.2 32.7 Q25.5 42.2 32.7 33 Q32.9 36.5 35 34.8', 2.9, 270],
  ['M34.5 35.9 Q41.4 32.1 38.2 32 Q33.7 32.9 35.4 36.6 Q36.8 38 42.7 31.7', 2.8, 150],
  ['M42.6 31.8 Q50.5 21.5 49.3 19.8 Q45.3 21 40.7 37.5 M43 33 L46.4 29.8 L42.5 33.1 Q43.6 36.2 57.2 33.7', 3, 360],
  ['M24.4 28.8 L24.4 29', 2.9, 65],
];

export function signatureSvg(short = false) {
  const id = short ? 'sidebar-signature' : 'full-signature';
  const width = short ? 60 : 1774, height = short ? 52 : 887;
  let delay = short ? 340 : 180;
  const strokes = (short ? shortStrokes : fullStrokes).map(([d, weight, duration]) => {
    const path = `<path class="signature-pen" d="${d}" stroke-width="${weight}" pathLength="100" style="--pen-delay:${delay}ms;--pen-duration:${duration}ms"/>`;
    delay += duration + 25;
    return path;
  }).join('');
  const ink = short ? `<path d="${sidebarOutline}" fill="white" fill-rule="evenodd"/>` : `<image href="/assets/vivek-singh-signature.png" width="1774" height="887"/>`;
  return `<svg class="signature-writing" viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false" style="--pen-finish:${delay}ms"><defs><mask id="${id}-ink" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}" style="mask-type:alpha">${ink}</mask><mask id="${id}-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}"><g fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round">${strokes}</g><rect class="signature-finished" width="${width}" height="${height}" fill="white"/></mask></defs><g mask="url(#${id}-ink)"><rect width="${width}" height="${height}" fill="currentColor" mask="url(#${id}-reveal)"/></g></svg>`;
}
