# Marco Becattini — Academic Website

Personal academic website: [marcobecattini.github.io](https://marcobecattini.github.io/).

The site presents research, publications, thesis projects, talks, and academic activities. It is written in English, with an original layout inspired by the classic academic style of [Roberto Verdecchia’s website](https://robertoverdecchia.github.io/).

## Edit and build

Requirements: Node.js 22 or later. No dependency installation or external API is required.

```bash
npm run build
npm run preview
```

The local preview runs at `http://127.0.0.1:5180`. To update the website:

1. Edit `data/profile.json` or `data/publications.json`.
2. Run `npm run build`.
3. Commit the source changes and regenerated `docs/` directory, then push to `main`.

GitHub Pages publishes the `docs/` directory from `main`. `.nojekyll` preserves the prebuilt HTML, CSS, fonts, and JavaScript. Search, collapsible abstracts, and BibTeX copying run entirely in the visitor’s browser. Each page also has its own static URL.

## Sources and scholarly records

The publication catalogue was checked against the author’s Google Scholar profile and existing bibliographic records on 9 November 2026. Twelve works are included. Accepted manuscripts and preprints retain explicit status information; final metadata is not invented where unverified. The BibTeX download is generated from the same data as the website.

PDFs are linked to their existing publisher, preprint, or author-hosted location. They are not rehosted in this repository. Rights remain with their respective holders.

## Assets

See [ASSETS.md](ASSETS.md) for image provenance, the banner-generation prompt, and font licences.
