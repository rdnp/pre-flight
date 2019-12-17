import { Component, OnInit, Input } from '@angular/core';
import { Flight, RouteSegment } from 'src/data.model';
import { FlightService } from '../services/flight.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { RouteSegmentService } from '../services/route-segment.service';

@Component({
  selector: 'app-flight-editor',
  templateUrl: './flight-editor.component.html',
  styleUrls: ['./flight-editor.component.css']
})
export class FlightEditorComponent implements OnInit {

  @Input()
  flight: Flight;

  @Input()
  routeSegments: Map<string, RouteSegment>;

  constructor(private flightService: FlightService,
    private routeSegmentService: RouteSegmentService,
    private route: ActivatedRoute) {
    this.routeSegments = new Map();
  }

  ngOnInit() {
    // example code below, needs some more action...
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.flightService.getFlightByName(params.get('name')))
    ).subscribe((result: Flight) => {
      this.flight = result;
      this.loadMissingRouteSegments();
    });
  }

  save() {
    this.flightService.saveFlight(this.flight).subscribe();
    // save only those route segments that this flight defines
    for (let i = 0; i < this.flight.pointIds.length - 1; i++) {
      this.routeSegmentService.saveRouteSegment(this.getRouteSegment(this.flight.pointIds[i], this.flight.pointIds[i + 1])).subscribe();
    }
  }

  insertPoint(index: number) {
    const newPoints = new Array<string>(this.flight.pointIds.length + 1);
    for (let i = 0; i < newPoints.length; i++) {
      if (i < index + 1) {
        newPoints[i] = this.flight.pointIds[i];
      } else if (i === index + 1) {
        newPoints[i] = ''; // initialize new point with empty string
      } else {
        newPoints[i] = this.flight.pointIds[i - 1];
      }
    }
    this.flight.pointIds = newPoints;
    this.loadMissingRouteSegments();
  }

  removePoint(index: number) {
    const newPoints = new Array<string>(this.flight.pointIds.length - 1);
    for (let i = 0; i < newPoints.length; i++) {
      if (i < index) {
        newPoints[i] = this.flight.pointIds[i];
      } else {
        newPoints[i] = this.flight.pointIds[i + 1];
      }
    }
    this.flight.pointIds = newPoints;
    this.loadMissingRouteSegments();
  }

  trackByIndex(index: any) {
    return index;
  }

  loadMissingRouteSegments() {
    // we need at least two points...
    if (this.flight.pointIds.length > 1) {
      // iterate all points but the last one to load the legs starting from them
      for (let pointIndex = 0; pointIndex < this.flight.pointIds.length - 1; pointIndex++) {
        this.loadRouteSegment(this.flight.pointIds[pointIndex], this.flight.pointIds[pointIndex + 1]);
      }
    }
  }

  loadRouteSegment(fromPointId: string, toPointId: string) {
    this.routeSegmentService.findRouteSegment(fromPointId, toPointId).subscribe((foundRouteSegment) => {
      // XXX condition untested
      if (!this.getRouteSegment(fromPointId, toPointId)) {
        this.routeSegments.set(fromPointId + '\0' + toPointId, foundRouteSegment);
      }
    });
  }

  saveRouteSegment(fromPointId: string, toPointId: string) {
    this.routeSegmentService.saveRouteSegment(this.routeSegments.get(fromPointId + '\0' + toPointId));
  }

  getRouteSegment(fromPointId: string, toPointId: string) {
    return this.routeSegments.get(fromPointId + '\0' + toPointId);
  }

  /**
   * Sets the point at the given index in the flight to a new value and also loads the then missing route segments.
   */
  setPointId(index: number, pointId: string) {
    this.flight.pointIds[index] = pointId;
    this.loadMissingRouteSegments();
  }

  /**
   * Sets a true course to the route-segment specified by the two points.
   * Will not do anything if the route segment does not exist or if the course is invalid (i.e. not between 0 and 360).
   */
  setTrueCourse(fromPointId: string, toPointId: string, trueCourse: number) {
    if (trueCourse < 0 || trueCourse > 360 || !this.getRouteSegment(fromPointId, toPointId)) {
      alert('You entered a true course that is outside the reasonable range.\n' +
        'Values allowed are between 0 and 360.\n' +
        'Course values are given in degrees.\n' +
        'Please correct the value, as invalid values will not be saved.\n' +
        'Refreshing this page will restore saved values.');
      return;
    }
    this.getRouteSegment(fromPointId, toPointId).trueCourse = trueCourse;
  }

  /**
   * Sets a minimum safe altitude to the route-segment specified by the two points.
   * Will not do anything if the route segment does not exist or if the given altitude is invalid (i.e. not between -2000 and 100000).
   */
  setMinimumSafeAltitude(fromPointId: string, toPointId: string, minimumSafeAltitude: number) {
    if ((minimumSafeAltitude < -2000) || (minimumSafeAltitude > 100000) || (!this.getRouteSegment(fromPointId, toPointId))) {
      alert('You entered a minimum safe altitude that is outside reasonable range.\n' +
        'Values allowed are between -2000 and 100000.\n' +
        'Altitude values are given in feet above MSL.\n' +
        'Please correct the value, as invalid values will not be saved.\n' +
        'Refreshing this page will restore saved values..');
      return;
    }
    this.getRouteSegment(fromPointId, toPointId).minimumSafeAltitude = minimumSafeAltitude;
  }

  /**
   * Sets a distance to the route-segment specified by the two points.
   * Will not do anything if the route segment does not exist or if the given altitude is invalid (i.e. not between 0 and 23000).
   */
  setDistance(fromPointId: string, toPointId: string, distance: number) {
    if (distance < 0 || distance > 23000 || !this.getRouteSegment(fromPointId, toPointId)) {
      alert('You entered a distance is outside reasonable range.' +
        'Values allowed are between 0 and 23000.\n' +
        'Distance values are given in NM.\n' +
        'Please correct the value, as invalid values will not be saved.\n' +
        'Refreshing this page will restore saved values.');
      return;
    }
    this.getRouteSegment(fromPointId, toPointId).distance = distance;
  }
}
