import { TripManager } from './trip-manager';
import { Flight, RouteSegment, TripSegment, Trip } from 'src/data.model';

describe('TripManager', () => {

  const defaultFlight: Flight = JSON.parse(
    '{ "name": "Trip to Berlin","aircraftType": "C172", "origin": "EDTQ","destination": "EDDB","alternate": "EDDT", "pointIds": ' +
    '[ "EDTQ", "EDDB" ] }');

  function createRouteSegment(from: string, to: string) {
    return {
      sourcePointId: from,
      targetPointId: to,
      minimumSafeAltitude: 3300,
      trueCourse: 120,
      distance: 20,
      _links: undefined
    };
  }

  function createDefaultRoute(): Map<string, RouteSegment> {
    const result = new Map();
    result.set('EDTQ\0EDDB', createRouteSegment('EDTQ', 'EDDB'));
    return result;
  }

  function createDefaultTrip(): Trip {
    const result = new Trip(undefined, '', '', '', '', [], undefined);
    return result;
  }

  let defaultRoute: Map<string, RouteSegment>;
  let defaultTrip: Trip;
  let manager: TripManager;

  beforeEach(() => {
    defaultRoute = createDefaultRoute();
    defaultTrip = createDefaultTrip();
    manager = new TripManager(defaultFlight, defaultRoute, defaultTrip);
  });

  it('should get the right route segment for a trip segment', async () => {
    expect(manager.findTripSegmentRouting(defaultTrip.segments[0]).sourcePointId).toBe('EDTQ');
    expect(manager.findTripSegmentRouting(defaultTrip.segments[0]).targetPointId).toBe('EDDB');

    // cross-check: non existing segment
    expect(manager.findTripSegmentRouting(defaultTrip.segments[100]).sourcePointId).toBe('');
    expect(manager.findTripSegmentRouting(defaultTrip.segments[100]).targetPointId).toBe('');
  });

  it('should get the parent route segment for a child trip segment', async () => {
    const child = new TripSegment();
    defaultTrip.segments[0].children.push(child);
    child.parent = defaultTrip.segments[0];
    expect(manager.findTripSegmentRouting(child).sourcePointId).toBe('EDTQ');
    expect(manager.findTripSegmentRouting(child).targetPointId).toBe('EDDB');
  });

  it('should get the right trip segments related to a route segment', async () => {
    expect(manager.findRelatedTripSegments('EDTQ', 'EDDB').length).toBe(1);

    // cross-check: non existing segment
    expect(manager.findRelatedTripSegments('EDTQ', 'EDTY').length).toBe(0);
  });

  it('should insert points (and its corresponding tripSegments) into a flight at the right positions', async () => {
    // insert point between start and dest
    manager.insertPoint(0);
    manager.pointIds[1] = 'ENR-1';
    // simulate route segment update
    defaultRoute.set('EDTQ\0ENR-1', createRouteSegment('EDTQ', 'ENR-1'));
    defaultRoute.set('ENR-1\0EDDB', createRouteSegment('ENR-1', 'EDDB'));

    // quick-check
    expect(manager.pointIds.length).toBe(3);
    expect(manager.trip.segments.length).toBe(2);
    // investigate points
    expect(manager.pointIds[0]).toBe('EDTQ');
    expect(manager.pointIds[1]).toBe('ENR-1');
    expect(manager.pointIds[2]).toBe('EDDB');
    // investigate trip-segments
    expect(manager.findTripSegmentRouting(manager.trip.segments[0]).sourcePointId).toBe('EDTQ');
    expect(manager.findTripSegmentRouting(manager.trip.segments[0]).targetPointId).toBe('ENR-1');
    expect(manager.findTripSegmentRouting(manager.trip.segments[1]).sourcePointId).toBe('ENR-1');
    expect(manager.findTripSegmentRouting(manager.trip.segments[1]).targetPointId).toBe('EDDB');

    // now insert point between ENR-1 and dest
    manager.insertPoint(1);
    manager.pointIds[2] = 'ENR-2';
    // simulate route segment update
    defaultRoute.set('ENR-1\0ENR-2', createRouteSegment('ENR-1', 'ENR-2'));
    defaultRoute.set('ENR-2\0EDDB', createRouteSegment('ENR-2', 'EDDB'));

    // quick-check
    expect(manager.pointIds.length).toBe(4);
    expect(manager.trip.segments.length).toBe(3);
    // investigate points
    expect(manager.pointIds[0]).toBe('EDTQ');
    expect(manager.pointIds[1]).toBe('ENR-1');
    expect(manager.pointIds[2]).toBe('ENR-2');
    expect(manager.pointIds[3]).toBe('EDDB');
    // investigate trip-segments
    expect(manager.findTripSegmentRouting(manager.trip.segments[0]).sourcePointId).toBe('EDTQ');
    expect(manager.findTripSegmentRouting(manager.trip.segments[0]).targetPointId).toBe('ENR-1');
    expect(manager.findTripSegmentRouting(manager.trip.segments[1]).sourcePointId).toBe('ENR-1');
    expect(manager.findTripSegmentRouting(manager.trip.segments[1]).targetPointId).toBe('ENR-2');
    expect(manager.findTripSegmentRouting(manager.trip.segments[2]).sourcePointId).toBe('ENR-2');
    expect(manager.findTripSegmentRouting(manager.trip.segments[2]).targetPointId).toBe('EDDB');
  });

  it('should remove a point (and its corresponding tripSegment) from a flight', async () => {
    // insert point between start and dest
    manager.insertPoint(0);
    manager.pointIds[1] = 'ENR-1';

    expect(manager.pointIds.length).toBe(3);
    expect(manager.trip.segments.length).toBe(2);
    expect(manager.pointIds[0]).toBe('EDTQ');
    expect(manager.pointIds[1]).toBe('ENR-1');
    expect(manager.pointIds[2]).toBe('EDDB');

    // now remove point ENR-1
    manager.removePoint(1);

    // quick-check
    expect(manager.pointIds.length).toBe(2);
    expect(manager.trip.segments.length).toBe(1);
    // investigate points
    expect(manager.pointIds[0]).toBe('EDTQ');
    expect(manager.pointIds[1]).toBe('EDDB');
    // investigate trip-segments
    expect(manager.findTripSegmentRouting(manager.trip.segments[0]).sourcePointId).toBe('EDTQ');
    expect(manager.findTripSegmentRouting(manager.trip.segments[0]).targetPointId).toBe('EDDB');
  });

  it('should find a trip segment based on its index', async () => {
    // find default trip segment
    const tripSegment = manager.findTripSegment('0');
    expect(tripSegment).toBe(defaultTrip.segments[0]);

    // insert a child trip segment and find that as well
    const child = new TripSegment();
    tripSegment.children.push(child);
    expect(manager.findTripSegment('0.0')).toBe(child);
  });

});
