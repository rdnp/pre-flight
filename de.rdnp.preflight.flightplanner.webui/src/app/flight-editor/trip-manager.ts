import { Flight, RouteSegment, TripSegment } from 'src/data.model';

export class TripManager {

    pointIds: string[];

    routeSegments: Map<string, RouteSegment>;

    tripSegments: Map<number, TripSegment>;

    private emptySegment = {
        sourcePointId: '', targetPointId: '', trueCourse: -1, distance: -1, minimumSafeAltitude: -1,
        _links: undefined
    };

    constructor(flight: Flight, routeSegments: Map<string, RouteSegment>, tripSegments: Map<number, TripSegment>) {
        this.pointIds = flight.pointIds;
        this.routeSegments = routeSegments;
        this.tripSegments = tripSegments;
        this.initializeAllTripSegments();
    }

    initializeAllTripSegments() {
        // we need at least two points...
        if (this.pointIds.length > 1) {
            // iterate all points but the last one to load the legs starting from them
            for (let pointIndex = 0; pointIndex < this.pointIds.length - 1; pointIndex++) {
                this.tripSegments.set(pointIndex, new TripSegment());
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
        this.tripSegments.forEach(
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
        this.tripSegments.forEach(
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
            this.tripSegments.set(i, this.tripSegments.get(i - 1));
        }
        this.tripSegments.set(index, new TripSegment());
    }

    removePoint(index: number) {
        const newPoints = new Array<string>(this.pointIds.length - 1);
        for (let i = 0; i < newPoints.length; i++) {
            if (i < index) {
                newPoints[i] = this.pointIds[i];
            } else {
                newPoints[i] = this.pointIds[i + 1];
                this.tripSegments.set(i - 1, this.tripSegments.get(i));
            }
        }
        this.pointIds = newPoints;
        this.tripSegments.delete(newPoints.length - 1);
    }

    findTripSegment(tripSegmentIndexInput: string) {
        let tripSegment: TripSegment;
        if (tripSegmentIndexInput.indexOf('.') < 0) {
            tripSegment = this.tripSegments.get(parseFloat(tripSegmentIndexInput));
        } else {
            const childIndex = parseFloat(tripSegmentIndexInput.substring(tripSegmentIndexInput.indexOf('.') + 1));
            const parentIndex = parseFloat(tripSegmentIndexInput.substring(0, tripSegmentIndexInput.indexOf('.')));
            tripSegment = this.tripSegments.get(parentIndex).children[childIndex];
        }
        return tripSegment;
    }

}
