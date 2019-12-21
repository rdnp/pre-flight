import { TestBed, async, inject } from '@angular/core/testing';

import { TripService } from './trip.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Trip, TripSegment } from 'src/data.model';
import { FlightService } from './flight.service';

describe('TripService', () => {

  let service: TripService;

  let flightIdWithTrips: string;

  let flightIdWithoutTrips: string;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ],
      providers: [FlightService]
    });
    service = TestBed.get(TripService);
  }));

  // 'Load test data into test server'
  beforeEach(async(inject([HttpClient, FlightService], (client: HttpClient, flightService: FlightService) => {
    const enableFlightTestData = client.post('http://localhost:8080/setDefaultTestDataForFlights', '');
    enableFlightTestData.subscribe(() => {
      console.log('Test data for flights loaded');
      const enableTripTestData = client.post('http://localhost:8080/setDefaultTestDataForTrips', '');
      enableTripTestData.subscribe(() => {
        console.log('Test data for trips loaded');
        flightService.getFlightByName('Flight.to.Schwaebisch.Hall').subscribe((flight) => {
          flightIdWithTrips = flight._links.flight.href.substr(flight._links.flight.href.lastIndexOf('/') + 1);
          console.log('Flight with trips: ' + flightIdWithTrips);
        }, console.log);
        flightService.getFlightByName('Flight.to.Berlin').subscribe((flight) => {
          flightIdWithoutTrips = flight._links.flight.href.substr(flight._links.flight.href.lastIndexOf('/') + 1);
          console.log('Flight without trips: ' + flightIdWithoutTrips);
        }, console.log);
      }, console.log);
    }, console.log);
  })));

  // 'Purge test data from test server'
  afterEach(async(inject([HttpClient], (client: HttpClient) => {
    const deleteFlightTestData = client.post('http://localhost:8080/deleteAllTestDataForTrips', '');
    deleteFlightTestData.subscribe(() => {
      console.log('Test data for trips deleted');
      const deleteTripTestData = client.post('http://localhost:8080/deleteAllTestDataForFlights', '');
      deleteTripTestData.subscribe(() => { console.log('Test data for flights deleted'); }, console.log);
    }, console.log);
  })));

  it('should retrieve all trip information from the repository', async(() => {
    service.findAllTripsForFlight(flightIdWithTrips).subscribe((trips: Trip[]) => {
      expect(trips.length).toBe(2);
      expect(trips[0].flightId.toString()).toBe(flightIdWithTrips);
      expect(trips[1].flightId.toString()).toBe(flightIdWithTrips);

      expect(trips[0].segments.length).toBe(3);

      expect(trips[0].segments[0].altitude).toBe(3300);
      expect(trips[0].segments[0].trueAirspeed).toBe(79);
      expect(trips[0].segments[0].magneticHeading).toBe(51);
      expect(trips[0].segments[0].fuel).toBe(0.8);
      expect(trips[0].segments[1].groundSpeed).toBe(114);
      expect(trips[0].segments[1].timeInMinutes).toBe(19);
      expect(trips[0].segments[1].hourlyFuelConsumptionRate).toBe(9.8);
      expect(trips[0].segments[1].children.length).toBe(1);
      expect(trips[0].segments[1].children[0].variation).toBe(2);
      expect(trips[0].segments[1].children[0].altitude).toBe(3300);
      expect(trips[0].segments[1].children[0].hourlyFuelConsumptionRate).toBe(12);
      expect(trips[0].segments[1].children[0].groundSpeed).toBe(76);
      expect(trips[0].segments[1].children[0].timeInMinutes).toBe(2);

      expect(trips[1].segments[0].altitude).toBe(5000);
      expect(trips[1].segments[0].windDirection).toBe(350);
      expect(trips[1].segments[0].windSpeed).toBe(10);
      expect(trips[1].segments[0].children.length).toBe(0);
      expect(trips[1].segments[1].altitude).toBe(5000);
      expect(trips[1].segments[1].children.length).toBe(0);
      expect(trips[1].segments[2].altitude).toBe(5000);
      expect(trips[1].segments[2].magneticCourse).toBe(264);
      expect(trips[1].segments[2].variation).toBe(2);
      expect(trips[1].segments[2].children.length).toBe(0);
    }, console.log);
  }));

  it('should store newly created trip information in the repository', async(() => {
    const testTripOne = new Trip(flightIdWithTrips, '', '', '', '', [], undefined);
    service.createTrip(testTripOne).subscribe(() =>
      service.findAllTripsForFlight(flightIdWithTrips).subscribe((trips) => {
        expect(trips.length).toBe(3);
      })
    );

    const testTripTwo = new Trip(flightIdWithoutTrips, '', '', '', '', [], undefined);
    service.createTrip(testTripTwo).subscribe(() =>
      service.findAllTripsForFlight(flightIdWithoutTrips).subscribe((trips) => {
        expect(trips.length).toBe(1);
      })
    );
  }));

  it('should delete trip information from the repository', async(() => {
    service.findAllTripsForFlight(flightIdWithTrips).subscribe((trips: Trip[]) => {
      service.deleteTrip(trips[0]).subscribe(() => { }, () =>
        service.findAllTripsForFlight(flightIdWithTrips).subscribe((tripsAfterDeletion: Trip[]) => {
          expect(trips.length).toBe(2);
          expect(tripsAfterDeletion.length).toBe(1);
        }));
    });
  }));

  it('should delete all trip information from a flight in the repository', async(() => {
    service.deleteAllTripsForFlight(flightIdWithTrips).subscribe(() => {
      service.findAllTripsForFlight(flightIdWithTrips).subscribe((tripsAfterDeletion: Trip[]) => {
        expect(tripsAfterDeletion.length).toBe(0);
      });
    }, console.log);
  }));

  it('should determine correctly if no user input has been made to a trip', () => {
    expect(service.isEmptyTrip(new Trip('', '', '', '', '', [], undefined))).toBeTruthy();
    expect(service.isEmptyTrip(new Trip('a', '', '', '', '', [], undefined))).toBeTruthy();
    expect(service.isEmptyTrip(new Trip('', 'a', '', '', '', [], undefined))).toBeFalsy();
    expect(service.isEmptyTrip(new Trip('', '', 'a', '', '', [], undefined))).toBeFalsy();
    expect(service.isEmptyTrip(new Trip('', '', '', 'a', '', [], undefined))).toBeFalsy();
    expect(service.isEmptyTrip(new Trip('', '', '', '', 'a', [], undefined))).toBeFalsy();
    const emptyTestSegment = new TripSegment();
    expect(service.isEmptyTrip(new Trip('', '', '', '', '', [emptyTestSegment, emptyTestSegment], undefined))).toBeTruthy();
    let testSegment = new TripSegment();
    testSegment.altitude = 3;
    expect(service.isEmptyTrip(new Trip('', '', '', '', '', [emptyTestSegment, testSegment], undefined))).toBeFalsy();
    testSegment = new TripSegment();
    testSegment.trueAirspeed = 3;
    expect(service.isEmptyTrip(new Trip('', '', '', '', '', [testSegment, emptyTestSegment], undefined))).toBeFalsy();
    testSegment = new TripSegment();
    testSegment.variation = 3;
    expect(service.isEmptyTrip(new Trip('', '', '', '', '', [emptyTestSegment, testSegment], undefined))).toBeFalsy();
    testSegment = new TripSegment();
    testSegment.hourlyFuelConsumptionRate = 3;
    expect(service.isEmptyTrip(new Trip('', '', '', '', '', [emptyTestSegment, testSegment], undefined))).toBeFalsy();
    testSegment = new TripSegment();
    testSegment.windDirection = 3;
    expect(service.isEmptyTrip(new Trip('', '', '', '', '', [emptyTestSegment, testSegment], undefined))).toBeFalsy();
    testSegment = new TripSegment();
    testSegment.windSpeed = 3;
    expect(service.isEmptyTrip(new Trip('', '', '', '', '', [emptyTestSegment, testSegment], undefined))).toBeFalsy();
    testSegment = new TripSegment();
    testSegment.children = [emptyTestSegment];
    expect(service.isEmptyTrip(new Trip('', '', '', '', '', [emptyTestSegment, testSegment], undefined))).toBeFalsy();
  });
});
