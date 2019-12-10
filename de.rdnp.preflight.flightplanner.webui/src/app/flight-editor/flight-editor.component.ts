import { Component, OnInit, Input } from '@angular/core';
import { Flight } from 'src/data.model';
import { FlightService } from '../services/flight.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-flight-editor',
  templateUrl: './flight-editor.component.html',
  styleUrls: ['./flight-editor.component.css']
})
export class FlightEditorComponent implements OnInit {

  @Input()
  flight: Flight;

  constructor(private flightService: FlightService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    // example code below, needs some more action...
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.flightService.getFlightByName(params.get('name')))
    ).subscribe((result: Flight) => { this.flight = result });
  }

  save() {
    console.log(this.flight);
    this.flightService.saveFlight(this.flight).subscribe();
  }

}
