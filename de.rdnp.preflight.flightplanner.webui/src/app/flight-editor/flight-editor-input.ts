import { RouteSegment, Flight, Trip } from 'src/data.model';

export class FlightEditorInput {

    constructor(private internalFlight: Flight, private internalTrips: Trip[], private internalRouteSegments: Map<string, RouteSegment>) {

    }

    get flight() {
        return this.internalFlight;
    }

    get trips() {
        return this.internalTrips;
    }

    get routeSegments() {
        return this.internalRouteSegments;
    }
}
