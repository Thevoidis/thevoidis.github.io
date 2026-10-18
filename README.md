# thevoidis.github.io

A personal library — essays, short stories, AI-made songs and web novels,
all released into the public domain (CC0). Built with [Hugo](https://gohugo.io/),
deployed to GitHub Pages by the workflow in `.github/workflows/hugo.yaml`.

No trackers, no comments, no accounts. Fonts are self-hosted, so the site
makes zero third-party requests.

## Quick start

```sh
hugo server -D   # local preview at http://localhost:1313
hugo --gc        # production build into ./public
```

`hugo.toml` is the only config file Hugo reads — do not add a `config.toml`
next to it; Hugo will ignore it silently.

## How to publish things

Everything is "drop a file and it appears" — the home page, nav counters,
search index and RSS feeds all derive from `content/` and `static/` at
build time.

### Blog posts
Add `content/blogs/<Title>.md`:

```md
---
title : My post
date : 2026-01-01T12:00:00+05:30
tags : ['philosophy','life']
draft : false
---

Body text...
```

- `tags` lowercase, and tag a post — the topics page and "Keep reading"
  related-posts both run on tags.
- `draft : true` hides it from the live site (show it locally with `hugo server -D`).

### Stories
Drop a folder into `static/stories/<Story Name>/` containing:
`<Story Name>.md` (the source of truth), optionally `<Story Name>.pdf`
and a `description.txt`. The stories table fills itself in, and Hugo
builds a themed reading page at `/stories/<story-name>/` from the
markdown at build time (`content/stories/_content.gotmpl` + 
`layouts/stories/single.html`) — there is no hand-made `.html` to keep
in sync. The raw `.md`/`.pdf` stay served as downloads.

(A `.html` file in the folder is no longer used; the reading page is
always derived from the markdown, so it keeps the site's theme.)

(Alternative: a single `content/stories/<slug>.md` file also renders a
story page, but the static-folder approach is the one in use.)

### Songs
Drop a folder into `static/songs/<Track Name>/` containing:
`<Track Name>.mp3`, a video (`<Track Name>.webm`/`.mp4`), subtitles
(`.vtt`/`.srt`) and `1.png` for the poster, plus `description.txt`.
When several takes exist, the take whose filename matches the folder name
is the one that gets paired.

### Web novels
`content/webnovels/<Novel Name>/_index.md` (description) plus one
`ch-NNNNN.md` per chapter. Chapters sort by filename, so keep the
zero-padded numbering. A novel with no published chapters shows as
"In progress".

### Comics
Drop a folder into `static/comics/<Comic Name>/` containing the page
images (`.webp`/`.png`/`.jpg`) plus a small `comic.json` with the
metadata:

```json
{
  "title": "My Comic",
  "author": "you",
  "description": "One line about it.",
  "direction": "ltr",
  "cover": "ch0001.webp"
}
```

There is **no page list to maintain**. At build time Hugo rebuilds
`/comics/<slug>/manifest.json` from the images actually in the folder, so
the embedded Comic Viewer always loads every image. Add or delete images
freely; the reader page and the page count on `/comics/` follow. (The
served `manifest.json` is generated — edit `comic.json`, not it.)

## Search

The `/search/` page builds its index at build time (no backend, no
third-party search service). `static/js/flexsearch.min.js` is the only
search dependency and is served from the site itself.

## PWA

`static/manifest.json` + `static/sw.js` (registered in production only).
The service worker caches same-origin HTML, CSS, JS, fonts and images for
offline re-reads; audio/video are intentionally left to the network.

## House rules

- Don't commit `public/` (it's gitignored; CI builds it with the real
  `baseURL`, so a locally built copy always has wrong links).
- Don't commit `resources/_gen/`, `.hugo_build.lock`, or editor temp files.
- Keep `assets/style.css` the single stylesheet — it is minified, hashed
  and cached forever, so a new hash busts the cache.
