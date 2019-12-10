import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightEditorComponent } from './flight-editor.component';
import { FlightService } from '../services/flight.service';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DebugElement } from '@angular/core';

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
      '{ "name": "Trip to Berlin","aircraftType": "C172", "origin": "EDTQ","destination": "EDDB","alternate": "EDDT" }'));
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
});
