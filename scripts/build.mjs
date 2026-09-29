import { mkdir, writeFile, copyFile, access, rm } from 'node:fs/promises';
import { profile, sections, posts } from './content.mjs';
import { signatureSvg } from './signature.mjs';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = { home:'<path d="m3 10 9-7 9 7v11H3Z"/><path d="M9 21v-8h6v8"/>', whatsapp:'<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.7Z"/><path fill="currentColor" stroke="none" d="M8.1 7.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.9c.1.3 0 .5-.2.7l-.6.7c-.2.2-.1.4 0 .6.7 1.3 1.7 2.3 3 3 .2.1.4.2.6 0l.8-1c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.6 0 .4-.2 1.2-.7 1.7-.5.5-1.3.8-2.1.7-1.2-.2-2.8-.8-4.5-2.3-2-1.8-3.1-4.1-3.2-5.2-.1-.8.4-1.6.7-2.1Z"/>', design:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>', history:'<path d="m3 8 9-5 9 5M4 9h16M3 21h18M5 11v7m7-7v7m7-7v7"/>', camera:'<path d="M3 7h4l2-3h6l2 3h4v14H3Z"/><circle cx="12" cy="13" r="4"/>', space:'<path d="m3 6 9-3 9 3v15l-9-3-9 3Zm9-3v15M3 6l9 3 9-3"/>', hill:'<path d="m2 20 7-13 4 6 3-10 6 17M6 13l3 2 2-2m3-4 2 2 2-2"/>', location:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>', arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>', waves:'<path d="M3 7.5c2.2 0 2.2 1.7 4.4 1.7s2.2-1.7 4.4-1.7 2.2 1.7 4.4 1.7 2.2-1.7 4.4-1.7M3 12c2.2 0 2.2 1.7 4.4 1.7s2.2-1.7 4.4-1.7 2.2 1.7 4.4 1.7 2.2-1.7 4.4-1.7M3 16.5c2.2 0 2.2 1.7 4.4 1.7s2.2-1.7 4.4-1.7 2.2 1.7 4.4 1.7 2.2-1.7 4.4-1.7"/>', palm:'<path d="M12 21c-.1-5.2.4-9.3 1.6-12.2M13.5 9C10.8 6.2 8 5.7 5 6.8c2.2-3 5.2-3.7 8.9-2.2M13.8 8.6c2.8-2.7 5.5-3.2 8.2-1.6-2.1-3.2-5-4-8.5-2.5M14 8.8c.7-3.6 2.3-5.8 4.9-6.6-3.5-.4-5.5 1.5-5.9 5.8M6 21c.1-3.5.5-6.2 1.4-8.2M7.3 13c-1.8-1.7-3.6-2-5.3-1 1.4-2.1 3.4-2.6 5.8-1.5M7.5 12.9c1.8-1.8 3.6-2.1 5.4-1.1-1.4-2-3.2-2.5-5.5-1.5"/>' };
Object.assign(icons,{linkedin:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7m0-10v.1M12 17v-7m0 3.1c.7-2 4-2.3 4 1V17"/>',twitter:'<path d="M20 7.2c-.6.3-1.2.5-1.9.6a3.2 3.2 0 0 0-5.5 2.2v.7A9.1 9.1 0 0 1 6 7.4s-3 6.7 3.8 9.7A9.8 9.8 0 0 1 4 18.8c6.8 3.8 15.3 0 15.3-8.8v-.4c.6-.6 1.2-1.3 1.6-2.1-.6.3-1.2.5-1.9.6"/>',whatsappLine:'<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M8.2 7.7c.5 3.9 4.4 7.8 8.2 8.2l1.1-1.7-2.6-1.2-.9 1c-1.8-.8-3.2-2.2-4-4l1-1-.9-2.5Z"/>'});
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
  if(photo)return `<a class="card photo-card" href="/${p.section}/${p.slug}/" style="--i:${index}" data-card data-photo-title="${esc(p.title)}" data-photo-card-title="${esc(p.cardTitle||p.subtitle)}" data-photo-description="${esc(p.subtitle)}"${p.image?` data-photo-src="${esc(p.image)}"`:''}>
    <div class="print"><div class="art art-${p.art}">${artwork(p)}</div><div class="card-copy photo-card-copy"><h2>${esc(p.cardTitle||p.subtitle)}</h2><span class="photo-location">${esc(p.location)}</span><div class="meta"><span>${esc(p.camera)}</span><span class="photo-meta-diamond" aria-hidden="true"></span>${p.clickedISO?`<time datetime="${esc(p.clickedISO)}">${esc(p.clicked)}</time>`:`<span>${esc(p.clicked)}</span>`}</div></div></div></a>`;
  const ux=p.section==='ux-design';
  return `<a class="card${ux?' ux-card':''}" href="/${p.section}/${p.slug}/" style="--i:${index}" data-card>
    <div class="print"><div class="art art-${p.art}">${artwork(p)}</div>${ux?'':`<div class="print-label"><span>${esc(p.tag)}</span><span aria-hidden="true">↗</span></div>`}</div>
    <div class="card-copy"><h2>${esc(p.title)}</h2>${photo ? `<p>${esc(p.subtitle)}</p>` : ''}<div class="meta"><span>${photo?'Planned collection':'Sample draft'}</span><span aria-hidden="true">·</span><time datetime="2026-09-20">20 Sep 2026</time></div></div></a>`;
}
function layout(title, description, active, body, cls='') {
  const nav = [{slug:'',name:'Me',icon:'home'}, ...sections.filter(s=>!s.hiddenFromNav)];
  const tigerArtwork='<img src="/assets/tiger-dramatic-upright.png" alt="" width="1254" height="1254">';
  const socialFooter=`<footer class="site-footer"><span>Connect at</span><div class="social-icons" aria-label="Social platforms"><a class="social-icon" href="https://www.linkedin.com/in/vivekdesigns/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">${icon('linkedin')}</a><a class="social-icon" href="https://x.com/vivek_designs" target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter">${icon('twitter')}</a><a class="social-icon" href="https://wa.me/91639941802" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp · +91-6399-41802">${icon('whatsappLine')}</a></div></footer>`;
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#ffffff"><script src="/theme-init.js"></script><title>${esc(title)} · Vivek Singh</title><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2327473a'/%3E%3Cpath d='m7 9 9 15 9-15' fill='none' stroke='white' stroke-width='3'/%3E%3C/svg%3E"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/theme.css"><script src="/app.js" defer></script><script src="/night.js" type="module"></script></head>
  <body><a class="skip" href="#main">Skip to content</a><aside class="sidebar${active?' has-profile profile-arriving':''}"><button class="menu-toggle" aria-expanded="false" aria-controls="navigation">Menu <span aria-hidden="true">+</span></button><a class="sidebar-profile" href="/" aria-label="Vivek — return to Me"><span class="sidebar-profile-photo"><img src="${esc(profile.portrait)}" alt="" width="80" height="80"></span><span class="sidebar-profile-name"><span>Vivek</span></span></a><div class="sidebar-content" id="navigation"><nav aria-label="Main navigation"><span class="nav-indicator" aria-hidden="true"></span>${nav.map(n=>`<a href="/${n.slug?n.slug+'/':''}" ${active===n.slug?'aria-current="page"':''}><span>${cls==='home'&&n.slug==='ux-design'?'UX Design':n.name}</span></a>`).join('')}</nav></div><div class="sidebar-bottom"><div class="origin"><button class="wordmark tiger-info" type="button" aria-label="Royal Bengal Tiger — learn about this species" aria-describedby="tiger-tooltip"><span class="logo-tiger" aria-hidden="true">${tigerArtwork}</span></button></div></div></aside>
  <main id="main" class="${cls}" tabindex="-1">${body}${socialFooter}</main><div class="cursor-cue" aria-hidden="true">Read ↗</div><div class="weather-control" aria-label="Weather mode"></div></body></html>`;
}
async function page(route, title, desc, active, body, cls) { await mkdir(`dist/${route}`,{recursive:true}); await writeFile(`dist/${route}${route?'/':''}index.html`,layout(title,desc,active,body,cls)); }
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
const sectionName=slug=>sections.find(section=>section.slug===slug)?.name||slug;
const homeCard=(p,index,extra=false)=>{const painting=paintings[essayPosts.indexOf(p)];return `<a class="card home-card${extra?' home-card-extra':''}" href="/${p.section}/${p.slug}/" style="--i:${index}" data-card${extra?' hidden':''}>
  <div class="print"><div class="art art-mountain-placeholder">${artwork({...p,art:'mountain-placeholder',painting})}</div></div>
  <div class="card-copy"><h2>${esc(p.title)}</h2><div class="home-card-meta"><span>${esc(p.section==='ux-design'?'UX Design':sectionName(p.section))}</span><span aria-hidden="true">↗</span></div></div></a>`;};
const homeOrder=[posts[0],posts[3],posts[6],posts[1],posts[4],posts[7],posts[2],posts[5],posts[8]];
const productDesignCard=(p,index)=>{
  const painting=paintings[essayPosts.indexOf(p)];
  return `<a class="card ux-card product-design-card" href="/${p.section}/${p.slug}/" style="--i:${index}" data-card>
    <div class="print"><div class="art art-mountain-placeholder">${artwork({...p,art:'mountain-placeholder',painting})}</div></div>
    <div class="card-copy"><h2>${esc(p.title)}</h2><div class="home-card-meta"><span>${esc(sectionName(p.section))}</span><span aria-hidden="true">↗</span></div></div></a>`;
};
const photoModal=`<dialog class="photo-modal" aria-labelledby="photo-modal-title"><div class="photo-modal-shell"><button class="photo-modal-close" type="button" aria-label="Close full image">×</button><img src="" alt=""><div class="photo-modal-copy"><div><h2 id="photo-modal-title"></h2><p></p></div><div class="photo-modal-meta"><span class="photo-modal-location"></span><span class="photo-modal-camera"></span><time></time></div><span class="photo-modal-help">Use ← and → for previous or next photo</span></div></div></dialog>`;
await page('', 'Me', 'Vivek Singh — notes on design, history, spaces, and the everyday. Rooted in Uttarakhand.', '', `<section class="hero" aria-labelledby="intro"><div class="portrait" role="img" aria-label="Vivek Singh profile photo">${profile.portrait?`<img src="${esc(profile.portrait)}" alt="Vivek Singh" width="100" height="100">`:'<span>VS</span><small>portrait to come</small>'}</div><h1 id="intro" class="personal-name signature-intro"><span>Vivek Singh</span>${signatureSvg()}</h1><p class="location"><span class="location-part current-location">${icon('home')}Now in Bengaluru</span><span class="location-part">${icon('hill')}${esc(profile.location)}</span></p><div class="intro-lines"><p class="bio-role"><span>Heading Creator Experience at Pocket FM 🌱 Stoked about wildlife,</span> <span>and here you are on a digital safari with me.</span></p></div></section><section id="latest" class="latest" aria-label="Featured work"><div class="grid home-grid">${homeOrder.map((p,index)=>homeCard(p,index,index>=6)).join('')}</div><div class="about-deck-controls"><a class="see-all-cards" href="/ux-design/">${icon('waves')}<span>See all</span></a></div><span class="visually-hidden" role="status" aria-live="polite" data-deck-status></span></section>`, 'home');
for (const s of sections) {
  const sectionItems=posts.filter(p=>p.section===s.slug).sort((a,b)=>s.slug==='photography'?(b.clickedISO||'').localeCompare(a.clickedISO||''):0);
  const items = s.slug==='ux-design'?homeOrder.slice(0,6):sectionItems;
  const headingDescription=s.slug==='ux-design'?'Notes on how we think, what we notice,<br>and the little decisions that make design feel human.':s.slug==='photography'?'Light, landscapes, and ordinary moments.<br>A space for photographs from my own point of view.':esc(s.description);
  const heading=`<h1>${s.name}<span class="name-dot">.</span></h1><p>${headingDescription}</p>`;
  const header=`<header class="collection-header">${heading}</header>`;
  const cards=s.slug==='ux-design'?items.map(productDesignCard).join(''):items.map(card).join('');
  await page(s.slug,s.name,s.description,s.slug,`${header}<section class="grid collection-grid${s.slug==='photography'?' photography-grid':''}" aria-label="${s.name} collection">${cards}</section>${items.length?'':'<p class="projects-empty">Projects will appear here soon.</p>'}${s.slug==='photography'?photoModal:''}`,'collection');
  for (const p of sectionItems) {
    const photo = s.slug === 'photography';
    const ix = sectionItems.indexOf(p), next = sectionItems[(ix+1)%sectionItems.length];
    await page(`${s.slug}/${p.slug}`,p.title,p.subtitle,s.slug,`<div class="reading-progress" aria-hidden="true"></div><a class="back-link" href="/${s.slug}/">← Back to ${s.name}</a><article class="article"><header><p class="eyebrow">${p.tag}</p><h1>${p.title}</h1><p class="article-deck">${p.subtitle}</p><div class="article-meta"><span>Vivek Singh</span><span aria-hidden="true">/</span><time datetime="2026-09-20">${photo?'Collection planned':'Draft created'} 20 Sep 2026</time>${photo?'':'<span aria-hidden="true">/</span><span>2 min read</span>'}</div></header><div class="draft-banner">${photo?'Planned collection — original photographs have not been added yet.':'Sample draft · Written as preview content for this website; not a published essay.'}</div>${photo?`<div class="photo-detail-empty">${icon('camera')}<h2>A place for the photographs.</h2><p>This collection is waiting for original images, captions, locations, and capture dates.</p><a href="/photography/">Explore the planned collections ${icon('arrow')}</a></div>`:`<figure class="article-art art art-${p.art}">${artwork(p)}${p.art==='landscape' && landscape?'<figcaption>Original digital illustration · not a photograph</figcaption>':''}</figure><div class="prose">${p.body.map(([h,b])=>`<section><h2>${h}</h2><p>${b}</p></section>`).join('')}<p class="end-mark" aria-label="End of draft">✳</p></div>`}<div class="article-next"><span class="eyebrow">${photo?'ANOTHER COLLECTION':'ANOTHER OPEN QUESTION'}</span><a href="/${s.slug}/${next.slug}/">${next.title}${icon('arrow')}</a></div></article>`,'reading');
  }
}
await copyFile('scripts/style.css','dist/style.css');
await copyFile('scripts/app.js','dist/app.js');
for(const file of ['theme-init.js','theme.css','night.js','weather-control.js','rope-renderer.js'])await copyFile('scripts/'+file,'dist/'+file);
await copyFile('scripts/tiger.js','dist/tiger.js');
await copyFile('scripts/tiger-gaze.js','dist/tiger-gaze.js');
await copyFile('scripts/marten-gaze.js','dist/marten-gaze.js');
await copyFile('scripts/marten-tooltip.js','dist/marten-tooltip.js');
await copyFile('scripts/tiger-tooltip.js','dist/tiger-tooltip.js');
await rm('dist/duowallet',{recursive:true,force:true});
await mkdir('dist/duowallet',{recursive:true});
await writeFile('dist/duowallet/index.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0; url=https://duoawallet.vivekdesigns.com/"><link rel="canonical" href="https://duoawallet.vivekdesigns.com/"><title>Duo Wallet · Vivek Singh</title></head><body><p>Duo Wallet has moved to <a href="https://duoawallet.vivekdesigns.com/">duoawallet.vivekdesigns.com</a>.</p></body></html>');
console.log(`Built home, ${sections.length} collections, and ${posts.length} detail pages. Landscape asset: ${landscape}.`);
