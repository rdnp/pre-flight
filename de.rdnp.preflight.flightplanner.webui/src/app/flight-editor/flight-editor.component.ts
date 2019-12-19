import { Component, OnInit, Input } from '@angular/core';
import { Flight, RouteSegment, TripSegment } from 'src/data.model';
import { FlightService } from '../services/flight.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { RouteSegmentService } from '../services/route-segment.service';
import { TripComputerService } from '../services/trip-computer.service';
import { TripManager } from './trip-manager';

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

  @Input()
  selectedTripSegments: Map<string, boolean>;

  private tripManager: TripManager;

  constructor(private flightService: FlightService,
    // tslint:disable-next-line: align
    private routeSegmentService: RouteSegmentService,
    // tslint:disable-next-line: align
    private tripComputeService: TripComputerService,
    // tslint:disable-next-line: align
    private route: ActivatedRoute) {
    this.routeSegments = new Map();
    this.tripSegments = new Map();
    this.selectedTripSegments = new Map();
  }

  ngOnInit() {
    // example code below, needs some more action...
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.flightService.getFlightByName(params.get('name')))
    ).subscribe((result: Flight) => {
      this.flight = result;
      this.loadMissingRouteSegments();
      this.tripManager = new TripManager(this.flight, this.routeSegments, this.tripSegments);
    });
  }

  findLoadedRouteSegment(fromPointId: string, toPointId: string) {
    return this.tripManager.findLoadedRouteSegment(fromPointId, toPointId);
  }

  save() {
    this.flightService.saveFlight(this.flight).subscribe();
    // save only those route segments that this flight defines
    for (let i = 0; i < this.flight.pointIds.length - 1; i++) {
      this.routeSegmentService.saveRouteSegment(
        this.findLoadedRouteSegment(this.flight.pointIds[i], this.flight.pointIds[i + 1])).subscribe();
    }
  }

  insertPoint(index: number) {
    this.tripManager.insertPoint(index);
    this.flight.pointIds = this.tripManager.pointIds;
    this.loadMissingRouteSegments();
  }

  removePoint(index: number) {
    this.tripManager.removePoint(index);
    this.flight.pointIds = this.tripManager.pointIds;
    this.loadMissingRouteSegments();
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
      if (!this.findLoadedRouteSegment(fromPointId, toPointId)) {
        this.routeSegments.set(fromPointId + '\0' + toPointId, foundRouteSegment);
      }
      this.tripManager.findRelatedTripSegments(fromPointId, toPointId).forEach((leg) => {
        this.tripComputeService.updateMagneticCourse(leg, foundRouteSegment.trueCourse, foundRouteSegment.distance);
      });
    });
  }

  saveRouteSegment(fromPointId: string, toPointId: string) {
    this.routeSegmentService.saveRouteSegment(this.routeSegments.get(fromPointId + '\0' + toPointId));
  }

  trackByIndex(index: any) {
    return index;
  }

  getLegDistance(tripSegmentIndexInput: string) {
    const leg = this.tripManager.findTripSegment(tripSegmentIndexInput);
    return this.tripComputeService.distance(leg.time, leg.groundSpeed);
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
    this.tripManager.findRelatedTripSegments(fromPointId, toPointId).forEach(
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
    this.tripManager.findRelatedTripSegments(fromPointId, toPointId).forEach(
      (leg) => {
        leg.distance = distance;
        this.tripComputeService.updateTime(leg, routeSegment.distance);
      }
    );
  }

  setVariation(tripSegmentIndexInput: string, newVariationInput: string) {
    //
    // TODO check variation must be between -180 .. 180
    //
    const tripSegment = this.tripManager.findTripSegment(tripSegmentIndexInput);
    const newVariation = parseFloat(newVariationInput);
    const trueCourse = this.tripManager.findTripSegmentRouting(tripSegment).trueCourse;
    const distance = this.tripManager.findTripSegmentRouting(tripSegment).distance;
    tripSegment.variation = newVariation;
    this.tripComputeService.updateMagneticCourse(tripSegment, trueCourse, distance);
    this.selectedTripSegments.forEach((isSelected, indexInput) => {
      if (isSelected && this.tripManager.findTripSegment(indexInput).variation !== newVariation) {
        this.setVariation(indexInput, newVariationInput);
      }
    });
  }

  setFuelConsumptionRate(tripSegmentIndexInput: string, newFuelConsumpationRateInput: string) {
    //
    // TODO check FCR must be greater zero
    //
    const tripSegment = this.tripManager.findTripSegment(tripSegmentIndexInput);
    const newFuelConsumpationRate = parseFloat(newFuelConsumpationRateInput);
    tripSegment.fuelConsumptionRate = newFuelConsumpationRate;
    this.tripComputeService.updateFuel(tripSegment);
    this.selectedTripSegments.forEach((isSelected, indexInput) => {
      if (isSelected && this.tripManager.findTripSegment(indexInput).fuelConsumptionRate !== newFuelConsumpationRate) {
        console.log(isSelected);
        this.setFuelConsumptionRate(indexInput, newFuelConsumpationRateInput);
      }
    });
  }

  setWindVector(tripSegmentIndexInput: string, newWindDirectionInput: string, newWindSpeedInput: string) {
    //
    // TODO check wind direction must be between 0 .. 360, wind speed must be greater or equal to zero
    //
    const tripSegment = this.tripManager.findTripSegment(tripSegmentIndexInput);
    const newWindDirection = parseFloat(newWindDirectionInput);
    const newWindSpeed = parseFloat(newWindSpeedInput);
    tripSegment.windSpeed = newWindSpeed;
    tripSegment.windDirection = newWindDirection;
    const trueCourse = this.tripManager.findTripSegmentRouting(tripSegment).trueCourse;
    const distance = this.tripManager.findTripSegmentRouting(tripSegment).distance;
    this.tripComputeService.updateMagneticHeading(tripSegment, trueCourse, distance);
    this.selectedTripSegments.forEach((isSelected, indexInput) => {
      if (isSelected  && (this.tripManager.findTripSegment(indexInput).windDirection !== newWindDirection
          || this.tripManager.findTripSegment(indexInput).windSpeed !== newWindSpeed)) {
        this.setWindVector(indexInput, newWindDirectionInput, newWindSpeedInput);
      }
    });
  }

  setTrueAirspeed(tripSegmentIndexInput: string, newTrueAirspeedInput: string) {
    //
    // TODO check wind direction must be between 0 .. 360, wind speed must be greater or equal to zero
    //
    const tripSegment = this.tripManager.findTripSegment(tripSegmentIndexInput);
    const newTrueAirspeed = parseFloat(newTrueAirspeedInput);
    tripSegment.trueAirspeed = newTrueAirspeed;
    const trueCourse = this.tripManager.findTripSegmentRouting(tripSegment).trueCourse;
    const distance = this.tripManager.findTripSegmentRouting(tripSegment).distance;
    this.tripComputeService.updateMagneticHeading(tripSegment, trueCourse, distance);
    this.selectedTripSegments.forEach((isSelected, indexInput) => {
      if (isSelected && this.tripManager.findTripSegment(indexInput).trueAirspeed !== newTrueAirspeed) {
        this.setTrueAirspeed(indexInput, newTrueAirspeedInput);
      }
    });
  }

  setAltitude(tripSegmentIndexInput: string, newAltitudeInput: string) {
    //
    // TODO check wind direction must be between 0 .. 360, wind speed must be greater or equal to zero
    //
    const tripSegment = this.tripManager.findTripSegment(tripSegmentIndexInput);
    const newAltitude = parseFloat(newAltitudeInput);
    tripSegment.altitude = newAltitude;
    this.selectedTripSegments.forEach((isSelected, indexInput) => {
      if (isSelected && this.tripManager.findTripSegment(indexInput).altitude !== newAltitude) {
        this.setAltitude(indexInput, newAltitudeInput);
      }
    });
    // no computations depend on altitude
  }

  setTime(tripSegmentIndexInput: string, newTimeInput: string) {
    //
    // TODO check wind direction must be between 0 .. 360, wind speed must be greater or equal to zero
    //
    const tripSegment = this.tripManager.findTripSegment(tripSegmentIndexInput);
    const newTime = parseFloat(newTimeInput);
    const distance = this.tripManager.findTripSegmentRouting(tripSegment).distance;
    tripSegment.time = newTime;
    this.tripComputeService.updateTripSegmentWithNewTimeLimit(tripSegment, distance);
    // not propagating split to selection
  }
}
