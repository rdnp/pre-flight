import { Component, OnInit } from '@angular/core';
import { Flight } from '../../data.model';
import { FlightService } from '../services/flight.service';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-flight-list',
  templateUrl: './flight-list.component.html',
  styleUrls: ['./flight-list.component.css']
})
export class FlightListComponent implements OnInit {

  private internalFlights: Flight[];

  constructor(private flightService: FlightService) {
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
    this.flightService.deleteFlight(name).subscribe(
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
