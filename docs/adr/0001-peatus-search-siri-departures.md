# Peatus.ee for route/stop search, Tallinn SIRI for departures

The app is a static site with no proxy, so every data source must allow cross-origin browser requests. Tallinn's GTFS zip, `gps.txt` and `stops.txt` do not send CORS headers (and GTFS `stop_times.txt` is ≈17 MB unpacked), so they are out. Peatus.ee GraphQL and Tallinn's `siri-stop-departures.php` both send `Access-Control-Allow-Origin: *`. We use Peatus only to build a Watch (search route → direction → Boarding Stop) and SIRI for live departures, because SIRI is Tallinn's own real-time feed.

## Consequences

- Peatus stop ids (`estonia:<n>`) do **not** always equal SIRI stop ids (e.g. Puhkekodu tee is `estonia:157945` in Peatus, SIRI 5820). The link is the stop code (`18305-1`), mapped to a SIRI id via `stops.txt`. Since `stops.txt` has no CORS, a build-time script (`yarn stops`) bundles that map into the app; CI refreshes it on every deploy.
- Peatus labels trolleybuses as mode `BUS`; the vehicle kind is read from the route id (`tallinna-lin_bus_`, `_trol_`, `_tram_`).
- Two external sources to maintain; SIRI is an undocumented CSV that could change without notice. Peatus `stoptimesWithoutPatterns` is the fallback if it does.
- Coverage is limited to Tallinn city transport (SIRI covers only Tallinn stops).
- SIRI row format confirmed against live data (2026-10-04): `bus,10,83916,83916,Vana-Pääsküla,127,Z` — transport, route, expected and scheduled seconds since midnight, destination. A `stop,<id>` line follows the header.
- **To verify:** whether trams appear as `1` or `T1` (the parser accepts both).
