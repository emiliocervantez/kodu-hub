# KoduHub

KoduHub is a lightweight home information dashboard designed for an always-on, wall-mounted Android tablet in a hallway.

The dashboard provides at-a-glance information needed before leaving home:

- Current date and time
- Local Tallinn weather
- Upcoming Tallinn public transport departures for up to six watched routes

The UI is in Russian. Domain terms (Watch, Boarding Stop, Walk Time, …) are defined in [CONTEXT.md](CONTEXT.md); key decisions are recorded in [docs/adr](docs/adr).

## Target Device

KoduHub is intended to run on an inexpensive Android tablet, typically:

- 8–11" display
- LCD/IPS panel preferred over OLED for long-term static content
- Wi-Fi connectivity
- Permanently or semi-permanently wall mounted
- Continuous USB-C power
- Landscape orientation

The tablet can run **Fully Kiosk Browser** to provide a dedicated kiosk experience, including:

- Full-screen web application
- Automatic application/page launch after reboot
- Screen wake/sleep scheduling
- Automatic page reload
- Optional motion-based screen wake
- Hiding normal Android/browser UI

## Frontend

The application is a static web application built with:

- Vue 3
- TypeScript
- Vite
- PrimeVue 4 (Aura theme) for the settings panel
- HTML/CSS
- Browser Fetch API
- Vitest (unit tests for parsing, filtering and formatting logic)

The UI is designed specifically for readability from approximately 1–2 meters away, using large typography and a minimal layout.

No native Android application is required.

## Watches and Settings

A **Watch** is one route, in one direction, boarded at one stop, for example bus 17 towards Balti jaam from Kaubamaja.

- Up to 6 Watches, shown as one row each.
- Each Watch has its own **Walk Time** (minutes from the door to the stop).
- Each row shows the next 3 departures that are at least Walk Time away, as "N мин", or as clock time when more than 60 minutes away.
- Tapping a row opens the full timetable for that route at that stop: workdays and weekends (Saturday and Sunday shown separately when they differ), from Peatus.ee.
- Tapping the clock opens a month calendar with Estonian public holidays marked.
- The search icon (next to the settings gear) opens the same timetable for any route, direction and stop, without adding a Watch.

Watches, Walk Times, the weather location and the light/dark theme (chosen manually, or switched automatically at set times of day) are edited in an on-screen settings panel opened via a gear icon, and stored in the browser's `localStorage` on the tablet. A Watch is created by picking a route first, then its direction, then the boarding stop.

Only Tallinn city buses, trams and trolleybuses are supported.

## Public Transport Data

All sources are queried directly from the browser; both send permissive CORS headers and need no API key.

### Peatus.ee API (route and stop search)

`https://api.peatus.ee/routing/v1/routers/estonia/index/graphql`

Used by the settings panel to find routes, their directions and stops. Peatus stop ids don't always match SIRI stop ids, so stops are linked by their stop code through a map generated from Tallinn's `stops.txt` at build time (`yarn stops` → `src/data/siriIds.json`).

### Tallinn SIRI Stop Departures (live departures)

`https://transport.tallinn.ee/siri-stop-departures.php?stopid=<n>`

Returns a small CSV of upcoming departures at a stop with expected and scheduled times. Refreshed every 30 seconds; minutes-until counts down locally in between.

## Weather

Weather comes from **Open-Meteo** (no API key, CORS-enabled) and is refreshed every 15 minutes for the configured location (default: Tallinn centre).

The dashboard shows:

- Temperature and "feels like"
- Current conditions (icon and Russian label)
- Temperature and precipitation for each of the next 12 hours
- Tapping the weather row opens a 7-day forecast (condition, high/low, rain chance and amount)

## Stale Data

If a panel fails to refresh twice in a row, it stays visible but is dimmed and shows how old its data is ("обновлено N мин назад").

## Hosting

The app is deployed as a completely static site using **GitHub Pages**.

Architecture:

GitHub repository  
→ GitHub Actions  
→ Vite production build  
→ GitHub Pages  
→ Android tablet running Fully Kiosk Browser

Deployment happens automatically after each push to the repository. See [docs/DEPLOY.md](docs/DEPLOY.md) for setup and troubleshooting, and [docs/BUILD.md](docs/BUILD.md) for building and serving locally.

For a project repository hosted under GitHub Pages, Vite's `base` configuration should correspond to the repository path:

```ts
export default defineConfig({
  base: '/kodu-hub/',
})
```

The application therefore requires no continuously running application server.

## Intended Architecture

```text
Android tablet
      ↓
Fully Kiosk Browser
      ↓
Vue 3 + TypeScript + Vite (GitHub Pages)
      ↓
Peatus.ee GraphQL   (settings: route/stop search)
Tallinn SIRI        (live departures)
Open-Meteo          (weather)
```

The goal is to keep the system inexpensive, maintenance-free, responsive, and readable at a glance while using free hosting and public transport data whenever possible.

## Future Options

Not part of v1; kept for reference.

- **Tallinn GTFS** (`https://transport.tallinn.ee/data/gtfs.zip`): full timetable. It has no CORS headers and `stop_times.txt` is ≈17 MB unpacked, so it would need build-time preprocessing or a proxy.
- **Tallinn vehicle GPS** (`https://transport.tallinn.ee/gps.txt`): live vehicle positions. It has no CORS headers.
- **Cloudflare Pages + Functions**: a lightweight `/api/...` proxy if a needed source lacks CORS, or if backend logic becomes useful.
- **PWA / service worker**: cache assets and the last responses so the dashboard survives a reboot during a Wi-Fi outage.
- **Regional buses / Elron trains**: would need Peatus departures in addition to SIRI.
