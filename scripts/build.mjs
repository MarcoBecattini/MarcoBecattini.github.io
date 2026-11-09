import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs');
const profile = JSON.parse(await readFile(path.join(root, 'data/profile.json'), 'utf8'));
const publications = JSON.parse(await readFile(path.join(root, 'data/publications.json'), 'utf8')).sort((a,b) => b.year-a.year);
const origin = 'https://marcobecattini.github.io';
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const nav = [['about','About','/'],['publications','Publications','/publications/'],['research','Research','/research/'],['teaching','Teaching','/teaching/'],['talks','Talks','/talks/'],['service','Service','/service/']];
const hiddenNavigation = new Set(['teaching', 'service']);
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
function sidebar() {
  return `<aside class="author" aria-label="About Marco Becattini"><img class="author-photo" src="${escape(profile.photo)}" alt="Marco Becattini" width="150" height="150"><h2>${escape(profile.name)}</h2><p class="author-role">${escape(profile.role)} at the <a href="https://www.unifi.it/">${escape(profile.affiliation)}</a>.</p><ul class="author-links"><li><span class="icon" aria-hidden="true">⌖</span>${escape(profile.location)}</li>${profile.links.map(link => `<li><span class="icon" aria-hidden="true">↗</span><a href="${escape(link.url)}">${escape(link.label)}</a></li>`).join('')}<li><span class="icon" aria-hidden="true">✉</span><a href="mailto:${escape(profile.email)}">e-Mail</a></li></ul></aside>`;
}
function layout(id, title, content, description) {
  const href = nav.find(item=>item[0]===id)?.[2] || '/404.html';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} — ${escape(profile.name)}</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${origin}${href}"><meta property="og:type" content="website"><meta property="og:title" content="${escape(title)} — Marco Becattini"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${origin}${href}"><meta property="og:image" content="${origin}/assets/research-desk.png"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script></head><body><a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="header-inner"><a class="brand" href="/">Marco Becattini</a><nav class="main-nav" aria-label="Main navigation">${nav.filter(([key]) => !hiddenNavigation.has(key)).map(([key,label,url])=>`<a href="${url}"${id===key?' aria-current="page"':''}>${label}</a>`).join('')}</nav></div></header><div class="feature-image" aria-hidden="true"><img src="/assets/research-desk.png" alt="" width="2172" height="724"></div><div class="site-layout">${sidebar()}<main class="page-content" id="main"><h1>${escape(title)}</h1>${content}</main></div><footer class="site-footer"><span>© ${new Date().getUTCFullYear()} Marco Becattini.</span><span><a href="https://github.com/MarcoBecattini/MarcoBecattini.github.io">Website source</a> · <a href="mailto:${escape(profile.email)}">Contact</a></span></footer></body></html>\n`;
}
const pages = {
 about: ['About Me', `<div class="bio">${profile.biography.map(paragraph=>`<p>${escape(paragraph)}</p>`).join('')}</div><h2>Research Interests</h2><ul class="research-list">${profile.interests.map(interest=>`<li>${escape(interest)}</li>`).join('')}</ul><div class="related-links"><a href="/publications/">My Publications</a><a href="/research/">Research</a><a href="/teaching/">Thesis Projects</a></div>`, 'Marco Becattini, PhD student in Smart Computing at the University of Florence. Software engineering for LLM-based multi-agent systems.'],
 publications: ['My Publications', `<p class="publication-intro">You can also browse my <a href="https://scholar.google.com/citations?user=0ibann4AAAAJ">Google Scholar profile</a>.</p><div class="publication-tools"><label for="publication-search">Filter <input id="publication-search" type="search" placeholder="Title, author, venue, year…" autocomplete="off"></label><output id="publication-count" aria-live="polite">${publications.length} publications</output><a href="/publications.bib" download>Download BibTeX</a></div><ul class="publication-list">${publications.map(paper).join('')}</ul><p id="no-results" class="empty-results" hidden>No publications match your search.</p><p class="scholarly-note">PDF links lead to publisher records, preprints, or author manuscripts. Copyright remains with the respective authors and rights holders.</p>`, 'Publications by Marco Becattini on LLM-based multi-agent systems, software architecture, reliability, and Digital Twin Networks.'],
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
