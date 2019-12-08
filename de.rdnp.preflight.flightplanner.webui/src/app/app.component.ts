import { Component, OnInit } from '@angular/core';
import { Flight } from '../data.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'de-rdnp-preflight-flightplanner-webui';
  flights: Flight[];

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.flights = [];
    this.http.get('http://localhost:8080/flights').subscribe((readFlight: Object) => {
      let flightArray = readFlight['_embedded']['flights'];
      for (var i = 0; i < flightArray.length; i++) {
        this.flights.push(flightArray[i]);
        console.log('Got ' + this.flights.length + ' flights: ' + this.flights);
      }
    });
    console.log('Got ' + this.flights.length + ' flights: ' + this.flights);
  }

  /**
   * startFlightPlanning starts the flight planning for a flight
   */
  public startFlightPlanning() {
    // TODO 
    console.log('flight planning pressed');
  }

  /**
   * newFlight
   */
  public newFlight() {
    // TODO
    console.log('new flight pressed');
  }
}
