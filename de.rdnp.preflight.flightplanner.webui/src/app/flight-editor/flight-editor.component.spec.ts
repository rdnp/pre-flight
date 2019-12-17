import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightEditorComponent } from './flight-editor.component';
import { FlightService } from '../services/flight.service';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { RouteSegmentService } from '../services/route-segment.service';

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
      '{ "name": "Trip to Berlin","aircraftType": "C172", "origin": "EDTQ","destination": "EDDB","alternate": "EDDT", "pointIds": [] }'));
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
  });

  it('should create a flight through FlightService on saving', async () => {
    await fixture.whenStable();
    const flightService = fixture.debugElement.injector.get(FlightService);
    const createSpy = spyOn(flightService, 'saveFlight').and.callThrough();

    component.save();

    expect(createSpy).toHaveBeenCalled();
  });

  it('should insert points into a flight at the right positions', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    spyOn(routeSegmentService, 'findRouteSegment').and.returnValue(of({
      sourcePointId: '',
      targetPointId: '',
      minimumSafeAltitude: -1,
      trueCourse: -1,
      distance: -1,
      _links: undefined
    }));

    // begin inserting two points for start and destination
    component.insertPoint(0);
    component.insertPoint(0);
    expect(component.flight.pointIds.length).toBe(2);
    component.flight.pointIds[0] = 'START';
    component.flight.pointIds[1] = 'DEST';

    // now insert point between start and dest
    component.insertPoint(0);
    component.flight.pointIds[1] = 'ENR-1';
    expect(component.flight.pointIds.length).toBe(3);
    expect(component.flight.pointIds[0]).toBe('START');
    expect(component.flight.pointIds[1]).toBe('ENR-1');
    expect(component.flight.pointIds[2]).toBe('DEST');

    // now insert point between ENR-1 and dest
    component.insertPoint(1);
    component.flight.pointIds[2] = 'ENR-2';
    expect(component.flight.pointIds.length).toBe(4);
    expect(component.flight.pointIds[0]).toBe('START');
    expect(component.flight.pointIds[1]).toBe('ENR-1');
    expect(component.flight.pointIds[2]).toBe('ENR-2');
    expect(component.flight.pointIds[3]).toBe('DEST');
  });

  it('should insert points into a flight at the right positions', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    spyOn(routeSegmentService, 'findRouteSegment').and.returnValue(of({
      sourcePointId: '',
      targetPointId: '',
      minimumSafeAltitude: -1,
      trueCourse: -1,
      distance: -1,
      _links: undefined
    }));

    // begin inserting two points for start and destination
    component.insertPoint(0);
    component.insertPoint(0);
    expect(component.flight.pointIds.length).toBe(2);
    component.flight.pointIds[0] = 'START';
    component.flight.pointIds[1] = 'DEST';

    // now insert point between start and dest
    component.insertPoint(0);
    component.flight.pointIds[1] = 'ENR-1';
    expect(component.flight.pointIds.length).toBe(3);
    expect(component.flight.pointIds[0]).toBe('START');
    expect(component.flight.pointIds[1]).toBe('ENR-1');
    expect(component.flight.pointIds[2]).toBe('DEST');

    // now insert point between ENR-1 and dest
    component.insertPoint(1);
    component.flight.pointIds[2] = 'ENR-2';
    expect(component.flight.pointIds.length).toBe(4);
    expect(component.flight.pointIds[0]).toBe('START');
    expect(component.flight.pointIds[1]).toBe('ENR-1');
    expect(component.flight.pointIds[2]).toBe('ENR-2');
    expect(component.flight.pointIds[3]).toBe('DEST');
  });

  it('should save route segments from a flight on saving the flight', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    const saveSpy = spyOn(routeSegmentService, 'saveRouteSegment').and.returnValue(of( {} ));
    spyOn(routeSegmentService, 'findRouteSegment').and.returnValue(of({
      sourcePointId: '',
      targetPointId: '',
      minimumSafeAltitude: -1,
      trueCourse: -1,
      distance: -1,
      _links: undefined
    }));

    // begin inserting two points for start and destination
    component.insertPoint(0);
    component.insertPoint(0);
    expect(component.flight.pointIds.length).toBe(2);
    component.flight.pointIds[0] = 'START';
    component.flight.pointIds[1] = 'DEST';

    // now insert point between start and dest
    component.insertPoint(0);
    component.flight.pointIds[1] = 'ENR-1';
    expect(component.flight.pointIds.length).toBe(3);
    expect(component.flight.pointIds[0]).toBe('START');
    expect(component.flight.pointIds[1]).toBe('ENR-1');
    expect(component.flight.pointIds[2]).toBe('DEST');

    // now save the flight
    component.save();

    // flight has two route segments to be saved
    expect(saveSpy).toHaveBeenCalledTimes(2);
  });

  it('should remove a point from route segments', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    spyOn(routeSegmentService, 'findRouteSegment').and.returnValue(of({
      sourcePointId: '',
      targetPointId: '',
      minimumSafeAltitude: -1,
      trueCourse: -1,
      distance: -1,
      _links: undefined
    }));

    // begin inserting two points for start and destination
    component.insertPoint(0);
    component.insertPoint(0);
    expect(component.flight.pointIds.length).toBe(2);
    component.flight.pointIds[0] = 'START';
    component.flight.pointIds[1] = 'DEST';

    // now insert point between start and dest
    component.insertPoint(0);
    component.flight.pointIds[1] = 'ENR-1';
    expect(component.flight.pointIds.length).toBe(3);
    expect(component.flight.pointIds[0]).toBe('START');
    expect(component.flight.pointIds[1]).toBe('ENR-1');
    expect(component.flight.pointIds[2]).toBe('DEST');

    // now remove point ENR-1
    component.removePoint(1);
    expect(component.flight.pointIds.length).toBe(2);
    expect(component.flight.pointIds[0]).toBe('START');
    expect(component.flight.pointIds[1]).toBe('DEST');
  });

  it('should load all route segments between points of a flight', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    spyOn(routeSegmentService, 'findRouteSegment').and.returnValue(of({
      sourcePointId: '',
      targetPointId: '',
      minimumSafeAltitude: -1,
      trueCourse: -1,
      distance: -1,
      _links: undefined
    }));

    // begin inserting two points for start and destination
    component.insertPoint(0);
    component.insertPoint(0);
    expect(component.flight.pointIds.length).toBe(2);
    component.flight.pointIds[0] = 'START';
    component.flight.pointIds[1] = 'DEST';

    component.loadMissingRouteSegments();
    await fixture.whenStable();
    expect(component.getRouteSegment('START', 'DEST')).toBeTruthy();

    // now insert point between start and dest
    component.insertPoint(0);
    component.flight.pointIds[1] = 'ENR-1';
    expect(component.flight.pointIds.length).toBe(3);
    expect(component.flight.pointIds[0]).toBe('START');
    expect(component.flight.pointIds[1]).toBe('ENR-1');
    expect(component.flight.pointIds[2]).toBe('DEST');

    component.loadMissingRouteSegments();
    await fixture.whenStable();
    expect(component.getRouteSegment('START', 'ENR-1')).toBeTruthy();
    expect(component.getRouteSegment('ENR-1', 'DEST')).toBeTruthy();
  });

  it('should get route segment for points from route segment service', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    const findRouteSegmentSpy = spyOn(routeSegmentService, 'findRouteSegment').and.returnValue(of({
      sourcePointId: '',
      targetPointId: '',
      minimumSafeAltitude: -1,
      trueCourse: -1,
      distance: -1,
      _links: undefined
    }));

    component.loadRouteSegment('START', 'DEST');
    expect(findRouteSegmentSpy).toHaveBeenCalled();

    await fixture.whenStable();
    expect(component.getRouteSegment('START', 'DEST')).toBeTruthy();
  });

  it('should save route segment for points to route segment service', async () => {
    await fixture.whenStable();
    const routeSegmentService = fixture.debugElement.injector.get(RouteSegmentService);
    const saveRouteSegmentSpy = spyOn(routeSegmentService, 'saveRouteSegment').and.returnValue(null);

    component.saveRouteSegment('START', 'DEST');

    expect(saveRouteSegmentSpy).toHaveBeenCalled();
  });
});
