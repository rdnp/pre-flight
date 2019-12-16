import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FlightService } from './flight.service';

describe('FlightService', () => {

  let service: FlightService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ]
    });
    service = TestBed.get(FlightService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('retrieves all the flights from integrationtest server', async(inject([HttpClient], (client: HttpClient) => {
    const post = client.post('http://localhost:8080/setTestCase1', '');
    post.subscribe((postResponse: object) => {
      console.log(postResponse);
      service.getFlights().subscribe(flights => {
        console.log(flights);
        expect(flights.length).toBeGreaterThan(0);
        expect(flights[0].origin).toEqual('EDTQ');
        expect(flights[0].destination).toEqual('EDTQ');
        expect(flights[1].destination).toEqual('EDDB');
        expect(flights[2].origin).toEqual('EDTY');

        // Clean-Up
        service.deleteFlight('Flight.to.Berlin').subscribe(() => { }, () => { });
        service.deleteFlight('Flight.to.Schwaebisch.Hall').subscribe(() => { }, () => { });
        service.deleteFlight('Sample.Local.Flight').subscribe(() => { }, () => { });
      });
    });
  })));

  it('retrieves an existing and non-existing flight from integrationtest server by name',
    async(inject([HttpClient], (client: HttpClient) => {
      const post = client.post('http://localhost:8080/setTestCase1', '');
      post.subscribe((postResponse: object) => {
        console.log(postResponse);
        service.getFlightByName('Sample.Local.Flight').subscribe(flightData => {
          expect(flightData.origin).toEqual('EDTQ');
          expect(flightData.destination).toEqual('EDTQ');
        });
        service.getFlightByName('').subscribe(flightData => {
          expect(flightData.origin).toEqual('');
          expect(flightData.destination).toEqual('');

          // Clean-Up
          service.deleteFlight('Flight.to.Berlin').subscribe(() => { }, () => { });
          service.deleteFlight('Flight.to.Schwaebisch.Hall').subscribe(() => { }, () => { });
          service.deleteFlight('Sample.Local.Flight').subscribe(() => { }, () => { });
        });
      });
    })));

  it('deletes an existing flight from integrationtest server by name',
    async(inject([HttpClient], (client: HttpClient) => {
      const post = client.post('http://localhost:8080/setTestCase1', '');
      post.subscribe((postResponse: object) => {
        console.log(postResponse);
        service.getFlightByName('Sample.Local.Flight').subscribe(flightData => {
          expect(flightData.origin).toEqual('EDTQ');
          expect(flightData.destination).toEqual('EDTQ');
        });
        service.deleteFlight('Sample.Local.Flight').subscribe(() => { },
          () => {
            service.getFlightByName('Sample.Local.Flight').subscribe(flightData => {
              expect(flightData.origin).toEqual('');
              expect(flightData.destination).toEqual('');

              // Clean-Up
              service.deleteFlight('Flight.to.Berlin').subscribe(() => { }, () => { });
              service.deleteFlight('Flight.to.Schwaebisch.Hall').subscribe(() => { }, () => { });
              service.deleteFlight('Sample.Local.Flight').subscribe(() => { }, () => { });
            });
          }
        );
      });
    })));

  it('Saves an existing flight on integrationtest server by name',
    async(inject([HttpClient], (client: HttpClient) => {
      const post = client.post('http://localhost:8080/setTestCase1', '');
      post.subscribe(() => {
        service.getFlightByName('Sample.Local.Flight').subscribe(flightData => {
          expect(flightData.origin).toEqual('EDTQ');
          expect(flightData.destination).toEqual('EDTQ');
          flightData.destination = 'EDTL';

          // Save under another name
          flightData.name = 'New.Flight';
          service.saveFlight(flightData).subscribe(() => {
            service.getFlightByName('New.Flight').subscribe(newFlight => {
              expect(newFlight.destination).toEqual('EDTL');
            });

            // Update the newly created record
            flightData.destination = 'LOWI';
            service.saveFlight(flightData).subscribe(() => {
              service.getFlightByName('New.Flight').subscribe(newFlightUpdated => {
                expect(newFlightUpdated.destination).toEqual('LOWI');

                // Clean up
                service.deleteFlight('Flight.to.Berlin').subscribe(() => { }, () => { });
                service.deleteFlight('Flight.to.Schwaebisch.Hall').subscribe(() => { }, () => { });
                service.deleteFlight('Sample.Local.Flight').subscribe(() => { }, () => { });
                service.deleteFlight('New.Flight').subscribe(() => { }, () => { });
              });
            });
          });

        });
      });
    })));

});
