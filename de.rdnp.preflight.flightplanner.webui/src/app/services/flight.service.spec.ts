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

  // 'Load test data into test server'
  beforeEach(async(inject([HttpClient], (client: HttpClient) => {
    const enableTestData = client.post('http://localhost:8080/setDefaultTestDataForFlights', '');
    enableTestData.subscribe(() => { console.log('Test data for flights loaded'); }, console.log);
  })));

  // 'Purge test data from test server'
  afterEach(async(inject([HttpClient], (client: HttpClient) => {
    const deleteTestData = client.post('http://localhost:8080/deleteAllTestDataForFlights', '');
    deleteTestData.subscribe(() => { console.log('Test data for flights deleted'); }, console.log);
  })));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('retrieves all the flights from integrationtest server', async(() => {
    service.getFlights().subscribe(flights => {
      console.log(flights);
      expect(flights.length).toBeGreaterThan(0);
      expect(flights[0].origin).toEqual('EDTQ');
      expect(flights[0].destination).toEqual('EDTQ');
      expect(flights[0].pointIds.length).toBe(2);
      expect(flights[0].pointIds[0]).toBe(flights[0].origin);
      expect(flights[0].pointIds[1]).toBe(flights[0].destination);
      expect(flights[1].destination).toEqual('EDDB');
      expect(flights[1].pointIds.length).toBe(2);
      expect(flights[1].pointIds[0]).toBe(flights[1].origin);
      expect(flights[1].pointIds[1]).toBe(flights[1].destination);
      expect(flights[2].destination).toEqual('EDTY');
      expect(flights[2].pointIds.length).toBe(5);
      expect(flights[2].pointIds[0]).toBe(flights[2].origin);
      expect(flights[2].pointIds[1]).toBe('LBU');
      expect(flights[2].pointIds[2]).toBe('DKB');
      expect(flights[2].pointIds[3]).toBe(flights[2].destination);
      expect(flights[2].pointIds[4]).toBe(flights[2].alternate);
    });
  }));

  it('retrieves an existing and non-existing flight from integrationtest server by name',
    async(() => {
      service.getFlightByName('Sample.Local.Flight').subscribe(flightData => {
        expect(flightData.origin).toEqual('EDTQ');
        expect(flightData.destination).toEqual('EDTQ');
      });
      service.getFlightByName('').subscribe(flightData => {
        expect(flightData.origin).toEqual('');
        expect(flightData.destination).toEqual('');
        expect(flightData.pointIds.length).toBe(2);
      });
    }));

  it('deletes an existing flight from integrationtest server by name',
    async(() => {
      service.getFlightByName('Sample.Local.Flight').subscribe(flightData => {
        expect(flightData.origin).toEqual('EDTQ');
        expect(flightData.destination).toEqual('EDTQ');
        service.deleteFlight('Sample.Local.Flight').subscribe(() => { },
        () => {
          service.getFlightByName('Sample.Local.Flight').subscribe(deletedFlightData => {
            expect(deletedFlightData.origin).toEqual('');
            expect(deletedFlightData.destination).toEqual('');
          });
        }
      );
      });
    }));

  it('Saves an existing flight on integrationtest server by name',
    async(() => {
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
            });
          });
        });
      });
    }));

});
