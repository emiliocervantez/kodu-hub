# KoduHub

A hallway wall dashboard that answers "can I leave now, and what's it like outside?" for a Tallinn household.

## Language

### Transport

**Watch**:
One route, travelling in one direction, boarded at one stop, that the household wants to track. The dashboard shows one row per Watch; at most four exist.
_Avoid_: Favourite, subscription, watched stop

**Route**:
A numbered Tallinn city bus, tram or trolleybus line (e.g. bus 17).
_Avoid_: Line, number

**Direction**:
Which way along a Route the vehicle travels, named by its final destination.
_Avoid_: Headsign, variant

**Boarding Stop**:
The specific platform where the household gets on for a Watch. Stops sharing a name but serving opposite directions are different Boarding Stops.
_Avoid_: Station, platform, stop (unqualified)

**Walk Time**:
Minutes it takes to get from the front door to a Watch's Boarding Stop. Set per Watch.
_Avoid_: Buffer, offset

**Departure**:
A vehicle's expected time of leaving the Boarding Stop for a Watch's Route and Direction.
_Avoid_: Arrival, trip, schedule entry

**Reachable Departure**:
A Departure that is at least Walk Time away from now. Only Reachable Departures are shown (the next three).
_Avoid_: Catchable, valid departure

### Weather

**Weather Location**:
The point whose weather is shown; defaults to Tallinn centre.
_Avoid_: City, home location

### Display

**Stale**:
The state of a panel whose data could not be refreshed on the last two attempts; it stays visible but is marked with its age.
_Avoid_: Offline, expired, cached
