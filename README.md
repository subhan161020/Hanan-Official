# Hanan-Official

Official HANAN website — the shop customers buy abayas from.

## What this repo is

A single self-contained page plus its media. `index.html` carries all the
markup, styles and JavaScript, including the product catalogue; the other
files are the story film and the three Thoughtful details illustrations.
There is no build step and no dependencies to install.

Routing is hash-based (`#/shop`, `#/about`, …), so every page is served by
`index.html` and the host never sees a path it has to resolve.

## Deploying

Hosted on Cloudflare Workers static assets, the same as the pre-launch site.
`wrangler.jsonc` publishes the repo root, minus what `.assetsignore` excludes,
so all six files ship as one deployment.

**A deployment only contains the files uploaded with it.** If the three
`.webp` illustrations or `hanan-story.mp4` are left out, the page still loads
but Thoughtful details shows broken images and the film reports
"Video unavailable".

### Option A — connect the repo to Cloudflare (what pre-launch does)

One-time setup: in the Cloudflare dashboard, create a Worker from a Git
repository, pick `subhan161020/Hanan-Official`, and set the production branch
to `main`. Cloudflare then redeploys on every push to `main`.

This is a separate repo from the pre-launch site, so it needs its own
connection and gets its own Worker — connecting one does not affect the other.

### Option B — deploy by hand

```sh
npx wrangler login      # once, per machine
npx wrangler deploy
```

Run it from the repo root so `wrangler.jsonc` is picked up.

### Branches

Work lands on `Dev`, then `Dev` → `main` by pull request. `main` is what goes
live, so nothing is published until that second merge.

## Before this takes real money

The site currently deploys to its own `workers.dev` URL, not the live domain,
and that is deliberate: **checkout, bag and log-in are demo only.** Nothing
here takes payment yet. Connect a payment provider and test a real order end
to end before pointing a customer-facing domain at this Worker.

The full list is in the build notes — open `index.html` from your own machine
(or localhost) and the "Build notes" tab appears bottom-right. It is hidden
automatically on the live site.

## Gotchas

- `hanan-story.mp4` is 19.75 MiB against Cloudflare's 25 MiB per-file limit.
  If the film is ever re-exported at higher quality, check the size before
  pushing — over the cap, the deployment fails rather than degrades.
- `.assetsignore` keeps `README.md` and `wrangler.jsonc` off the public site.
  Anything new added to the repo root **is** served unless listed there.
