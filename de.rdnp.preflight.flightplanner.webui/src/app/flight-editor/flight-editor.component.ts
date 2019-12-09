import { Component, OnInit } from '@angular/core';
import { Flight } from 'src/data.model';

@Component({
  selector: 'app-flight-editor',
  templateUrl: './flight-editor.component.html',
  styleUrls: ['./flight-editor.component.css']
})
export class FlightEditorComponent implements OnInit {

  private flight: Flight;

  constructor() { }

  ngOnInit() {
  }

  save() {
    // TODO
  }

}
