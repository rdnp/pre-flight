import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FlightService {

  constructor(private http: HttpClient) {
  }

  public getFlights() {
    return this.http.get('http://localhost:8080/flights');
  }

  public deleteFlight(flightId: number) {
    const url = 'http://localhost:8080/flights/' + flightId;
    return this.http.delete(url, { observe: 'response', responseType: 'text' });
  }

  public createFlight() {

  }
  
  public updateFlight(flightId: number) {
    
  }
}
