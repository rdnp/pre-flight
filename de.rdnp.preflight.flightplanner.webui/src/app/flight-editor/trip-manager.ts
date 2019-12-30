import { Flight, RouteSegment, TripSegment, Trip } from 'src/data.model';

export class TripManager {

    pointIds: string[];

    routeSegments: Map<string, RouteSegment>;

    trip: Trip;

    private emptySegment = {
        sourcePointId: '', targetPointId: '', trueCourse: -1, distance: -1, minimumSafeAltitude: -1,
        _links: undefined
    };

    constructor(flight: Flight, routeSegments: Map<string, RouteSegment>, trip: Trip) {
        this.pointIds = flight.pointIds;
        this.routeSegments = routeSegments;
        this.trip = trip;
        this.initializeAllTripSegments();
    }

    get points() {
        return this.pointIds;
    }

    initializeAllTripSegments() {
        // we need at least two points...
        if (this.pointIds.length > 1) {
            // iterate all points but the last one to load the legs starting from them
            for (let pointIndex = 0; pointIndex < this.pointIds.length - 1; pointIndex++) {
                this.trip.segments.push(new TripSegment());
            }
        }
    }

    findLoadedRouteSegment(fromPointId: string, toPointId: string) {
        return this.routeSegments.get(fromPointId + '\0' + toPointId);
    }

    findTripSegmentRouting(leg: TripSegment): RouteSegment {
        if (!leg) {
            return this.emptySegment;
        }
        let foundSegment = this.emptySegment;
        this.trip.segments.forEach(
            (value, index) => {
                if (value === leg || value === leg.parent) {
                    foundSegment = this.findLoadedRouteSegment(this.pointIds[index], this.pointIds[index + 1]);
                }
            }
        );
        return foundSegment;
    }

    findRelatedTripSegments(fromPointId: string, toPointId: string) {
        const result = [];
        this.trip.segments.forEach(
            (value, index) => {
                if (fromPointId === this.pointIds[index] && toPointId === this.pointIds[index + 1]) {
                    result.push(value);
                }
            });
        return result;
    }

    insertPoint(index: number) {
        const newPoints = new Array<string>(this.pointIds.length + 1);
        for (let i = 0; i < newPoints.length; i++) {
            if (i < index + 1) {
                newPoints[i] = this.pointIds[i];
            } else if (i === index + 1) {
                newPoints[i] = ''; // initialize new point with empty string
            } else {
                newPoints[i] = this.pointIds[i - 1];
            }
        }
        this.pointIds = newPoints;
        for (let i = newPoints.length - 2; i > index; i--) {
            this.trip.segments[i] = this.trip.segments[i - 1];
        }
        this.trip.segments[index] = new TripSegment();
    }

    removePoint(index: number) {
        const newPoints = new Array<string>(this.pointIds.length - 1);
        for (let i = 0; i < newPoints.length; i++) {
            if (i < index) {
                newPoints[i] = this.pointIds[i];
            } else {
                newPoints[i] = this.pointIds[i + 1];
                this.trip.segments[i - 1] = this.trip.segments[i];
            }
        }
        this.pointIds = newPoints;
        this.trip.segments.splice(newPoints.length - 1, 1);
    }

    findTripSegment(tripSegmentIndexInput: string) {
        let tripSegment: TripSegment;
        if (tripSegmentIndexInput.indexOf('.') < 0) {
            tripSegment = this.trip.segments[parseFloat(tripSegmentIndexInput)];
        } else {
            const childIndex = parseFloat(tripSegmentIndexInput.substring(tripSegmentIndexInput.indexOf('.') + 1));
            const parentIndex = parseFloat(tripSegmentIndexInput.substring(0, tripSegmentIndexInput.indexOf('.')));
            tripSegment = this.trip.segments[parentIndex].children[childIndex];
        }
        return tripSegment;
    }

}
