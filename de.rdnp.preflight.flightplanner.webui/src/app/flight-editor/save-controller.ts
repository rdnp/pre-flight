import { FlightEditorInput } from './flight-editor-input';
import { Observable, forkJoin, of } from 'rxjs';
import { TripService } from '../services/trip.service';
import { RouteSegmentService } from '../services/route-segment.service';
import { FlightService } from '../services/flight.service';
import { TripManager } from './trip-manager';
import { concatMap } from 'rxjs/operators';

export class SaveController {

    constructor(
        private input: FlightEditorInput, private tripManager: TripManager,
        private flightService: FlightService, private tripService: TripService, private routeSegmentService: RouteSegmentService) {
    }

    private saveTrips() {
        const replies: Observable<object>[] = [];
        const flightId = this.input.flight._links.flight.href.substr(this.input.flight._links.flight.href.lastIndexOf('/') + 1);
        for (const trip of this.input.trips) {
            if (parseFloat(trip.flightId) === parseFloat(flightId)) {
                if (trip.deleted) {
                    replies.push(this.tripService.deleteTrip(trip));
                } else {
                    replies.push(this.tripService.updateTrip(trip));
                }
            } else if (!this.tripService.isEmptyTrip(trip)) {
                trip.flightId = flightId;
                replies.push(this.tripService.createTrip(trip));
            }
        }
        return replies;
    }

    private doCreateSaveAction() {
        const flightName = this.input.flight.name;
        return this.flightService.saveFlight(this.input.flight).pipe(concatMap(() => {
            return this.flightService.getFlightByName(flightName).pipe(concatMap((reloadedFlight) => {
                this.input.flight._links = reloadedFlight._links;
                // save only those route segments that this flight defines
                for (let i = 0; i < this.input.flight.pointIds.length - 1; i++) {
                    this.routeSegmentService.saveRouteSegment(
                        this.tripManager.findLoadedRouteSegment(this.input.flight.pointIds[i],
                            this.input.flight.pointIds[i + 1])).subscribe();
                }
                return forkJoin(this.saveTrips());
            }));
        }));
    }

    createSaveAction(): Observable<object> {
        if (!this.input.flight.name) {
            alert('Flight must have a name to be saved. Please enter a name.');
            return of({});
        }
        if (this.input.flight.name.length === 0) {
            alert('Flight cannot be saved with empty name. Please enter a name.');
            return of({});
        }
        return this.doCreateSaveAction();
    }
}
