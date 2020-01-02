import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightEditorComponent } from './flight-editor.component';
import { FlightService } from '../services/flight.service';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { RouteSegmentService } from '../services/route-segment.service';
import { TripComputerService } from '../services/trip-computer.service';
import { TripService } from '../services/trip.service';
import { Trip, TripSegment, RouteSegment } from 'src/data.model';

class MockFlightService extends FlightService {

  getFlightByName(name: string) {
    const testFlight = JSON.parse(
      '{ "name": "Trip to Berlin","aircraftType": "C172", "origin": "EDTQ","destination": "EDDB","alternate": "EDDT", "pointIds": ' +
      '[ "EDTQ", "EDDB" ] }');
    testFlight._links =
      JSON.parse('{"self" : {"href" : "http://localhost:8080/flights/4"}, "flight" : { "href" : "http://localhost:8080/flights/4" } }');
    return of(testFlight);
  }

  saveFlight() {
    const result = null;
    return of(result);
  }
}

class MockActivatedRoute extends ActivatedRoute {
  constructor() {
    super();
    this.params = of({ name: 'Trip to Berlin' });
  }
}


describe('FlightEditorComponent', () => {
  let component: FlightEditorComponent;
  let fixture: ComponentFixture<FlightEditorComponent>;

  function defaultRouteSegment(from: string, to: string): RouteSegment {
    return {
      sourcePointId: from,
      targetPointId: to,
      minimumSafeAltitude: 3300,
      trueCourse: 120,
      distance: 20,
      _links: undefined
    };
  }

  function defaultRouteSegmentObservable(from: string, to: string) {
    return of(defaultRouteSegment(from, to));
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlightEditorComponent],
      imports: [HttpClientModule, RouterModule.forRoot([
        { path: '**', component: FlightEditorComponent }])],
      providers: [{ provide: FlightService, useClass: MockFlightService },
      { provide: ActivatedRoute, useClass: MockActivatedRoute }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load its flight data', async () => {
    await fixture.whenStable();
    expect(component.flight).toBeTruthy();
    expect(component.flight.name).toBe('Trip to Berlin');
    expect(component.flight.destination).toBe('EDDB');
    expect(component.routeSegments.size).toBe(1);
    expect(component.selectedTrip.segments.length).toBe(1);
    expect(component.selectedTrip.flightId).toBeUndefined();
    expect(component.tripList.length).toBe(1);
  });

  it('should load associated trip data when loading a flight', async () => {
    const tripService = TestBed.get(TripService);
    const fakeTrips = [];
    fakeTrips.push(new Trip('4', '', '', '', '', [], undefined));
    fakeTrips.push(new Trip('4', '', '', '', '', [], undefined));
    spyOn(tripService, 'findAllTripsForFlight').and.returnValue(of(fakeTrips));
    await fixture.whenStable();

    component.ngOnInit();
    await fixture.whenStable();

    expect(component.tripList.length).toBe(3);
    expect(component.selectedTrip.flightId).toBeUndefined();
    expect(component.tripList[1].flightId).toBe('4');
    expect(component.tripList[2].flightId).toBe('4');
  });

  it('should assign the selected trip when it changes', async () => {
    const fakeTrips = [];
    fakeTrips.push(new Trip('1', '', '', '', '', [], undefined));
    fakeTrips.push(new Trip('2', '', '', '', '', [], undefined));
    fakeTrips.push(new Trip('3', '', '', '', '', [], undefined));
    component.tripList = fakeTrips;

    component.selectTrip('0');
    expect(component.selectedTrip.flightId).toBe('1');
    component.selectTrip('2');
    expect(component.selectedTrip.flightId).toBe('3');
  });

  it('should create a flight through FlightService on saving', async () => {
    await fixture.whenStable();
    const flightService = fixture.debugElement.injector.get(FlightService);
    const createSpy = spyOn(flightService, 'saveFlight').and.callThrough();

    component.save();

    expect(createSpy).toHaveBeenCalled();
  });

  it('should reject a flight being saved with no name', async () => {
    await fixture.whenStable();
    const flightService = fixture.debugElement.injector.get(FlightService);
    component.flight.name = '';
    const createSpy = spyOn(flightService, 'saveFlight').and.callThrough();

    component.save();
    component.flight.name = undefined;
    component.save();

    expect(createSpy).toHaveBeenCalledTimes(0);
  });

  it('should save route segments from a flight on saving the flight', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    const saveRouteSpy = spyOn(routeSegmentService, 'saveRouteSegment').and.returnValue(of({}));
    spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);

    // now insert point between start and dest
    component.insertPoint(0);
    component.flight.pointIds[1] = 'ENR-1';
    expect(component.flight.pointIds.length).toBe(3);
    expect(component.flight.pointIds[0]).toBe('EDTQ');
    expect(component.flight.pointIds[1]).toBe('ENR-1');
    expect(component.flight.pointIds[2]).toBe('EDDB');

    // now save the flight
    component.save();
    await fixture.whenStable();

    // flight has two route segments to be saved
    expect(saveRouteSpy).toHaveBeenCalledTimes(2);
  });

  it('should save trips from a flight on saving the flight', async () => {
    await fixture.whenStable();
    const tripService = fixture.debugElement.injector.get(TripService);
    const createTripSpy = spyOn(tripService, 'createTrip').and.returnValue(of({}));
    const updateTripSpy = spyOn(tripService, 'updateTrip').and.returnValue(of({}));
    const deleteTripSpy = spyOn(tripService, 'deleteTrip').and.returnValue(of({}));
    spyOn(tripService, 'findAllTripsForFlight').and.returnValue(of({}));

    // set trips
    const fakeTrips = [];
    // trip to do nothing with (as it is empty)
    fakeTrips.push(new Trip(undefined, '', '', '', '', [], undefined));
    // trip to create newly (undefined flight)
    fakeTrips.push(new Trip(undefined, '2018-03-15', '12:23', 'DESAE', 'C172', [new TripSegment()], undefined));
    // trip to update
    fakeTrips.push(new Trip('4', '', '', '', '', [], undefined));
    // trip to delete
    const deletedTrip = new Trip('4', '', '', '', '', [], undefined);
    deletedTrip.deleted = true;
    fakeTrips.push(deletedTrip);
    component.tripList = fakeTrips;

    // now save the flight
    component.save();

    // flight has one trip to be updated, one trip to be newly created, one trip to be deleted and one trip to do nothing with
    expect(createTripSpy).toHaveBeenCalledTimes(1);
    expect(updateTripSpy).toHaveBeenCalledTimes(1);
    expect(deleteTripSpy).toHaveBeenCalledTimes(1);
  });

  it('should reload trips into the tripList after saving the flight', async () => {
    await fixture.whenStable();
    const tripService = fixture.debugElement.injector.get(TripService);
    spyOn(tripService, 'createTrip').and.returnValue(of({}));
    spyOn(tripService, 'updateTrip').and.returnValue(of({}));
    spyOn(tripService, 'deleteTrip').and.returnValue(of({}));
    const fakeTrips = [];
    fakeTrips.push(new Trip('1', '2018-03-14', '', '', '', [], undefined));
    fakeTrips.push(new Trip('2', '2018-03-15', '12:23', 'DESAE', 'C172', [new TripSegment()], undefined));
    fakeTrips.push(new Trip('3', '2018-03-16', '', '', '', [], undefined));
    component.tripList = fakeTrips;
    spyOn(tripService, 'findAllTripsForFlight').and.returnValue(of(fakeTrips));

    // now save the flight
    component.save();

    // check content of selector has been updated as newly created trip must now be in
    await fixture.whenStable();
    expect(component.tripList.length).toBe(4);
    expect(component.tripList[0].flightId).toBe(undefined); // default for new trip
    expect(component.tripList[1].dateOfFlight).toBe('2018-03-14'); // first in fakeTrips
    expect(component.tripList[2].dateOfFlight).toBe('2018-03-15');
    expect(component.tripList[3].dateOfFlight).toBe('2018-03-16');
  });

  it('should load all route segments between points of a flight', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);

    component.loadMissingRouteSegments();
    await fixture.whenStable();
    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB')).toBeTruthy();

    // now insert point between start and dest
    component.insertPoint(0);
    component.flight.pointIds[1] = 'ENR-1';
    expect(component.flight.pointIds.length).toBe(3);
    expect(component.flight.pointIds[0]).toBe('EDTQ');
    expect(component.flight.pointIds[1]).toBe('ENR-1');
    expect(component.flight.pointIds[2]).toBe('EDDB');

    component.loadMissingRouteSegments();
    await fixture.whenStable();
    expect(component.findLoadedRouteSegment('EDTQ', 'ENR-1')).toBeTruthy();
    expect(component.findLoadedRouteSegment('ENR-1', 'EDDB')).toBeTruthy();
  });

  it('should get route segment for points from route segment service', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    const findRouteSegmentSpy = spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);

    component.loadRouteSegment('START', 'DEST');
    expect(findRouteSegmentSpy).toHaveBeenCalled();

    await fixture.whenStable();
    expect(component.findLoadedRouteSegment('START', 'DEST')).toBeTruthy();
  });

  it('should update route segments on point insertion', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);
    expect(component.selectedTrip.segments.length).toBe(1);

    // now insert point between start and dest
    component.insertPoint(0);
    component.setPointId(1, 'ENR-1');
    await fixture.whenStable();

    // quick-check
    expect(component.flight.pointIds.length).toBe(3);
    // investigate points
    expect(component.flight.pointIds[0]).toBe('EDTQ');
    expect(component.flight.pointIds[1]).toBe('ENR-1');
    expect(component.flight.pointIds[2]).toBe('EDDB');
    // investigate route-segments
    expect(component.findLoadedRouteSegment('EDTQ', 'ENR-1').sourcePointId).toBe('EDTQ');
    expect(component.findLoadedRouteSegment('EDTQ', 'ENR-1').targetPointId).toBe('ENR-1');
    expect(component.findLoadedRouteSegment('ENR-1', 'EDDB').sourcePointId).toBe('ENR-1');
    expect(component.findLoadedRouteSegment('ENR-1', 'EDDB').targetPointId).toBe('EDDB');
  });

  it('should update route segments on point removal', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);

    // now insert point between start and dest
    component.insertPoint(0);
    component.flight.pointIds[1] = 'ENR-1';
    expect(component.flight.pointIds.length).toBe(3);

    // now remove point ENR-1
    component.removePoint(1);

    // quick-check
    expect(component.flight.pointIds.length).toBe(2);
    expect(component.selectedTrip.segments.length).toBe(1);
    // investigate points
    expect(component.flight.pointIds[0]).toBe('EDTQ');
    expect(component.flight.pointIds[1]).toBe('EDDB');
    // investigate trip-segments
    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').sourcePointId).toBe('EDTQ');
    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').targetPointId).toBe('EDDB');
  });

  it('should assign valid input to a route segment', async () => {
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    const tripComputerService = fixture.debugElement.injector.get(TripComputerService);
    spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);
    component.loadMissingRouteSegments();
    await fixture.whenStable();
    const magneticCourseUpdate = spyOn(tripComputerService, 'updateMagneticCourse');
    const timeUpdate = spyOn(tripComputerService, 'updateTime');

    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').distance).toBe(20);
    component.setDistance('EDTQ', 'EDDB', '5');
    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').distance).toBe(5);
    expect(timeUpdate).toHaveBeenCalledTimes(1);

    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').minimumSafeAltitude).toBe(3300);
    component.setMinimumSafeAltitude('EDTQ', 'EDDB', '5000');
    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').minimumSafeAltitude).toBe(5000);

    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').trueCourse).toBe(120);
    component.setTrueCourse('EDTQ', 'EDDB', '140');
    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').trueCourse).toBe(140);
    expect(magneticCourseUpdate).toHaveBeenCalledTimes(1);
  });

  it('should reject invalid input for a route segment', async () => {
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    const tripComputerService = fixture.debugElement.injector.get(TripComputerService);
    spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);
    component.loadMissingRouteSegments();
    await fixture.whenStable();
    const magneticCourseUpdate = spyOn(tripComputerService, 'updateMagneticCourse');
    const timeUpdate = spyOn(tripComputerService, 'updateTime');

    component.setDistance('EDTQ', 'EDDB', '-3'); // negative, not allowed
    component.setDistance('EDTQ', 'EDDB', '25000'); // more than earth circumference, not allowed
    component.setDistance('EDTQ', 'KJFK', '50'); // non-existing route sgement, not allowed
    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').distance).toBe(20);

    component.setMinimumSafeAltitude('EDTQ', 'EDDB', '-5000'); // negative and below -2000, not allowed
    component.setMinimumSafeAltitude('EDTQ', 'EDDB', '101000'); // more than 100,000ft, not allowed
    component.setMinimumSafeAltitude('EDTQ', 'KJFK', '5000'); // non-existing route sgement, not allowed
    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').minimumSafeAltitude).toBe(3300);

    component.setTrueCourse('EDTQ', 'EDDB', '-9'); // negative, not allowed
    component.setTrueCourse('EDTQ', 'EDDB', '400'); // more than 360°, not allowed
    component.setTrueCourse('EDTQ', 'KJFK', '320'); // non-existing route sgement, not allowed
    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').trueCourse).toBe(120);

    expect(timeUpdate).toHaveBeenCalledTimes(0); // no additional updates
    expect(magneticCourseUpdate).toHaveBeenCalledTimes(0); // no additional updates
    expect(component.findLoadedRouteSegment('EDTQ', 'KJFK')).toBeFalsy(); // check non-existing route sgement
  });

  it('should assign valid input to the trip segment it has been given for', async () => {
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    const tripComputerService = fixture.debugElement.injector.get(TripComputerService);
    spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);
    component.loadMissingRouteSegments();
    await fixture.whenStable();
    const magneticCourseUpdate = spyOn(tripComputerService, 'updateMagneticCourse');
    const magneticHeadingUpdate = spyOn(tripComputerService, 'updateMagneticHeading');
    const fuelUpdate = spyOn(tripComputerService, 'updateFuel');

    expect(component.selectedTrip.segments.length).toBe(1);

    component.setVariation('0', '2');
    component.setFuelConsumptionRate('0', '9');
    component.setWindVector('0', '250', '10');
    component.setTrueAirspeed('0', '100');
    component.setAltitude('0', '3000');

    expect(magneticCourseUpdate).toHaveBeenCalledTimes(1);
    expect(fuelUpdate).toHaveBeenCalledTimes(1);
    expect(magneticHeadingUpdate).toHaveBeenCalledTimes(2);

    expect(component.selectedTrip.segments[0].altitude).toBe(3000);
    expect(component.selectedTrip.segments[0].trueAirspeed).toBe(100);
    expect(component.selectedTrip.segments[0].windDirection).toBe(250);
    expect(component.selectedTrip.segments[0].windSpeed).toBe(10);
    expect(component.selectedTrip.segments[0].hourlyFuelConsumptionRate).toBe(9);
    expect(component.selectedTrip.segments[0].variation).toBe(2);

    expect(component.selectedTrip.segments[0].children.length).toBe(0);
    component.setTime('0', '2');
    expect(component.selectedTrip.segments[0].children.length).toBe(1);
  });

  it('should assign valid input to all selected segments', async () => {
    // set up test with three tripSegments
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);
    component.flight.pointIds = ['EDTQ', 'LBU', 'DKB', 'EDTY'];
    component.loadTripList();
    component.loadMissingRouteSegments();
    component.selectTrip('0');
    await fixture.whenStable();
    // select one trip segment where input should be flown to
    component.selectedTripSegments.set('2', true);

    // update unselected trip segment
    component.setVariation('0', '2');
    component.setFuelConsumptionRate('0', '9');
    component.setWindVector('0', '250', '10');
    component.setTrueAirspeed('0', '100');
    component.setAltitude('0', '3000');

    // check values of both selected and unselected trip segment
    expect(component.selectedTrip.segments[0].altitude).toBe(3000);
    expect(component.selectedTrip.segments[0].trueAirspeed).toBe(100);
    expect(component.selectedTrip.segments[0].windDirection).toBe(250);
    expect(component.selectedTrip.segments[0].windSpeed).toBe(10);
    expect(component.selectedTrip.segments[0].hourlyFuelConsumptionRate).toBe(9);
    expect(component.selectedTrip.segments[0].variation).toBe(2);

    expect(component.selectedTrip.segments[2].altitude).toBe(3000);
    expect(component.selectedTrip.segments[2].trueAirspeed).toBe(100);
    expect(component.selectedTrip.segments[2].windDirection).toBe(250);
    expect(component.selectedTrip.segments[2].windSpeed).toBe(10);
    expect(component.selectedTrip.segments[2].hourlyFuelConsumptionRate).toBe(9);
    expect(component.selectedTrip.segments[2].variation).toBe(2);

    // check non-updated trip-segment has retained its state
    expect(component.selectedTrip.segments[1].altitude).toBe(0);
    expect(component.selectedTrip.segments[1].trueAirspeed).toBe(1);
    expect(component.selectedTrip.segments[1].windDirection).toBe(0);
    expect(component.selectedTrip.segments[1].windSpeed).toBe(0);
    expect(component.selectedTrip.segments[1].hourlyFuelConsumptionRate).toBe(0);
    expect(component.selectedTrip.segments[1].variation).toBe(0);
  });

  it('should reject invalid values for a trip segment update', async () => {
    // set up test with three tripSegments
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);

    // update trip segment
    component.setVariation('0', '-200');
    component.setFuelConsumptionRate('0', '0');
    component.setWindVector('0', '370', '10');
    component.setWindVector('0', '320', '-1');
    component.setTrueAirspeed('0', '-1');
    component.setAltitude('0', 'abc');
    component.setTime('0', '-1');

    // check trip-segment has retained its state
    expect(component.selectedTrip.segments[0].altitude).toBe(0);
    expect(component.selectedTrip.segments[0].trueAirspeed).toBe(1);
    expect(component.selectedTrip.segments[0].windDirection).toBe(0);
    expect(component.selectedTrip.segments[0].windSpeed).toBe(0);
    expect(component.selectedTrip.segments[0].hourlyFuelConsumptionRate).toBe(0);
    expect(component.selectedTrip.segments[0].variation).toBe(0);
    expect(component.selectedTrip.segments[0].timeInMinutes).toBe(-60);
  });

  it('should get the proper distance for a time-limited trip segment', async () => {
    await fixture.whenStable();
    component.selectedTrip.segments[0].groundSpeed = 120;
    component.selectedTrip.segments[0].timeInMinutes = 5;
    expect(component.getTimeLimitedTripSegmentDistance('0')).toBe(10);
  });
});
