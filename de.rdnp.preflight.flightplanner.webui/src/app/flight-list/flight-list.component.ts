import { Component, OnInit } from '@angular/core';
import { Flight } from '../../data.model';
import { FlightService } from '../services/flight.service';
import { TripService } from '../services/trip.service';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-flight-list',
  templateUrl: './flight-list.component.html',
  styleUrls: ['./flight-list.component.css']
})
export class FlightListComponent implements OnInit {

  private internalFlights: Flight[];

  constructor(private flightService: FlightService, private tripService: TripService) {
  }

  ngOnInit(): void {
    this.loadFlights();
  }

  private loadFlights() {
    this.internalFlights = [];
    this.flightService.getFlights().subscribe((flightArray: Flight[]) => {
      for (const oneFlight of flightArray) {
        this.internalFlights.push(oneFlight);
      }
    });
  }

  public get flights() {
    return this.internalFlights;
  }

  private lookupFlightId(name: string) {
    const flightWithName = this.internalFlights.filter((flight) => flight.name === name);
    if (flightWithName.length > 0) {
      return flightWithName[0]._links.flight.href.substr(flightWithName[0]._links.flight.href.lastIndexOf('/') + 1);
    }
    return undefined;
  }

  public deleteFlight(name: string) {
    const deleteActions: Observable<object>[] = [];
    deleteActions.push(this.flightService.deleteFlight(name));
    deleteActions.push(this.tripService.deleteAllTripsForFlight(this.lookupFlightId(name)));
    forkJoin(deleteActions).subscribe(
      () => {
        this.loadFlights();
      },
      error => {
        console.log(error);
        this.loadFlights();
      }
    );
    // Note. REST Response is discarded
  }

}
