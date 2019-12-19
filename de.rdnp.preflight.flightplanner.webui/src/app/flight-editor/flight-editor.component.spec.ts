import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightEditorComponent } from './flight-editor.component';
import { FlightService } from '../services/flight.service';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { RouteSegmentService } from '../services/route-segment.service';
import { TripComputerService } from '../services/trip-computer.service';

class MockFlightService extends FlightService {

  getFlights() {
    const result = JSON.parse(
      '{"_embedded": {"flights": ' +
      '[{ "name": "Trip to Düsseldorf","aircraftType": "C172", "origin": "EDTQ","destination": "EDDL","alternate": "EDDK"  }' +
      ',{ "name": "Trip to Berlin","aircraftType": "C172", "origin": "EDTQ","destination": "EDDB","alternate": "EDDT" }]}}');
    return of(result);
  }

  getFlightByName(name: string) {
    return of(JSON.parse(
      '{ "name": "Trip to Berlin","aircraftType": "C172", "origin": "EDTQ","destination": "EDDB","alternate": "EDDT", "pointIds": ' +
      '[ "EDTQ", "EDDB" ] }'));
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlightEditorComponent],
      imports: [HttpClientModule, RouterModule.forRoot([
        { path: '**', component: FlightEditorComponent }])],
      providers: [{ provide: FlightService, useClass: MockFlightService },
      { provide: ActivatedRoute, useClass: MockActivatedRoute }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load flight data from mock service', async () => {
    await fixture.whenStable();
    expect(fixture.componentInstance.flight).toBeTruthy();
    expect(fixture.componentInstance.flight.name).toBe('Trip to Berlin');
    expect(fixture.componentInstance.flight.destination).toBe('EDDB');
    expect(fixture.componentInstance.routeSegments.size).toBe(1);
    expect(fixture.componentInstance.tripSegments.size).toBe(1);
  });

  it('should create a flight through FlightService on saving', async () => {
    await fixture.whenStable();
    const flightService = fixture.debugElement.injector.get(FlightService);
    const createSpy = spyOn(flightService, 'saveFlight').and.callThrough();

    component.save();

    expect(createSpy).toHaveBeenCalled();
  });

  function defaultRouteSegmentObservable(from: string, to: string) {
    return of({
      sourcePointId: from,
      targetPointId: to,
      minimumSafeAltitude: 3300,
      trueCourse: 120,
      distance: 20,
      _links: undefined
    });
  }



  it('should save route segments from a flight on saving the flight', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    const saveSpy = spyOn(routeSegmentService, 'saveRouteSegment').and.returnValue(of({}));
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

    // flight has two route segments to be saved
    expect(saveSpy).toHaveBeenCalledTimes(2);
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

  it('should save route segment for points to route segment service', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    const saveRouteSegmentSpy = spyOn(routeSegmentService, 'saveRouteSegment').and.returnValue(null);

    component.saveRouteSegment('START', 'DEST');

    expect(saveRouteSegmentSpy).toHaveBeenCalled();
  });

  it('should update route segments on point insertion', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);
    expect(component.tripSegments.size).toBe(1);

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
    expect(component.tripSegments.size).toBe(2);
    expect(component.flight.pointIds[0]).toBe('EDTQ');
    expect(component.flight.pointIds[1]).toBe('ENR-1');
    expect(component.flight.pointIds[2]).toBe('EDDB');

    // now remove point ENR-1
    component.removePoint(1);

    // quick-check
    expect(component.flight.pointIds.length).toBe(2);
    expect(component.tripSegments.size).toBe(1);
    // investigate points
    expect(component.flight.pointIds[0]).toBe('EDTQ');
    expect(component.flight.pointIds[1]).toBe('EDDB');
    // investigate trip-segments
    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').sourcePointId).toBe('EDTQ');
    expect(component.findLoadedRouteSegment('EDTQ', 'EDDB').targetPointId).toBe('EDDB');
  });

  it('should set/assign the proper values for a route segment update', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    const tripComputerService = fixture.debugElement.injector.get(TripComputerService);
    spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);
    const magneticCourseUpdate = spyOn(tripComputerService, 'updateMagneticCourse');

    component.setPointId(0, 'START');
    component.setPointId(1, 'DEST');
    await fixture.whenStable();

    expect(component.findLoadedRouteSegment('START', 'DEST').distance).toBe(20);
    component.setDistance('START', 'DEST', '5');
    expect(component.findLoadedRouteSegment('START', 'DEST').distance).toBe(5);

    expect(component.findLoadedRouteSegment('START', 'DEST').minimumSafeAltitude).toBe(3300);
    component.setMinimumSafeAltitude('START', 'DEST', '5000');
    expect(component.findLoadedRouteSegment('START', 'DEST').minimumSafeAltitude).toBe(5000);

    expect(component.findLoadedRouteSegment('START', 'DEST').trueCourse).toBe(120);
    component.setTrueCourse('START', 'DEST', '140');
    expect(component.findLoadedRouteSegment('START', 'DEST').trueCourse).toBe(140);

    // error values
    component.setDistance('START', 'DEST', '-3'); // negative, not allowed
    component.setDistance('START', 'DEST', '25000'); // more than earth circumference, not allowed
    component.setDistance('START', 'DEST2', '50'); // non-existing route sgement, not allowed
    expect(component.findLoadedRouteSegment('START', 'DEST').distance).toBe(5);

    component.setMinimumSafeAltitude('START', 'DEST', '-5000'); // negative and below -2000, not allowed
    component.setMinimumSafeAltitude('START', 'DEST', '101000'); // more than 100,000ft, not allowed
    component.setMinimumSafeAltitude('START', 'DEST2', '5000'); // non-existing route sgement, not allowed
    expect(component.findLoadedRouteSegment('START', 'DEST').minimumSafeAltitude).toBe(5000);

    component.setTrueCourse('START', 'DEST', '-9'); // negative, not allowed
    component.setTrueCourse('START', 'DEST', '400'); // more than 360°, not allowed
    component.setTrueCourse('START', 'DEST2', '320'); // non-existing route sgement, not allowed
    expect(component.findLoadedRouteSegment('START', 'DEST').trueCourse).toBe(140);

    expect(magneticCourseUpdate).toHaveBeenCalledTimes(3);
    expect(component.findLoadedRouteSegment('START', 'DEST2')).toBeFalsy();
  });

  it('should set/assign the proper values for a trip segment update', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    const tripComputerService = fixture.debugElement.injector.get(TripComputerService);
    spyOn(routeSegmentService, 'findRouteSegment').and.callFake(defaultRouteSegmentObservable);
    const magneticCourseUpdate = spyOn(tripComputerService, 'updateMagneticCourse');
    const magneticHeadingUpdate = spyOn(tripComputerService, 'updateMagneticHeading');
    const fuelUpdate = spyOn(tripComputerService, 'updateFuel');

    component.setPointId(0, 'START');
    component.setPointId(1, 'DEST');
    await fixture.whenStable();

    expect(component.tripSegments.size).toBe(1);

    component.setVariation('0', '2');
    component.setFuelConsumptionRate('0', '9');
    component.setWindVector('0', '250', '10');
    component.setTrueAirspeed('0', '100');
    component.setAltitude('0', '3000');

    expect(magneticCourseUpdate).toHaveBeenCalledTimes(3);
    expect(fuelUpdate).toHaveBeenCalledTimes(1);
    expect(magneticHeadingUpdate).toHaveBeenCalledTimes(2);

    expect(component.tripSegments.get(0).altitude).toBe(3000);
    expect(component.tripSegments.get(0).trueAirspeed).toBe(100);
    expect(component.tripSegments.get(0).windDirection).toBe(250);
    expect(component.tripSegments.get(0).windSpeed).toBe(10);
    expect(component.tripSegments.get(0).fuelConsumptionRate).toBe(9);
    expect(component.tripSegments.get(0).variation).toBe(2);

    expect(component.tripSegments.get(0).children.length).toBe(0);
    component.setTime('0', '2');
    expect(component.tripSegments.get(0).children.length).toBe(1);
  });
});
