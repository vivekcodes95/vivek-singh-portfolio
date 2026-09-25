import { mkdir, writeFile, copyFile, access } from 'node:fs/promises';
import { profile, sections, posts } from './content.mjs';
import { signatureSvg } from './signature.mjs';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = { home:'<path d="m3 10 9-7 9 7v11H3Z"/><path d="M9 21v-8h6v8"/>', design:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>', history:'<path d="m3 8 9-5 9 5M4 9h16M3 21h18M5 11v7m7-7v7m7-7v7"/>', camera:'<path d="M3 7h4l2-3h6l2 3h4v14H3Z"/><circle cx="12" cy="13" r="4"/>', space:'<path d="m3 6 9-3 9 3v15l-9-3-9 3Zm9-3v15M3 6l9 3 9-3"/>', hill:'<path d="m2 20 7-13 4 6 3-10 6 17M6 13l3 2 2-2m3-4 2 2 2-2"/>', location:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>', arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>', wand:'<path d="m15 4 5 5L8 21l-5-5L15 4Z"/><path d="m6 13 5 5M6 3v3M4.5 4.5h3M19 15v4M17 17h4"/>' };
const icon = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key] || icons.hill}</svg>`;
let landscape = false;
try { await access('dist/assets/foothills.webp'); landscape = true; } catch {}
function artwork(p) {
  if(p.art==='mountain-placeholder')return `<img src="/assets/mountain-${esc(p.painting.file)}.webp" width="768" height="768" alt="${esc(p.painting.alt)}" loading="eager">`;
  if(p.art==='photo'&&p.image)return `<img src="${esc(p.image)}" width="${p.width||6192}" height="${p.height||3480}" alt="${esc(p.alt)}" loading="eager">`;
  if (p.art === 'landscape' && landscape) return '<img src="/assets/foothills.webp" width="768" height="768" alt="Original illustration of green foothills and a quiet river" loading="lazy">';
  const arts = {
    space:'<div class="specimen"><span>less,</span><span>but better.</span><small>A STUDY IN ATTENTION</small></div>',
    type:`<div class="type-study"><span>${p.section === 'history' ? 'then<br><i>& now.</i>' : 'make<br><i>it human.</i>'}</span></div>`,
    empty:'<div class="empty-study"><span>Nothing here.<br><i>Room for something.</i></span><b>+</b></div>',
    map:'<div class="map-study"><span>Every perspective<br>has a frame.</span><div class="map-cross">+</div><small>NOTES ON LOOKING</small></div>',
    room:'<div class="room-study"><span>A little<br><i>breathing</i><br>room.</span></div>',
    material:'<div class="material-study"><span>keep.<br>repair.<br><i>reimagine.</i></span></div>',
    light:'<div class="light-study"><span>Follow<br><i>the light.</i></span></div>',
    landscape:'<div class="type-study"><span>place<br><i>& memory.</i></span></div>',
    photo:`<div class="photo-empty">${icon('camera')}<span>Photographs to come</span><small>${esc(p.tag)} / collection ${String(posts.filter(x=>x.section==='photography').indexOf(p)+1).padStart(2,'0')}</small></div>`
  };
  return arts[p.art];
}
function card(p, index=0) {
  const photo = p.section === 'photography';
  if(photo)return `<a class="card photo-card" href="/${p.section}/${p.slug}/" style="--i:${index}" data-card${p.image?` data-photo-src="${esc(p.image)}"`:''}>
    <div class="print"><div class="art art-${p.art}">${artwork(p)}</div><div class="print-label"><span class="photo-location">${icon('location')}<span>${esc(p.location)}</span></span></div></div>
    <div class="card-copy"><h2>${esc(p.title)}</h2><p>${esc(p.subtitle)}</p><div class="meta"><span>${esc(p.camera)}</span><span class="photo-meta-diamond" aria-hidden="true"></span>${p.clickedISO?`<time datetime="${esc(p.clickedISO)}">${esc(p.clicked)}</time>`:`<span>${esc(p.clicked)}</span>`}</div></div></a>`;
  return `<a class="card ${photo?'photo-card':''}" href="/${p.section}/${p.slug}/" style="--i:${index}" data-card>
    <div class="print"><div class="art art-${p.art}">${artwork(p)}</div><div class="print-label"><span>${esc(p.tag)}</span><span aria-hidden="true">↗</span></div></div>
    <div class="card-copy"><h2>${esc(p.title)}</h2>${photo ? `<p>${esc(p.subtitle)}</p>` : ''}<div class="meta"><span>${photo?'Planned collection':'Sample draft'}</span><span aria-hidden="true">·</span><time datetime="2026-09-20">20 Sep 2026</time></div></div></a>`;
}
function layout(title, description, active, body, cls='') {
  const nav = [{slug:'',name:'About',icon:'home'}, ...sections.filter(s=>!s.hiddenFromNav)];
  const tigerArtwork='<img src="/assets/tiger-dramatic-upright.png" alt="" width="1254" height="1254">';
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#ffffff"><script src="/theme-init.js"></script><title>${esc(title)} · Vivek Singh</title><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2327473a'/%3E%3Cpath d='m7 9 9 15 9-15' fill='none' stroke='white' stroke-width='3'/%3E%3C/svg%3E"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/theme.css"><script src="/app.js" defer></script><script src="/night.js" type="module"></script></head>
  <body><a class="skip" href="#main">Skip to content</a><aside class="sidebar${active?' has-profile profile-arriving':''}"><button class="menu-toggle" aria-expanded="false" aria-controls="navigation">Menu <span aria-hidden="true">+</span></button><a class="sidebar-profile" href="/" aria-label="Vivek — return to About"><span class="sidebar-profile-photo"><img src="${esc(profile.portrait)}" alt="" width="80" height="80"></span><span class="sidebar-profile-name"><span>Vivek</span>${signatureSvg(true)}</span></a><div class="sidebar-content" id="navigation"><nav aria-label="Main navigation">${nav.map(n=>`<a href="/${n.slug?n.slug+'/':''}" ${active===n.slug?'aria-current="page"':''}><span>${n.name}</span></a>`).join('')}</nav></div><div class="sidebar-bottom"><div class="origin"><button class="wordmark tiger-info" type="button" aria-label="Royal Bengal Tiger — learn about this species" aria-describedby="tiger-tooltip"><span class="logo-tiger" aria-hidden="true">${tigerArtwork}</span></button></div></div></aside>
  <main id="main" class="${cls}" tabindex="-1">${body}</main><div class="cursor-cue" aria-hidden="true">Read ↗</div><div class="weather-control" aria-label="Weather mode"></div></body></html>`;
}
async function page(route, title, desc, active, body, cls) { await mkdir(`dist/${route}`,{recursive:true}); await writeFile(`dist/${route}${route?'/':''}index.html`,layout(title,desc,active,body,cls)); }
const featured = [posts[0],posts[3],posts[6]];
const paintings=[
  {file:'alpine',alt:'Painting of snowy Himalayan peaks above a blue alpine lake'},
  {file:'terraces',alt:'Painting of green terraced hills and misty mountain ridges'},
  {file:'pines',alt:'Painting of a golden mountain trail beside pine trees'},
  {file:'misty-valley',alt:'Painting of a misty cedar valley and distant waterfall'},
  {file:'rhododendron',alt:'Painting of a Himalayan meadow filled with rhododendrons'},
  {file:'monsoon-ridge',alt:'Painting of rain clouds crossing a dark Himalayan ridge'},
  {file:'autumn-ravine',alt:'Painting of an autumn forest valley and a small footbridge'},
  {file:'moonlit-peaks',alt:'Painting of moonlit Himalayan peaks beneath a crescent moon'},
  {file:'sunrise-overlook',alt:'Painting of a lone deodar overlooking mountains at sunrise'}
];
const essayPosts=posts.filter(p=>p.section!=='photography');
const mountainCard=p=>{const i=essayPosts.indexOf(p);return card({...p,art:'mountain-placeholder',painting:paintings[i]},i);};
const articleDeck=`<template id="article-deck">${essayPosts.map(mountainCard).join('')}</template>`;
const photoModal=`<dialog class="photo-modal" aria-labelledby="photo-modal-title"><div class="photo-modal-shell"><button class="photo-modal-close" type="button" aria-label="Close full image">×</button><img src="" alt=""><div class="photo-modal-copy"><div><h2 id="photo-modal-title"></h2><p></p></div><div class="photo-modal-meta"><span class="photo-modal-location"></span><span class="photo-modal-camera"></span><time></time></div><span class="photo-modal-help">Use ← and → for previous or next photo</span></div></div></dialog>`;
await page('', 'About', 'Vivek Singh — notes on design, history, spaces, and the everyday. Rooted in Uttarakhand.', '', `<section class="hero" aria-labelledby="intro"><div class="portrait" role="img" aria-label="Vivek Singh profile photo">${profile.portrait?`<img src="${esc(profile.portrait)}" alt="Vivek Singh" width="100" height="100">`:'<span>VS</span><small>portrait to come</small>'}</div><h1 id="intro" class="personal-name"><span>Vivek Singh</span>${signatureSvg()}</h1><p class="location"><span class="location-part current-location">${icon('home')}Now in Bengaluru</span><span class="location-part">${icon('hill')}${esc(profile.location)}</span></p><div class="intro-lines"><p>Curious about people. Thoughtful about design.</p><p>Exploring the stories, spaces, and small things around us.</p><p>Rooted in the hills. Always looking a little closer.</p></div></section><section id="latest" class="latest" aria-label="Latest writing"><div class="grid home-grid">${featured.map(p=>mountainCard(p)).join('')}</div>${articleDeck}<div class="deck-controls"><button class="shuffle-cards" type="button" data-shuffle>${icon('wand')}<span>Shuffle articles</span></button></div><span class="visually-hidden" role="status" aria-live="polite" data-deck-status></span></section>`, 'home');
for (const s of sections) {
  const items = posts.filter(p=>p.section===s.slug).sort((a,b)=>s.slug==='photography'?(b.clickedISO||'').localeCompare(a.clickedISO||''):0);
  const heading=`<h1>${s.name}<span class="name-dot">.</span></h1><p>${s.description}</p>`;
  const header=s.slug==='photography'?`<header class="collection-header photography-heading"><div class="photography-tiger-slot"></div><div class="photography-heading-copy">${heading}</div></header>`:`<header class="collection-header">${heading}</header>`;
  await page(s.slug,s.name,s.description,s.slug,`${header}<section class="grid collection-grid${s.slug==='photography'?' photography-grid':''}" aria-label="${s.name} collection">${items.map(card).join('')}</section>${items.length?'':'<p class="projects-empty">Projects will appear here soon.</p>'}${s.slug==='photography'?photoModal:''}`,'collection');
  for (const p of items) {
    const photo = s.slug === 'photography';
    const ix = items.indexOf(p), next = items[(ix+1)%items.length];
    await page(`${s.slug}/${p.slug}`,p.title,p.subtitle,s.slug,`<div class="reading-progress" aria-hidden="true"></div><a class="back-link" href="/${s.slug}/">← Back to ${s.name}</a><article class="article"><header><p class="eyebrow">${p.tag}</p><h1>${p.title}</h1><p class="article-deck">${p.subtitle}</p><div class="article-meta"><span>Vivek Singh</span><span aria-hidden="true">/</span><time datetime="2026-09-20">${photo?'Collection planned':'Draft created'} 20 Sep 2026</time>${photo?'':'<span aria-hidden="true">/</span><span>2 min read</span>'}</div></header><div class="draft-banner">${photo?'Planned collection — original photographs have not been added yet.':'Sample draft · Written as preview content for this website; not a published essay.'}</div>${photo?`<div class="photo-detail-empty">${icon('camera')}<h2>A place for the photographs.</h2><p>This collection is waiting for original images, captions, locations, and capture dates.</p><a href="/photography/">Explore the planned collections ${icon('arrow')}</a></div>`:`<figure class="article-art art art-${p.art}">${artwork(p)}${p.art==='landscape' && landscape?'<figcaption>Original digital illustration · not a photograph</figcaption>':''}</figure><div class="prose">${p.body.map(([h,b])=>`<section><h2>${h}</h2><p>${b}</p></section>`).join('')}<p class="end-mark" aria-label="End of draft">✳</p></div>`}<div class="article-next"><span class="eyebrow">${photo?'ANOTHER COLLECTION':'ANOTHER OPEN QUESTION'}</span><a href="/${s.slug}/${next.slug}/">${next.title}${icon('arrow')}</a></div></article>`,'reading');
  }
}
await copyFile('scripts/style.css','dist/style.css');
await copyFile('scripts/app.js','dist/app.js');
await copyFile('scripts/fog.js','dist/fog.js');
for(const file of ['theme-init.js','theme.css','night.js','weather-control.js','rope-renderer.js'])await copyFile('scripts/'+file,'dist/'+file);
await copyFile('scripts/tiger.js','dist/tiger.js');
await copyFile('scripts/tiger-gaze.js','dist/tiger-gaze.js');
await copyFile('scripts/tiger-tooltip.js','dist/tiger-tooltip.js');
console.log(`Built home, ${sections.length} collections, and ${posts.length} detail pages. Landscape asset: ${landscape}.`);
