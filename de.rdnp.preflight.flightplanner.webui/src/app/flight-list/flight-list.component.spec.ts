import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightListComponent } from './flight-list.component';
import { FlightService } from '../services/flight.service';
import { of } from 'rxjs';

class MockFlightService extends FlightService {
  getFlights() {
    const result = JSON.parse(
      '{"_embedded": {"flights": [{ "start": "EDTQ","destination": "EDDL" },{ "start": "EDTQ","destination": "EDDB" }]}}');
    return of(result);
  }

  deleteFlight(flightIndex: number) {
    const result = null;
    return of(result);
  }
}

describe('FlightListComponent', () => {
  let component: FlightListComponent;
  let fixture: ComponentFixture<FlightListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlightListComponent],
      providers: [{ provide: FlightService, useClass: MockFlightService }],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have flights from flight service', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.flights.length).toBe(2);
    expect(component.flights[0].start).toBe('EDTQ');
    expect(component.flights[0].destination).toBe('EDDL');
    expect(component.flights[1].start).toBe('EDTQ');
    expect(component.flights[1].destination).toBe('EDDB');
  });

  it('should delete a flight from flight service', async () => {
    await fixture.whenStable();

    const response = component.deleteFlight(1);

    expect(response).toBeNull(); 
    // TODO Currently, there is no response handling, errors should be handled somehow

    expect(component).toBeTruthy();
    expect(component.flights.length).toBe(2);
    expect(component.flights[0].start).toBe('EDTQ');
    expect(component.flights[0].destination).toBe('EDDL');
    expect(component.flights[1].start).toBe('EDTQ');
    expect(component.flights[1].destination).toBe('EDDB');
  });

  // TODO - Display flights
});
