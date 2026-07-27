# moodlecraft-assets

Static delivery assets for [moodlecraft](https://github.com/acaland/moodlecraft) rendered pages: `moodlecraft.js` and `moodlecraft.css`.

Served via jsDelivr's GitHub CDN mirror, addressed by **git tag**, e.g.:

```
https://cdn.jsdelivr.net/gh/acaland/moodlecraft-assets@v1.0.0/moodlecraft.js
https://cdn.jsdelivr.net/gh/acaland/moodlecraft-assets@v1.0.0/moodlecraft.css
```

Kept in a separate public repo so the private `moodlecraft` course-content repo doesn't need to be public for jsDelivr to serve these two files.

## Versioning: always use a tag, never `@main`

`@main` (branch) references were tried first and turned out to be unreliable
on this repo: jsDelivr's package metadata (`data.jsdelivr.com/v1/packages/gh/...`)
showed zero indexed versions, and `@main` kept serving the very first commit's
content for a long time even after multiple explicit purges
(https://www.jsdelivr.com/tools/purge) and fresh, never-before-seen
cache-busting query strings -- i.e. the staleness was not just browser-side
HTTP caching but jsDelivr's own branch-resolution layer. A proper git **tag**
(`@vX.Y.Z`) is treated as an immutable release version and propagated to the
CDN edge correctly and quickly, with no separate purge step needed.

**Whenever `moodlecraft.js` or `moodlecraft.css` change:**

1. Commit and push the change to `main` as usual.
2. Create and push a new tag for the release, e.g.:
   ```
   git tag -a v1.1.0 -m "description of the change"
   git push origin v1.1.0
   ```
3. Update `MOODLECRAFT_ASSETS_TAG` in `moodlecraft/renderer.py` (in the main
   `moodlecraft` repo) to the new tag.
4. Re-run `moodlecraft apply` to redeploy the updated reference to every page.

Do not point `MOODLECRAFT_ASSETS_BASE` at `@main` again without re-verifying
this behavior -- confirm via `curl` (or `data.jsdelivr.com`) that the edge is
actually serving the new content before trusting it in production.
