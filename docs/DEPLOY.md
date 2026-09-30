# Deploying to GitHub Pages

KoduHub is a static site. A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds it and publishes it to GitHub Pages on every push to `master`. No server is involved.

For this repository the site will be served at:

<https://emiliocervantez.github.io/kodu-hub/>

## How It Works

On each push to `master` the workflow:

1. Installs dependencies with `yarn install --immutable` (fails if `yarn.lock` is out of date).
2. Refreshes the stop code → SIRI id map (`yarn stops`); if Tallinn's server is unreachable it keeps the committed map.
3. Runs the unit tests (`yarn test`) — a failing test stops the deploy.
4. Builds the site (`yarn build`) into `dist/`.
5. Uploads `dist/` and publishes it to Pages.

It can also be started by hand: **Actions → Deploy to GitHub Pages → Run workflow**.

## One-Time Setup

1. **Enable Pages with Actions as the source.** On GitHub open the repository → **Settings → Pages** → under **Build and deployment**, set **Source** to **GitHub Actions**. (Not "Deploy from a branch" — the workflow does the publishing.)
2. **Check the base path.** Vite's `base` in `vite.config.ts` must match the repository name, because project sites are served from `/<repo-name>/`:

   ```ts
   base: '/kodu-hub/',
   ```

   If the repository is ever renamed, change `base` to match, otherwise the page loads blank (all asset URLs 404).

## Deploy

Work currently lives on the `v1-dashboard` branch; Pages only deploys from `master`.

**Via pull request (recommended):**

```sh
git push origin v1-dashboard
gh pr create --base master --head v1-dashboard --title "KoduHub v1"
gh pr merge --merge
```

**Or merge locally:**

```sh
git checkout master
git merge v1-dashboard
git push origin master
```

Either way, the push to `master` starts the workflow.

## Verify

1. Open **Actions** on GitHub and watch the **Deploy to GitHub Pages** run. Both jobs (`build`, `deploy`) should turn green, usually within 1–2 minutes.
2. The `deploy` job shows the published URL. Open <https://emiliocervantez.github.io/kodu-hub/>.
3. Check that the clock, weather and settings (⚙) work, then add a route in settings.

After later pushes, the tablet picks up the new version on its next page reload.

## Point the Tablet at It

In **Fully Kiosk Browser → Settings → Web Content Settings → Start URL**, enter:

```text
https://emiliocervantez.github.io/kodu-hub/
```

Settings (routes, walk times, theme) are stored in the tablet browser's local storage for that address, so they survive redeploys but must be set up on the tablet itself.

## Troubleshooting

**Deploy job fails with "Branch … is not allowed to deploy to github-pages".** The `github-pages` environment only accepts the default branch. Deploy from `master` (merge first), or add the branch under **Settings → Environments → github-pages → Deployment branches**.

**Blank page, browser console shows 404s for `/assets/…`.** `base` in `vite.config.ts` doesn't match the repository name. Fix it, commit, push.

**`yarn install --immutable` fails in CI.** `yarn.lock` is out of date. Run `yarn install` locally, commit the updated `yarn.lock`, push.

**Workflow didn't start.** It only runs on pushes to `master` (or a manual run). Check the branch you pushed to, and that Actions are enabled under **Settings → Actions → General**.

**Tablet still shows the old version.** Reload the page in Fully Kiosk (or wait for its scheduled auto-reload). GitHub Pages can cache for up to 10 minutes.

## Custom Domain (Optional)

To serve from your own domain (e.g. `kodu.example.ee`):

1. **Settings → Pages → Custom domain**: enter the domain and save; enable **Enforce HTTPS** once the certificate is issued.
2. At your DNS provider add a `CNAME` record pointing the domain to `emiliocervantez.github.io`.
3. Change `base` in `vite.config.ts` to `'/'` — the site is then served from the domain root.
4. Commit, push, and update the Fully Kiosk start URL.

Note: local storage is per address, so settings saved under the old `github.io` URL do not carry over — re-enter them on the tablet.
