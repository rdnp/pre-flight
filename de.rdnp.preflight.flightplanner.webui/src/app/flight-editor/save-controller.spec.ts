import { SaveController } from './save-controller';
import { FlightEditorInput } from './flight-editor-input';
import { Flight, FlightLinks, Trip, RouteSegment, TripLinks, TripSegment } from 'src/data.model';

describe('SaveController', () => {

    /*
     * Note. Below approach for test data creation could be re-used for other tests as well
     */

    function createDefaultTestFlight() {
        const links: FlightLinks = { flight: { href: 'http://test.flight/1' }, self: { href: 'http://test.flight/1' } };
        const testFlight = new Flight('Test Flight', 'EDTQ', 'EDTY', 'EDDS', ['EDTQ', 'LBU', 'DKB', 'EDTY', 'EDDS'],
            links);
        return testFlight;
    }

    function childTripSegment(trueAirspeed: number, time: number) {
        const result = new TripSegment();
        result.trueAirspeed = trueAirspeed;
        result.timeInMinutes = time;
        return result;
    }

    function tripSegmentWithChildren(trueAirspeed: number, children: TripSegment[]) {
        const result = new TripSegment();
        result.trueAirspeed = trueAirspeed;
        result.variation = -2;
        result.hourlyFuelConsumptionRate = 12;
        result.children = children;
        result.children.forEach((child) => { child.parent = result; });
        return result;
    }

    function tripSegment(trueAirspeed: number) {
        return tripSegmentWithChildren(trueAirspeed, undefined);
    }

    function createDefaultTestTrips() {
        const testTrips: Trip[] = new Trip[2]();
        const tripOneLinks: TripLinks = { trip: { href: 'http://test.trip/1' }, self: { href: 'http://test.trip/1' } };
        const tripOneSegments: TripSegment[] =
            [tripSegment(76), tripSegmentWithChildren(117, [childTripSegment(76, 4)]), tripSegment(117), tripSegment(117)];
        testTrips[0] = new Trip('1', '29-12-2019', '12:00', 'DESAE', 'C172', tripOneSegments, tripOneLinks);
        const tripTwoSegments: TripSegment[] = [tripSegment(76), tripSegment(117), tripSegment(117), tripSegment(117)];
        const tripTwoLinks: TripLinks = { trip: { href: 'http://test.trip/1' }, self: { href: 'http://test.trip/2' } };
        testTrips[1] = new Trip('1', '29-12-2019', '12:00', 'DESAE', 'C172', tripTwoSegments, tripTwoLinks);
        return testTrips;
    }

    function createDefaultTestRouteSegments() {
        const testRouteSegments: Map<string, RouteSegment> = new Map();
        testRouteSegments.set('EDTQ\0LBU', {
            sourcePointId: 'EDTQ', targetPointId: 'LBU',
            minimumSafeAltitude: 3200, distance: 5, trueCourse: 57,
            _links: { 'route-segment': { href: 'http://test.route-segment/1' }, self: { href: 'http://test.route-segment/1' } }
        });
        testRouteSegments.set('LBU\0DKB', {
            sourcePointId: 'LBU', targetPointId: 'DKB',
            minimumSafeAltitude: 5000, distance: 17, trueCourse: 69,
            _links: { 'route-segment': { href: 'http://test.route-segment/2' }, self: { href: 'http://test.route-segment/2' } }
        });
        return testRouteSegments;
    }

    function createDefaultTestInput(): FlightEditorInput {
        return new FlightEditorInput(createDefaultTestFlight(), createDefaultTestTrips(), createDefaultTestRouteSegments());
    }

    it('should save flight data of an already existing flight', () => {
        // const save = new SaveController(createDefaultTestInput());
        // save.save();
        // TODO assert, based on current test cases for flight-editor.component.spec.ts
    });

    it('should save flight data of a renamed flight under the new name', () => {
        // const save = new SaveController(createDefaultTestInput());
        // save.save();
        // TODO assert
    });

    // TODO additional test cases for other cases of flights as needed

});
