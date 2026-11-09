import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs');
const profile = JSON.parse(await readFile(path.join(root, 'data/profile.json'), 'utf8'));
const publications = JSON.parse(await readFile(path.join(root, 'data/publications.json'), 'utf8')).sort((a,b) => b.year-a.year);
const origin = 'https://marcobecattini.github.io';
const styleVersion = createHash('sha256').update(await readFile(path.join(root, 'assets/site.css'))).digest('hex').slice(0, 12);
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const nav = [['about','About','/'],['publications','Publications','/publications/'],['cv','CV','/cv/'],['research','Research','/research/'],['teaching','Teaching','/teaching/'],['talks','Talks','/talks/'],['service','Service','/service/']];
const hiddenNavigation = new Set(['research', 'teaching', 'service', 'talks']);
const authorLinks = new Map([['Roberto Verdecchia','https://robertoverdecchia.github.io/'],['Enrico Vicario','https://stlab.dinfo.unifi.it/vicario/'],['Leonardo Scommegna','https://leonardoscommegna.github.io/'],['Nuno Laranjeiro','https://eden.dei.uc.pt/~cnl/']]);
function shortName(name) {
  if (name === 'Ignacio de Miguel') return 'I. de Miguel';
  const parts = name.trim().split(/\s+/);
  return parts.slice(0,-1).map(x => x[0]+'.').join(' ')+' '+parts.at(-1);
}
function authorsLine(names) {
  return names.split(', ').map((name, index, names) => {
    let label = escape(shortName(name));
    if (name === profile.name) label = `<em>${label}</em>`;
    else if (authorLinks.has(name)) label = `<a href="${escape(authorLinks.get(name))}">${label}</a>`;
    return (index ? index === names.length-1 ? ', and ' : ', ' : '') + label;
  }).join('');
}
function paper(item) {
  const id = escape(item.id);
  const abstract = item.abstract ? `<button type="button" data-toggle aria-controls="${id}-abstract" aria-expanded="false">[Abstract]</button>` : '';
  return `<li class="publication" data-publication data-search="${escape(`${item.title} ${item.authors} ${item.venue} ${item.year}`.toLocaleLowerCase())}">
    <div class="authors">${authorsLine(item.authors)}</div>
    <h2 class="paper-title">${escape(item.title)}</h2>
    <div class="venue">${escape(item.venue)}, ${item.year}.</div>
    ${item.status ? `<div class="paper-status">${escape(item.status)}</div>` : ''}
    <div class="paper-actions">${abstract}<button type="button" data-toggle aria-controls="${id}-bibtex" aria-expanded="false">[BibTeX]</button>${item.pdf ? `<a href="${escape(item.pdf)}">[PDF]</a>` : ''}${item.doi ? `<a href="${escape(item.doi)}">[DOI]</a>` : `<a href="${escape(item.source)}">[Source]</a>`}</div>
    ${item.abstract ? `<div id="${id}-abstract" class="paper-panel" hidden><p>${escape(item.abstract)}</p></div>` : ''}
    <div id="${id}-bibtex" class="paper-panel" hidden><button type="button" class="copy-button" data-copy="${id}-citation">Copy citation</button><span class="copy-status" role="status"></span><pre id="${id}-citation">${escape(item.bibtex)}</pre></div>
  </li>`;
}
const sidebarIcons = {
  scholar: '<path d="M1 6.2 8 2.8l7 3.4L8 9.6 1 6.2Zm3 1.5v3.4c2 2 6 2 8 0V7.7M15 6.2v4"/>',
  university: '<path d="M1.5 5.8 8 2l6.5 3.8h-13ZM3.5 6v5.8m4.5-5.8v5.8m4.5-5.8v5.8M2 12h12m-12.5 2h13"/>',
  lab: '<path d="m5 4.5-3.5 3.5L5 11.5m6-7 3.5 3.5-3.5 3.5m-1.4-9-3.2 11"/>',
  // GitHub mark from Primer Octicons (MIT).
  github: '<path fill="currentColor" stroke="none" d="M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656"/>',
  linkedin: '<rect x="1.5" y="1.5" width="13" height="13" rx="2"/><path fill="currentColor" stroke="none" d="M4 6.5h1.7v5.4H4zM4.85 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM7.1 6.5h1.6v.7c.35-.55.95-.85 1.65-.85 1.3 0 2.05.77 2.05 2.2v3.35h-1.7V8.95c0-.75-.3-1.12-.9-1.12-.65 0-1 .46-1 1.15v2.92H7.1z"/>',
  email: '<rect x="1.5" y="3.5" width="13" height="9" rx="1.3"/><path d="m2 4.4 6 4.3 6-4.3"/>',
};
function sidebarIcon(name) {
  return `<svg class="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${sidebarIcons[name]}</svg>`;
}
function sidebar() {
  return `<aside class="author" aria-label="About Marco Becattini"><div class="author-photo-frame"><img class="author-photo" src="${escape(profile.photo)}" alt="Marco Becattini" width="150" height="150"></div><h2>${escape(profile.name)}</h2><p class="author-role">${escape(profile.role)} at the <a href="https://www.unifi.it/">${escape(profile.affiliation)}</a></p><ul class="author-links">${profile.links.map(link => `<li>${sidebarIcon(link.icon)}<a href="${escape(link.url)}">${escape(link.label)}</a></li>`).join('')}<li>${sidebarIcon('email')}<a href="mailto:${escape(profile.email)}">e-Mail</a></li></ul></aside>`;
}
function layout(id, title, content, description) {
  const href = nav.find(item=>item[0]===id)?.[2] || '/404.html';
  const featureImages = {
    publications: '<img class="feature-cutout" src="/assets/snoopy-typewriter.webp" alt="" width="240" height="239">',
    cv: '<img class="feature-cutout" src="/assets/snoopy-aviator.webp" alt="" width="240" height="226">',
  };
  const featureImage = featureImages[id] ?? '<img src="/assets/surf-banner.png" alt="" width="1022" height="168">';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} — ${escape(profile.name)}</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${origin}${href}"><meta property="og:type" content="website"><meta property="og:title" content="${escape(title)} — Marco Becattini"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${origin}${href}"><meta property="og:image" content="${origin}/assets/surf-banner.png"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/assets/site.css?v=${styleVersion}"><script src="/assets/site.js" defer></script></head><body><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="header-inner"><a class="brand" href="/">Marco Becattini</a><nav class="main-nav" aria-label="Main navigation">${nav.filter(([key]) => !hiddenNavigation.has(key)).map(([key,label,url])=>`<a href="${url}"${id===key?' aria-current="page"':''}>${label}</a>`).join('')}</nav></div></header><div class="feature-image" aria-hidden="true">${featureImage}</div><div class="site-layout">${sidebar()}<main class="page-content" id="main"><h1>${escape(title)}</h1>${content}</main></div></body></html>\n`;
}
const pages = {
 about: ['About Me', `<p><em>“Then,” said the cat, “it really doesn’t matter, does it?”</em></p><div class="bio">${profile.biography.map(paragraph=>`<p>${escape(paragraph)}</p>`).join('')}</div><h2>Research Interests</h2><p><em>The smartest guy in a room is the room</em></p><ul class="research-list">${profile.interests.map(interest=>`<li>${escape(interest)}</li>`).join('')}</ul>`, 'Marco Becattini, PhD student in Smart Computing at the University of Florence. Software engineering for LLM-based multi-agent systems.'],
 publications: ['My Publications', `<p class="publication-intro">You can also browse my <a href="https://scholar.google.com/citations?user=0ibann4AAAAJ">Google Scholar profile</a>.</p><div class="publication-tools"><label for="publication-search">Filter <input id="publication-search" type="search" placeholder="Title, author, venue, year…" autocomplete="off"></label><output id="publication-count" aria-live="polite">${publications.length} publications</output><a href="/publications.bib" download>Download BibTeX</a></div><ul class="publication-list">${publications.map(paper).join('')}</ul><p id="no-results" class="empty-results" hidden>No publications match your search.</p><p class="scholarly-note">PDF links lead to publisher records, preprints, or author manuscripts. Copyright remains with the respective authors and rights holders.</p>`, 'Publications by Marco Becattini on LLM-based multi-agent systems, software architecture, reliability, and Digital Twin Networks.'],
 cv: ['Curriculum Vitae', `
   <p><em>Not all those who wander are lost</em></p>
   <p class="cv-summary">I am a PhD student in Smart Computing at the University of Florence and work in research and development at Lascaux. My research focuses on the architecture, coordination, reliability, and performance of LLM-based multi-agent systems. I draw on my experience in software engineering and telecommunications to study how these systems can be designed and evaluated in practice.</p>
   <p>If you’d like a copy of my full CV, feel free to <a href="mailto:${escape(profile.email)}">email me</a>.</p>
   <h2>Current Roles</h2>
   <ul class="cv-entries">
     <li><div><strong>PhD Student in Smart Computing</strong><span><a href="https://stlab.dinfo.unifi.it/">University of Florence · Software Technologies Laboratory (STLab)</a></span></div></li>
     <li><div><strong>Research and Development</strong><span><a href="https://www.lascaux.it/en/about-us/">Lascaux</a></span></div></li>
     <li><div><strong>Scientific Advisor, Board of Directors</strong><span><a href="https://www.arezzoinnovazione.it/la-fondazione/">Fondazione Arezzo Innovazione</a></span></div></li>
   </ul>
   <h2>Selected Experience</h2>
   <ul class="cv-entries">
     <li><div><strong>Reply Group</strong><span>Innovation and strategy, followed by managing director and CEO roles 🇮🇹🇨🇭🇬🇧</span></div><span class="cv-date">2009–2023</span></li>
     <li><div><strong>Accenture</strong><span>Software delivery, user experience, and CRM strategy 🇮🇹 🇮🇳</span></div><span class="cv-date">2007–2009</span></li>
   </ul>
   <h2>Education</h2>
   <ul class="cv-entries">
     <li><div><strong>Bachelor’s and Master’s degrees in Computer Engineering</strong><span>University of Florence</span></div><span class="cv-date">2000–2007</span></li>
   </ul>
 `, 'Academic and professional profile of Marco Becattini.'],
 research: ['Research', `<div class="bio"><p>${escape(profile.biography[1])}</p><h2>LLM-Based Multi-Agent Systems</h2><p>My doctoral research connects agent organisation and execution control with reliability and performance under uncertainty. It includes SALLMA, accountability-based agent cooperation, social agent discovery, and empirical studies of HorseReport and CAPRA.</p><p>My thesis is entitled <em>On Reliability and Performance in LLM-Based Multi-Agent Systems</em>.</p><h2>Digital Twin Networks and Quantitative Evaluation</h2><p>My earlier work explored Digital Twin Networks, sustainable in-network computing, Mobile Edge Computing, and software rejuvenation. These studies provide a foundation for evaluating the behaviour of complex software systems.</p><h2>Research Interests</h2><ul class="research-list">${profile.interests.map(interest=>`<li>${escape(interest)}</li>`).join('')}</ul><p>For details and results, see <a href="/publications/">my publications</a>.</p></div>`, 'Research on software engineering, architecture, reliability and performance of LLM-based multi-agent systems.'],
};
for (const [id,title,intro] of [['teaching','Teaching','Thesis supervision and research projects in software engineering.'],['talks','Talks','Research presentations and conference contributions.'],['service','Academic Activities','Research groups and academic collaborations.']]) {
 pages[id]=[title,`<p>${intro}</p>${profile.activities[id].map(item=>`<article class="activity">${item.date?`<p class="activity-date">${escape(item.date)}</p>`:''}<h2>${item.url?`<a href="${escape(item.url)}">${escape(item.title)}</a>`:escape(item.title)}</h2><p>${escape(item.detail)}</p></article>`).join('')}`,`${title} — Marco Becattini, University of Florence.`];
}
await mkdir(output,{recursive:true});
await rm(path.join(output,'assets'),{recursive:true,force:true});
await cp(path.join(root,'assets'),path.join(output,'assets'),{recursive:true});
for(const [id,[title,content,description]] of Object.entries(pages)) {
 const destination=id==='about'?output:path.join(output,nav.find(item=>item[0]===id)[2]);
 await mkdir(destination,{recursive:true});
 await writeFile(path.join(destination,'index.html'),layout(id,title,content,description));
}
await writeFile(path.join(output,'404.html'),layout('404','Page Not Found','<p>The page you are looking for could not be found. <a href="/">Return to the homepage</a>.</p>','Page not found.'));
await writeFile(path.join(output,'publications.bib'),publications.map(item=>item.bibtex).join('\n\n')+'\n');
await writeFile(path.join(output,'.nojekyll'),'');
await writeFile(path.join(output,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(path.join(output,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${nav.map(item=>`<url><loc>${origin}${item[2]}</loc></url>`).join('')}</urlset>\n`);
console.log(`Built ${Object.keys(pages).length} pages and ${publications.length} publications in docs/.`);
