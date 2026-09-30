# Building and Serving Locally

## Prerequisites

- Node.js 22 (the version CI uses)
- Yarn 4, provided by Corepack (bundled with Node). The exact Yarn version is pinned in `package.json` (`packageManager`); enable Corepack once per machine:

```sh
corepack enable
```

If that fails for lack of permissions (e.g. Node installed under `Program Files`), run it from an administrator shell, or prefix every command below with `corepack`, e.g. `corepack yarn install`.

## Install

```sh
yarn install
```

Dependencies are installed into `node_modules/` (`nodeLinker: node-modules` in `.yarnrc.yml`). CI uses `yarn install --immutable`, which fails if `yarn.lock` would change. TypeScript is held at 5.x because `vue-tsc` does not support TypeScript 7 yet.

## Develop

```sh
yarn dev
```

Open <http://localhost:5173/kodu-hub/>. The app is served under `/kodu-hub/` (Vite `base`, matching the GitHub Pages path), so the bare `http://localhost:5173/` does not show it. If port 5173 is already taken, Vite picks the next free one; use the `Local:` URL it prints.

To open the dev server from the tablet or another device on the same Wi-Fi:

```sh
yarn dev --host
```

Vite prints the LAN address to use (e.g. `http://192.168.1.20:5173/kodu-hub/`).

## Test

```sh
yarn test
```

Runs the Vitest unit tests (SIRI parsing, departure filtering and formatting, weather code labels).

## Build and Preview

```sh
yarn build
yarn preview
```

`build` type-checks with `vue-tsc` and writes the static site to `dist/`. `preview` serves `dist/` at <http://localhost:4173/kodu-hub/> — this is exactly what GitHub Pages will serve. Add `--host` to reach it from the tablet.

## Refresh the Stop Map

```sh
yarn stops
```

Regenerates `src/data/siriIds.json` (Tallinn stop code → SIRI stop id) from `https://transport.tallinn.ee/data/stops.txt`. The file is committed and CI refreshes it on every deploy, so run this locally only when stops have changed and you want the update in a commit.

## Troubleshooting

**`unable to verify the first certificate` / install hangs or reports a missing package version.** Antivirus software that scans HTTPS (e.g. Avast Web Shield) re-signs certificates with its own root, which Node does not trust by default. This affects Corepack, Yarn and `yarn stops`. Tell Node to use the operating system's certificate store:

```sh
# bash
export NODE_OPTIONS=--use-system-ca
```

```powershell
# PowerShell
$env:NODE_OPTIONS = '--use-system-ca'
```

Then re-run the command. This affects only the current shell.

**No departures shown at night.** Tallinn's SIRI feed returns no departures outside service hours; the row shows "нет рейсов". Check again during the day.
