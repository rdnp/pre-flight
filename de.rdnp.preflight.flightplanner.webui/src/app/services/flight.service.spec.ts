import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FlightService } from './flight.service'

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
      service.getFlights().subscribe(flightData => {
        console.log(flightData);
        expect(flightData['_embedded']['flights'].length).toBeGreaterThan(0);
        expect(flightData['_embedded']['flights'][0].destination).toEqual('EDDL');
        expect(flightData['_embedded']['flights'][1].destination).toEqual('EDDB');
        expect(flightData['_embedded']['flights'][2].start).toEqual('EDTY');
        expect(flightData['_embedded']['flights'][2].destination).toEqual('EDDL');
      })
    });
  })));

  // TODO Delete

  // TODO Create

  // TODO Update

});
