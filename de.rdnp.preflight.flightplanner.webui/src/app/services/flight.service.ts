import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Flight, FlightRepositoryResponse } from 'src/data.model';
import { map, concatMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class FlightService {

  constructor(private http: HttpClient) {
  }

  public getFlights() {
    return this.http.get(environment.repositoryUrl + '/flights').pipe(
      map((response: FlightRepositoryResponse) => {
        return response._embedded.flights;
      })
    );
  }

  public getFlightByName(name: string) {
    const queryUrl = environment.repositoryUrl + '/flights/search/findByName?name=' + name;
    return this.http.get(queryUrl).pipe(
      // unwrap the flight
      map((response: FlightRepositoryResponse) => {
        if (response._embedded.flights.length > 0) {
          return response._embedded.flights[0];
        }
        return new Flight('', '', '', '', ['', ''], null);
      })
    );
  }

  public deleteFlight(name: string) {
    const queryUrl = environment.repositoryUrl + '/flights/search/deleteByName?name=' + name;
    return this.http.get(queryUrl);
  }

  public saveFlight(flight: Flight) {
    return this.getFlightByName(flight.name).pipe(concatMap((repositoryFlight) => {
      if (repositoryFlight.name.length > 0) {
        return this.http.put(repositoryFlight._links.self.href, flight);
      } else {
        const createNewFlightUrl = environment.repositoryUrl + '/flights/9223372036854775807';
        return this.http.put(createNewFlightUrl, flight);
      }
    }));
  }
}
