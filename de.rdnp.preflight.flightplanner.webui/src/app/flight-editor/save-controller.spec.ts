import { SaveController } from './save-controller';
import { FlightEditorInput } from './flight-editor-input';
import { Flight, FlightLinks, Trip, RouteSegment, TripLinks, TripSegment } from 'src/data.model';
import { async, TestBed } from '@angular/core/testing';
import { FlightService } from '../services/flight.service';
import { TripService } from '../services/trip.service';
import { RouteSegmentService } from '../services/route-segment.service';
import { TripManager } from './trip-manager';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

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

    function createChangedNameTestFlight() {
        const links: FlightLinks = { flight: { href: 'http://test.flight/2' }, self: { href: 'http://test.flight/2' } };
        const testFlight = new Flight('Test Flight With New Name', 'EDTQ', 'EDTY', 'EDDS', ['EDTQ', 'LBU', 'DKB', 'EDTY', 'EDDS'],
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
        if (children !== undefined) {
            result.children.forEach((child) => { child.parent = result; });
        }
        return result;
    }

    function tripSegment(trueAirspeed: number) {
        return tripSegmentWithChildren(trueAirspeed, undefined);
    }

    function createModifiedExistingTestTrips() {
        const tripOneLinks: TripLinks = { trip: { href: 'http://test.trip/1' }, self: { href: 'http://test.trip/1' } };
        const tripOneSegments: TripSegment[] =
            [tripSegment(76), tripSegmentWithChildren(117, [childTripSegment(76, 4)]), tripSegment(117), tripSegment(117)];
        const tripTwoSegments: TripSegment[] = [tripSegment(76), tripSegment(117), tripSegment(117), tripSegment(117)];
        const tripTwoLinks: TripLinks = { trip: { href: 'http://test.trip/2' }, self: { href: 'http://test.trip/2' } };
        const tripThreeSegments: TripSegment[] =
            [tripSegment(80), tripSegmentWithChildren(119, [childTripSegment(80, 4)]), tripSegment(119), tripSegment(119)];
        const tripThreeLinks: TripLinks = { trip: { href: 'http://test.trip/3' }, self: { href: 'http://test.trip/3' } };
        const result = [new Trip('1', '29-12-2019', '12:00', 'DESAE', 'C172', tripOneSegments, tripOneLinks),
        new Trip('1', '29-12-2019', '12:00', 'DESAE', 'C172', tripTwoSegments, tripTwoLinks),
        new Trip('1', '29-12-2019', '12:00', 'DESAE', 'C172', tripThreeSegments, tripThreeLinks),
        new Trip(undefined, '', '', '', '', [new TripSegment(), new TripSegment(), new TripSegment()], undefined)];
        result[1].deleted = true;
        return result;
    }

    function createModifiedCreateNewTestTrips() {
        const tripOneLinks: TripLinks = { trip: { href: 'http://test.trip/1' }, self: { href: 'http://test.trip/1' } };
        const tripOneSegments: TripSegment[] =
            [tripSegment(76), tripSegmentWithChildren(117, [childTripSegment(76, 4)]), tripSegment(117), tripSegment(117)];
        const tripTwoSegments: TripSegment[] = [tripSegment(76), tripSegment(117), tripSegment(117), tripSegment(117)];
        const tripThreeSegments: TripSegment[] =
            [tripSegment(80), tripSegmentWithChildren(119, [childTripSegment(80, 4)]), tripSegment(119), tripSegment(119)];
        const tripThreeLinks: TripLinks = { trip: { href: 'http://test.trip/3' }, self: { href: 'http://test.trip/3' } };
        const result = [new Trip('1', '29-12-2019', '12:00', 'DESAE', 'C172', tripOneSegments, tripOneLinks),
        new Trip('1', '29-12-2019', '12:00', 'DESAE', 'C172', tripThreeSegments, tripThreeLinks),
        new Trip(undefined, '29-12-2019', '12:00', 'DESAE', 'C172', tripTwoSegments, undefined)];
        return result;
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
        return new FlightEditorInput(createDefaultTestFlight(), createModifiedExistingTestTrips(), createDefaultTestRouteSegments());
    }

    function createNewTripTestInput(): FlightEditorInput {
        return new FlightEditorInput(createDefaultTestFlight(), createModifiedCreateNewTestTrips(), createDefaultTestRouteSegments());
    }

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
        });
    }));

    it('should save flight data of an already existing flight with existing trips modified',
        async () => {
            const flightService = TestBed.get(FlightService);
            const tripService = TestBed.get(TripService);
            const routeSegmentService = TestBed.get(RouteSegmentService);

            const flightServiceSaveSpy = spyOn(flightService, 'saveFlight').and.returnValue(of({}));
            const flightServiceLoadSpy = spyOn(flightService, 'getFlightByName').and.returnValue(of(createDefaultTestFlight()));
            const tripServiceCreateSpy = spyOn(tripService, 'createTrip').and.returnValue(of({}));
            const tripServiceUpdateSpy = spyOn(tripService, 'updateTrip').and.returnValue(of({}));
            const tripServiceDeleteSpy = spyOn(tripService, 'deleteTrip').and.returnValue(of({}));
            const routeSegmentServiceSaveSpy = spyOn(routeSegmentService, 'saveRouteSegment').and.returnValue(of({}));
            const routeSegmentServiceFindSpy = spyOn(routeSegmentService, 'findRouteSegment').and.returnValue(of({}));

            const save = new SaveController(createDefaultTestInput(), new TripManager(createDefaultTestFlight(),
                createDefaultTestRouteSegments(), createModifiedExistingTestTrips()[0]),
                flightService, tripService, routeSegmentService);

            save.createSaveAction().subscribe(() => {
                expect(flightServiceSaveSpy).toHaveBeenCalledTimes(1);
                expect(flightServiceLoadSpy).toHaveBeenCalledTimes(1);
                expect(tripServiceCreateSpy).toHaveBeenCalledTimes(0);
                expect(tripServiceUpdateSpy).toHaveBeenCalledTimes(2);
                expect(tripServiceDeleteSpy).toHaveBeenCalledTimes(1);
                expect(routeSegmentServiceSaveSpy).toHaveBeenCalledTimes(4);
                expect(routeSegmentServiceFindSpy).toHaveBeenCalledTimes(0);
            });
        });

    it('should save flight data of an already existing flight with new trip created',
        async () => {
            const flightService = TestBed.get(FlightService);
            const tripService = TestBed.get(TripService);
            const routeSegmentService = TestBed.get(RouteSegmentService);

            const flightServiceSaveSpy = spyOn(flightService, 'saveFlight').and.returnValue(of({}));
            const flightServiceLoadSpy = spyOn(flightService, 'getFlightByName').and.returnValue(of(createDefaultTestFlight()));
            const tripServiceCreateSpy = spyOn(tripService, 'createTrip').and.returnValue(of({}));
            const tripServiceUpdateSpy = spyOn(tripService, 'updateTrip').and.returnValue(of({}));
            const tripServiceDeleteSpy = spyOn(tripService, 'deleteTrip').and.returnValue(of({}));
            const routeSegmentServiceSaveSpy = spyOn(routeSegmentService, 'saveRouteSegment').and.returnValue(of({}));
            const routeSegmentServiceFindSpy = spyOn(routeSegmentService, 'findRouteSegment').and.returnValue(of({}));

            const save = new SaveController(createNewTripTestInput(), new TripManager(createDefaultTestFlight(),
                createDefaultTestRouteSegments(), createModifiedCreateNewTestTrips()[0]),
                flightService, tripService, routeSegmentService);

            save.createSaveAction().subscribe(() => {
                expect(flightServiceSaveSpy).toHaveBeenCalledTimes(1);
                expect(flightServiceLoadSpy).toHaveBeenCalledTimes(1);
                expect(tripServiceCreateSpy).toHaveBeenCalledTimes(1);
                expect(tripServiceUpdateSpy).toHaveBeenCalledTimes(2);
                expect(tripServiceDeleteSpy).toHaveBeenCalledTimes(0);
                expect(routeSegmentServiceSaveSpy).toHaveBeenCalledTimes(4);
                expect(routeSegmentServiceFindSpy).toHaveBeenCalledTimes(0);
            });
        });

    it('should save a flight under a new name, replicating its trip data',
        async () => {
            const flightService = TestBed.get(FlightService);
            const tripService = TestBed.get(TripService);
            const routeSegmentService = TestBed.get(RouteSegmentService);

            const flightServiceSaveSpy = spyOn(flightService, 'saveFlight').and.returnValue(of({}));
            const flightServiceLoadSpy = spyOn(flightService, 'getFlightByName').and.returnValue(of(
                createChangedNameTestFlight()
            ));
            const tripServiceCreateSpy = spyOn(tripService, 'createTrip').and.returnValue(of({}));
            const tripServiceUpdateSpy = spyOn(tripService, 'updateTrip').and.returnValue(of({}));
            const tripServiceDeleteSpy = spyOn(tripService, 'deleteTrip').and.returnValue(of({}));
            const routeSegmentServiceSaveSpy = spyOn(routeSegmentService, 'saveRouteSegment').and.returnValue(of({}));
            const routeSegmentServiceFindSpy = spyOn(routeSegmentService, 'findRouteSegment').and.returnValue(of({}));

            const save = new SaveController(createDefaultTestInput(), new TripManager(createDefaultTestFlight(),
                createDefaultTestRouteSegments(), createModifiedExistingTestTrips()[0]),
                flightService, tripService, routeSegmentService);

            save.createSaveAction().subscribe(() => {
                expect(flightServiceSaveSpy).toHaveBeenCalledTimes(1);
                expect(flightServiceLoadSpy).toHaveBeenCalledTimes(1);
                expect(tripServiceCreateSpy).toHaveBeenCalledTimes(3);
                expect(tripServiceUpdateSpy).toHaveBeenCalledTimes(0);
                expect(tripServiceDeleteSpy).toHaveBeenCalledTimes(0);
                expect(routeSegmentServiceSaveSpy).toHaveBeenCalledTimes(4);
                expect(routeSegmentServiceFindSpy).toHaveBeenCalledTimes(0);
            });
        });

});
