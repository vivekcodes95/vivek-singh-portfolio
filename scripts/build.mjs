import { mkdir, writeFile, copyFile, access } from 'node:fs/promises';
import { profile, sections, posts } from './content.mjs';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = { home:'<path d="m3 10 9-7 9 7v11H3Z"/><path d="M9 21v-8h6v8"/>', design:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>', history:'<path d="m3 8 9-5 9 5M4 9h16M3 21h18M5 11v7m7-7v7m7-7v7"/>', camera:'<path d="M3 7h4l2-3h6l2 3h4v14H3Z"/><circle cx="12" cy="13" r="4"/>', space:'<path d="m3 6 9-3 9 3v15l-9-3-9 3Zm9-3v15M3 6l9 3 9-3"/>', hill:'<path d="m2 20 7-13 4 6 3-10 6 17M6 13l3 2 2-2m3-4 2 2 2-2"/>', arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>', wand:'<path d="m15 4 5 5L8 21l-5-5L15 4Z"/><path d="m6 13 5 5M6 3v3M4.5 4.5h3M19 15v4M17 17h4"/>' };
const icon = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key] || icons.hill}</svg>`;
let landscape = false;
try { await access('dist/assets/foothills.webp'); landscape = true; } catch {}
function artwork(p) {
  if(p.art==='mountain-placeholder')return `<img src="/assets/mountain-${esc(p.painting.file)}.webp" width="768" height="768" alt="${esc(p.painting.alt)}" loading="eager">`;
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
  return `<a class="card ${photo?'photo-card':''}" href="/${p.section}/${p.slug}/" style="--i:${index}" data-card>
    <div class="print"><div class="art art-${p.art}">${artwork(p)}</div><div class="print-label"><span>${esc(p.tag)}</span><span aria-hidden="true">↗</span></div></div>
    <div class="card-copy"><h2>${esc(p.title)}</h2>${photo ? `<p>${esc(p.subtitle)}</p>` : ''}<div class="meta"><span>${photo?'Planned collection':'Sample draft'}</span><span aria-hidden="true">·</span><time datetime="2026-09-20">20 Sep 2026</time></div></div></a>`;
}
function layout(title, description, active, body, cls='') {
  const nav = [{slug:'',name:'Myself',icon:'home'}, ...sections];
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#ffffff"><script src="/theme-init.js"></script><title>${esc(title)} · Vivek Singh</title><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2327473a'/%3E%3Cpath d='m7 9 9 15 9-15' fill='none' stroke='white' stroke-width='3'/%3E%3C/svg%3E"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/theme.css"><script src="/app.js" defer></script><script src="/night.js" type="module"></script></head>
  <body><a class="skip" href="#main">Skip to content</a><aside class="sidebar"><button class="menu-toggle" aria-expanded="false" aria-controls="navigation">Menu <span aria-hidden="true">+</span></button><div class="sidebar-content" id="navigation"><nav aria-label="Main navigation">${nav.map(n=>`<a href="/${n.slug?n.slug+'/':''}" ${active===n.slug?'aria-current="page"':''}><span>${n.name}</span></a>`).join('')}</nav><div class="sidebar-bottom"><div class="origin"><a class="wordmark" href="/" aria-label="Vivek Singh — myself"><span class="logo-tiger" aria-hidden="true"><img src="/assets/tiger-marker.png" alt="" width="124" height="82"></span></a></div></div></div></aside>
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
await page('', 'Home', 'Vivek Singh — notes on design, history, spaces, and the everyday. Rooted in Uttarakhand.', '', `<section class="hero" aria-labelledby="intro"><div class="portrait" role="img" aria-label="Vivek Singh profile photo">${profile.portrait?`<img src="${esc(profile.portrait)}" alt="Vivek Singh" width="100" height="100">`:'<span>VS</span><small>portrait to come</small>'}</div><h1 id="intro">Vivek Singh<span class="name-dot">.</span></h1><p class="location">${icon('hill')}${esc(profile.location)}</p><div class="intro-lines"><p>Curious about people. Thoughtful about design.</p><p>Exploring the stories, spaces, and small things around us.</p><p>Rooted in the hills. Always looking a little closer.</p></div></section><section id="latest" class="latest" aria-label="Latest writing"><div class="grid home-grid">${featured.map(p=>mountainCard(p)).join('')}</div>${articleDeck}<div class="deck-controls"><button class="shuffle-cards" type="button" data-shuffle>${icon('wand')}<span>Shuffle articles</span></button></div><span class="visually-hidden" role="status" aria-live="polite" data-deck-status></span></section>`, 'home');
for (const s of sections) {
  const items = posts.filter(p=>p.section===s.slug);
  await page(s.slug,s.name,s.description,s.slug,`<div class="page-kicker"><span>THE NOTEBOOK / ${s.name.toUpperCase()}</span><span>${String(items.length).padStart(2,'0')} ${s.slug==='photography'?'PLANNED COLLECTIONS':'SAMPLE DRAFTS'}</span></div><header class="collection-header"><p class="eyebrow">${s.eyebrow}</p><h1>${s.name}<span class="name-dot">.</span></h1><p>${s.description}</p></header><div class="collection-rule"><span>${s.slug==='photography'?'Personal photographs, coming together':'Ideas taking shape'}</span><span>2026</span></div><section class="grid collection-grid" aria-label="${s.name} collection">${items.map(card).join('')}</section><div class="collection-note">${s.slug==='photography'?'These are planned collections. Original photographs and their capture dates will appear here when added.':'These are clearly marked sample drafts for this first version. Finished essays and their publication dates will replace them.'}</div>`,'collection');
  for (const p of items) {
    const photo = s.slug === 'photography';
    const ix = items.indexOf(p), next = items[(ix+1)%items.length];
    await page(`${s.slug}/${p.slug}`,p.title,p.subtitle,s.slug,`<div class="reading-progress" aria-hidden="true"></div><a class="back-link" href="/${s.slug}/">← Back to ${s.name}</a><article class="article"><header><p class="eyebrow">${p.tag}</p><h1>${p.title}</h1><p class="article-deck">${p.subtitle}</p><div class="article-meta"><span>Vivek Singh</span><span aria-hidden="true">/</span><time datetime="2026-09-20">${photo?'Collection planned':'Draft created'} 20 Sep 2026</time>${photo?'':'<span aria-hidden="true">/</span><span>2 min read</span>'}</div></header><div class="draft-banner">${photo?'Planned collection — original photographs have not been added yet.':'Sample draft · Written as preview content for this website; not a published essay.'}</div>${photo?`<div class="photo-detail-empty">${icon('camera')}<h2>A place for the photographs.</h2><p>This collection is waiting for original images, captions, locations, and capture dates.</p><a href="/photography/">Explore the planned collections ${icon('arrow')}</a></div>`:`<figure class="article-art art art-${p.art}">${artwork(p)}${p.art==='landscape' && landscape?'<figcaption>Original digital illustration · not a photograph</figcaption>':''}</figure><div class="prose">${p.body.map(([h,b])=>`<section><h2>${h}</h2><p>${b}</p></section>`).join('')}<p class="end-mark" aria-label="End of draft">✳</p></div>`}<div class="article-next"><span class="eyebrow">${photo?'ANOTHER COLLECTION':'ANOTHER OPEN QUESTION'}</span><a href="/${s.slug}/${next.slug}/">${next.title}${icon('arrow')}</a></div></article>`,'reading');
  }
}
await copyFile('scripts/style.css','dist/style.css');
await copyFile('scripts/app.js','dist/app.js');
await copyFile('scripts/fog.js','dist/fog.js');
for(const file of ['theme-init.js','theme.css','night.js','weather-control.js'])await copyFile('scripts/'+file,'dist/'+file);
await copyFile('scripts/tiger.js','dist/tiger.js');
console.log(`Built home, ${sections.length} collections, and ${posts.length} detail pages. Landscape asset: ${landscape}.`);
