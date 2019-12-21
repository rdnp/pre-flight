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

  public deleteFlight(name: string) {
    const deleteActions: Observable<object>[] = [];
    deleteActions.push(this.flightService.deleteFlight(name));
    deleteActions.push(this.tripService.deleteAllTripsForFlight(name));
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
