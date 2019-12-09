import { Component, OnInit } from '@angular/core';
import { Flight } from '../../data.model';
import { FlightService } from '../services/flight.service';

@Component({
  selector: 'app-flight-list',
  templateUrl: './flight-list.component.html',
  styleUrls: ['./flight-list.component.css']
})
export class FlightListComponent implements OnInit {

  flights: Flight[];

  constructor(private flightService: FlightService) {
  }

  ngOnInit(): void {
    this.loadFlights();
  }

  private loadFlights() {
    this.flights = [];
    this.flightService.getFlights().subscribe((readFlight: object) => {
      const flightArray = readFlight['_embedded']['flights'];
      for (const oneFlight of flightArray) {
        this.flights.push(oneFlight);
        console.log('Got ' + this.flights.length + ' flights: ' + this.flights);
      }
    });
  }

  /**
   * startFlightPlanning starts the flight planning for a flight
   */
  public deleteFlight(flightIndex: number) {
    const flightId = flightIndex + 1;
    this.flightService.deleteFlight(flightId).subscribe((obj: object) => { 
      console.log(obj);
      this.loadFlights();
    });

    // Note. REST Response is discarded
  }

}
