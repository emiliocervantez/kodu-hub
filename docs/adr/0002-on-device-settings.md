# Watches are configured on the tablet and stored in localStorage

Rather than a config file in the repo or URL parameters, Watches, Walk Times and the Weather Location are edited through an on-screen settings panel (gear icon) and saved in the browser's localStorage. This lets the household change what the dashboard tracks without a redeploy or editing the kiosk URL. The trade-off: settings live only on that one device and are lost if Fully Kiosk's app data is wiped, and the app needs a route/stop search UI.
