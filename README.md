# moodlecraft-assets

Static delivery assets for [moodlecraft](https://github.com/acaland/moodlecraft) rendered pages: `moodlecraft.js` and `moodlecraft.css`.

Served via jsDelivr's GitHub CDN mirror, e.g.:

```
https://cdn.jsdelivr.net/gh/acaland/moodlecraft-assets@main/moodlecraft.js?v=2
https://cdn.jsdelivr.net/gh/acaland/moodlecraft-assets@main/moodlecraft.css?v=2
```

Kept in a separate public repo so the private `moodlecraft` course-content repo doesn't need to be public for jsDelivr to serve these two files.

## Versioning / cache-busting

jsDelivr sends long-lived, aggressive `Cache-Control` headers even for `@main`
(branch) URLs. Purging jsDelivr's edge cache after a push (via
https://www.jsdelivr.com/tools/purge) does **not** help browsers that already
fetched and locally cached an older copy of the file with that exact URL --
they'll keep serving their own stale copy for up to a year regardless of what
the origin now has.

**Whenever `moodlecraft.js` or `moodlecraft.css` change, bump
`MOODLECRAFT_ASSETS_VERSION` in `moodlecraft/renderer.py`** (in the main
`moodlecraft` repo). That appends a new `?v=N` query string to the referenced
URLs, which every client -- CDN edge and browser alike -- treats as a brand
new resource, guaranteeing nobody serves a stale cached copy. After bumping
it, re-run `moodlecraft apply` to redeploy the updated reference to every page.
