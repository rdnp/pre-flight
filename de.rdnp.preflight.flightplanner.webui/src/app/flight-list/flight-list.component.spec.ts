import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightListComponent } from './flight-list.component';
import { FlightService } from '../services/flight.service';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TripService } from '../services/trip.service';
import { Flight } from 'src/data.model';

class MockFlightService extends FlightService {
  getFlights() {
    const result: Flight[] = JSON.parse(
      '[{ "name": "Trip to Düsseldorf","aircraftType": "C172", "origin": "EDTQ","destination": "EDDL","alternate": "EDDK"  }' +
      ',{ "name": "Trip to Berlin","aircraftType": "C172", "origin": "EDTQ","destination": "EDDB","alternate": "EDDT" }]');
    result[1]._links =
      JSON.parse('{"self" : {"href" : "http://localhost:8080/flights/4"}, "flight" : { "href" : "http://localhost:8080/flights/4" } }');
    return of(result);
  }

  deleteFlight(name: string) {
    return of({});
  }
}

class MockTripService extends TripService {

  deleteAllTripsForFlight(name: string) {
    return of({});
  }
}

describe('FlightListComponent', () => {
  let component: FlightListComponent;
  let fixture: ComponentFixture<FlightListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlightListComponent],
      imports: [HttpClientModule, RouterModule.forRoot([
        { path: '**', component: FlightListComponent }])],
      providers: [{ provide: FlightService, useClass: MockFlightService },
      { provide: TripService, useClass: MockTripService }],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have flights from flight service', async () => {
    await fixture.whenStable();
    expect(component).toBeTruthy();
    expect(component.flights.length).toBe(2);
    expect(component.flights[0].name).toBe('Trip to Düsseldorf');
    expect(component.flights[0].origin).toBe('EDTQ');
    expect(component.flights[0].destination).toBe('EDDL');
    expect(component.flights[0].alternate).toBe('EDDK');
    expect(component.flights[1].name).toBe('Trip to Berlin');
    expect(component.flights[1].origin).toBe('EDTQ');
    expect(component.flights[1].destination).toBe('EDDB');
    expect(component.flights[1].alternate).toBe('EDDT');
  });

  it('should delete a flight and all its trips using FlightService and TripService', async () => {
    await fixture.whenStable();
    const flightService = fixture.debugElement.injector.get(FlightService);
    const deleteSpy = spyOn(flightService, 'deleteFlight').and.callThrough();
    const tripService = fixture.debugElement.injector.get(TripService);
    const deleteTripSpy = spyOn(tripService, 'deleteAllTripsForFlight').and.callThrough();
    const getFlightsSpy = spyOn(flightService, 'getFlights').and.callThrough();

    component.deleteFlight('Trip to Berlin');

    expect(deleteSpy).toHaveBeenCalledWith('Trip to Berlin');
    expect(deleteTripSpy).toHaveBeenCalledWith('4');

    await fixture.whenStable();
    expect(getFlightsSpy).toHaveBeenCalledTimes(1);

    component.deleteFlight('testFlight');
    expect(deleteTripSpy).toHaveBeenCalledWith(undefined);

  });

});
