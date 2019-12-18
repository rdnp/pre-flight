import { Component, OnInit, Input } from '@angular/core';
import { Flight, RouteSegment, TripSegment } from 'src/data.model';
import { FlightService } from '../services/flight.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { RouteSegmentService } from '../services/route-segment.service';
import { TripComputerService } from '../services/trip-computer.service';

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

  @Input()
  tripSegments: Map<number, TripSegment>;

  constructor(private flightService: FlightService,
    // tslint:disable-next-line: align
    private routeSegmentService: RouteSegmentService,
    // tslint:disable-next-line: align
    private tripComputeService: TripComputerService,
    // tslint:disable-next-line: align
    private route: ActivatedRoute) {
    this.routeSegments = new Map();
    this.tripSegments = new Map();
  }

  ngOnInit() {
    // example code below, needs some more action...
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.flightService.getFlightByName(params.get('name')))
    ).subscribe((result: Flight) => {
      this.flight = result;
      this.loadMissingRouteSegments();
      this.initializeAllTripSegments();
    });
  }

  save() {
    this.flightService.saveFlight(this.flight).subscribe();
    // save only those route segments that this flight defines
    for (let i = 0; i < this.flight.pointIds.length - 1; i++) {
      this.routeSegmentService.saveRouteSegment(
        this.findLoadedRouteSegment(this.flight.pointIds[i], this.flight.pointIds[i + 1])).subscribe();
    }
  }

  newTripSegment() {
    return {
      variation: 0,
      fuelConsumptionRate: 0,
      windDirection: 0,
      windSpeed: 0,
      trueAirspeed: 1,
      altitude: 0,
      magneticCourse: 0,
      magneticHeading: 0,
      groundSpeed: 0,
      time: 0,
      fuel: 0
    };
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
        this.tripSegments.set(i - 1, this.tripSegments.get(i - 2));
      }
    }
    this.loadMissingRouteSegments();
    this.tripSegments.set(index, this.newTripSegment());
    this.flight.pointIds = newPoints;
  }

  removePoint(index: number) {
    const newPoints = new Array<string>(this.flight.pointIds.length - 1);
    for (let i = 0; i < newPoints.length; i++) {
      if (i < index) {
        newPoints[i] = this.flight.pointIds[i];
      } else {
        newPoints[i] = this.flight.pointIds[i + 1];
        this.tripSegments.set(i - 1, this.tripSegments.get(i));
      }
    }
    this.loadMissingRouteSegments();
    this.flight.pointIds = newPoints;
    this.tripSegments.delete(newPoints.length - 1);
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

  initializeAllTripSegments() {
    // we need at least two points...
    if (this.flight.pointIds.length > 1) {
      // iterate all points but the last one to load the legs starting from them
      for (let pointIndex = 0; pointIndex < this.flight.pointIds.length - 1; pointIndex++) {
        this.tripSegments.set(pointIndex, this.newTripSegment());
      }
    }
  }

  loadRouteSegment(fromPointId: string, toPointId: string) {
    this.routeSegmentService.findRouteSegment(fromPointId, toPointId).subscribe((foundRouteSegment) => {
      if (!this.findLoadedRouteSegment(fromPointId, toPointId)) {
        this.routeSegments.set(fromPointId + '\0' + toPointId, foundRouteSegment);
      }
      this.findRelatedTripSegments(fromPointId, toPointId).forEach((leg) => {
        this.tripComputeService.updateMagneticCourse(leg, foundRouteSegment.trueCourse, foundRouteSegment.distance);
      });
    });
  }

  saveRouteSegment(fromPointId: string, toPointId: string) {
    this.routeSegmentService.saveRouteSegment(this.routeSegments.get(fromPointId + '\0' + toPointId));
  }

  findLoadedRouteSegment(fromPointId: string, toPointId: string) {
    return this.routeSegments.get(fromPointId + '\0' + toPointId);
  }

  findTripSegmentRouting(leg: TripSegment): RouteSegment {
    let foundSegment = { sourcePointId: '', targetPointId: '', trueCourse: -1, distance: -1, minimumSafeAltitude: -1, _links: undefined };
    this.tripSegments.forEach(
      (value, index) => {
        if (value === leg) {
          foundSegment = this.findLoadedRouteSegment(this.flight.pointIds[index], this.flight.pointIds[index + 1]);
        }
      }
    );
    return foundSegment;
  }

  findRelatedTripSegments(fromPointId: string, toPointId: string) {
    const result = [];
    this.tripSegments.forEach(
      (value, index) => {
        if (fromPointId === this.flight.pointIds[index] && toPointId === this.flight.pointIds[index + 1]) {
          result.push(value);
        }
      });
    return result;
  }

  trackByIndex(index: any) {
    return index;
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
  setTrueCourse(fromPointId: string, toPointId: string, trueCourseInput: string) {
    const trueCourse = parseFloat(trueCourseInput);
    if (trueCourse < 0 || trueCourse > 360 || !this.findLoadedRouteSegment(fromPointId, toPointId)) {
      alert('You entered a true course that is outside the reasonable range.\n' +
        'Values allowed are between 0 and 360.\n' +
        'Course values are given in degrees.\n' +
        'Please correct the value, as invalid values will not be saved.\n' +
        'Refreshing this page will restore saved values.');
      return;
    }
    const routeSegment = this.findLoadedRouteSegment(fromPointId, toPointId);
    routeSegment.trueCourse = trueCourse;
    this.findRelatedTripSegments(fromPointId, toPointId).forEach(
      (leg) => {
        this.tripComputeService.updateMagneticCourse(leg, routeSegment.trueCourse, routeSegment.distance);
      });
  }

  /**
   * Sets a minimum safe altitude to the route-segment specified by the two points.
   * Will not do anything if the route segment does not exist or if the given altitude is invalid (i.e. not between -2000 and 100000).
   */
  setMinimumSafeAltitude(fromPointId: string, toPointId: string, minimumSafeAltitudeInput: string) {
    const minimumSafeAltitude = parseFloat(minimumSafeAltitudeInput);
    if ((minimumSafeAltitude < -2000) || (minimumSafeAltitude > 100000) || (!this.findLoadedRouteSegment(fromPointId, toPointId))) {
      alert('You entered a minimum safe altitude that is outside reasonable range.\n' +
        'Values allowed are between -2000 and 100000.\n' +
        'Altitude values are given in feet above MSL.\n' +
        'Please correct the value, as invalid values will not be saved.\n' +
        'Refreshing this page will restore saved values..');
      return;
    }
    this.findLoadedRouteSegment(fromPointId, toPointId).minimumSafeAltitude = minimumSafeAltitude;
  }

  /**
   * Sets a distance to the route-segment specified by the two points.
   * Will not do anything if the route segment does not exist or if the given altitude is invalid (i.e. not between 0 and 23000).
   */
  setDistance(fromPointId: string, toPointId: string, distanceInput: string) {
    const distance = parseFloat(distanceInput);
    if (distance < 0 || distance > 23000 || !this.findLoadedRouteSegment(fromPointId, toPointId)) {
      alert('You entered a distance is outside reasonable range.' +
        'Values allowed are between 0 and 23000.\n' +
        'Distance values are given in NM.\n' +
        'Please correct the value, as invalid values will not be saved.\n' +
        'Refreshing this page will restore saved values.');
      return;
    }
    const routeSegment = this.findLoadedRouteSegment(fromPointId, toPointId);
    routeSegment.distance = distance;
    this.findRelatedTripSegments(fromPointId, toPointId).forEach(
      (leg) => {
        leg.distance = distance;
        this.tripComputeService.updateTime(leg, routeSegment.distance);
      }
    );
  }

  setVariation(tripSegmentIndex: number, newVariationInput: string) {
    //
    // TODO check variation must be between -180 .. 180
    //
    const newVariation = parseFloat(newVariationInput);
    const tripSegment = this.tripSegments.get(tripSegmentIndex);
    const trueCourse = this.findTripSegmentRouting(tripSegment).trueCourse;
    const distance = this.findTripSegmentRouting(tripSegment).distance;
    tripSegment.variation = newVariation;
    this.tripComputeService.updateMagneticCourse(tripSegment, trueCourse, distance);
  }

  setFuelConsumptionRate(tripSegmentIndex: number, newFuelConsumpationRateInput: string) {
    //
    // TODO check FCR must be greater zero
    //
    const newFuelConsumpationRate = parseFloat(newFuelConsumpationRateInput);
    const tripSegment = this.tripSegments.get(tripSegmentIndex);
    tripSegment.fuelConsumptionRate = newFuelConsumpationRate;
    this.tripComputeService.updateFuel(tripSegment);
  }

  setWindVector(tripSegmentIndex: number, newWindDirectionInput: string, newWindSpeedInput: string) {
    //
    // TODO check wind direction must be between 0 .. 360, wind speed must be greater or equal to zero
    //
    const newWindDirection = parseFloat(newWindDirectionInput);
    const newWindSpeed = parseFloat(newWindSpeedInput);
    const tripSegment = this.tripSegments.get(tripSegmentIndex);
    tripSegment.windSpeed = newWindSpeed;
    tripSegment.windDirection = newWindDirection;
    const trueCourse = this.findTripSegmentRouting(tripSegment).trueCourse;
    const distance = this.findTripSegmentRouting(tripSegment).distance;
    this.tripComputeService.updateMagneticHeading(tripSegment, trueCourse, distance);
  }

  setTrueAirspeed(tripSegmentIndex: number, newTrueAirspeedInput: string) {
    //
    // TODO check wind direction must be between 0 .. 360, wind speed must be greater or equal to zero
    //
    const newTrueAirspeed = parseFloat(newTrueAirspeedInput);
    const tripSegment = this.tripSegments.get(tripSegmentIndex);
    tripSegment.trueAirspeed = newTrueAirspeed;
    const trueCourse = this.findTripSegmentRouting(tripSegment).trueCourse;
    const distance = this.findTripSegmentRouting(tripSegment).distance;
    this.tripComputeService.updateMagneticHeading(tripSegment, trueCourse, distance);
  }

  setAltitude(tripSegmentIndex: number, newAltitudeInput: string) {
    //
    // TODO check wind direction must be between 0 .. 360, wind speed must be greater or equal to zero
    //
    const newAltitude = parseFloat(newAltitudeInput);
    const tripSegment = this.tripSegments.get(tripSegmentIndex);
    tripSegment.altitude = newAltitude;
    // no update needed
  }
}
