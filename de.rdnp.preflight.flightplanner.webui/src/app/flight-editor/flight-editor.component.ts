import { Component, OnInit, Input } from '@angular/core';
import { Flight, RouteSegment, Trip } from 'src/data.model';
import { FlightService } from '../services/flight.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { RouteSegmentService } from '../services/route-segment.service';
import { TripComputerService } from '../services/trip-computer.service';
import { TripManager } from './trip-manager';
import { InputValidator } from './input-validator';
import { TripService } from '../services/trip.service';
import { SaveController } from './save-controller';
import { FlightEditorInput } from './flight-editor-input';

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
  tripList: Trip[];

  @Input()
  selectedTrip: Trip;

  @Input()
  selectedTripSegments: Map<string, boolean>;

  private tripManager: TripManager;

  private inputValidator: InputValidator;

  constructor(
    private flightService: FlightService,
    private routeSegmentService: RouteSegmentService,
    private tripComputeService: TripComputerService,
    private tripService: TripService,
    private route: ActivatedRoute) {
    this.routeSegments = new Map();
    this.selectedTripSegments = new Map();
    this.inputValidator = new InputValidator();
  }

  ngOnInit() {
    // example code below, needs some more action...
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.flightService.getFlightByName(params.get('name')))
    ).subscribe((result: Flight) => {
      this.flight = result;
      this.loadTripList();
      this.loadMissingRouteSegments();
      this.selectTrip('0');
    });
  }

  loadTripList() {
    this.tripList = [];
    this.tripList.push(new Trip(undefined, '', '', '', '', [], undefined));
    if (this.flight._links) {
      const flightId = this.flight._links.flight.href.substr(this.flight._links.flight.href.lastIndexOf('/') + 1);
      this.tripService.findAllTripsForFlight(flightId).subscribe((loadedTrips) => {
        this.tripList = this.tripList.concat(loadedTrips);
      });
    }
  }

  selectTrip(selection: string) {
    this.selectedTrip = this.tripList[parseFloat(selection)];
    this.tripManager = new TripManager(this.flight, this.routeSegments, this.selectedTrip);
  }

  findLoadedRouteSegment(fromPointId: string, toPointId: string) {
    return this.tripManager.findLoadedRouteSegment(fromPointId, toPointId);
  }

  save() {
    const input = new FlightEditorInput(this.flight, this.tripList, this.routeSegments);
    new SaveController(input, this.tripManager, this.flightService, this.tripService, this.routeSegmentService).createSaveAction()
      .subscribe(() => {
        this.loadTripList();
        this.selectTrip('0');
      });
  }

  insertPoint(index: number) {
    this.tripManager.insertPoint(index);
    this.flight.pointIds = this.tripManager.points;
    this.loadMissingRouteSegments();
  }

  removePoint(index: number) {
    this.tripManager.removePoint(index);
    this.flight.pointIds = this.tripManager.points;
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

  trackByIndex(index: any) {
    return index;
  }

  getTimeLimitedTripSegmentDistance(tripSegmentIndexInput: string) {
    const leg = this.tripManager.findTripSegment(tripSegmentIndexInput);
    return this.tripComputeService.distance(leg.timeInMinutes, leg.groundSpeed);
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
    const trueCourse = this.inputValidator.validateCourse(trueCourseInput, 'true course');
    if (isNaN(trueCourse) || (!this.findLoadedRouteSegment(fromPointId, toPointId))) {
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
    const minimumSafeAltitude = this.inputValidator.validateAltitude(minimumSafeAltitudeInput, 'minimum safe altitude');
    if (isNaN(minimumSafeAltitude) || !this.findLoadedRouteSegment(fromPointId, toPointId)) {
      return;
    }
    this.findLoadedRouteSegment(fromPointId, toPointId).minimumSafeAltitude = minimumSafeAltitude;
  }

  /**
   * Sets a distance to the route-segment specified by the two points.
   * Will not do anything if the route segment does not exist or if the given altitude is invalid (i.e. not between 0 and 23000).
   */
  setDistance(fromPointId: string, toPointId: string, distanceInput: string) {
    const distance = this.inputValidator.validateDistance(distanceInput, 'distance between points');
    if (isNaN(distance) || !this.findLoadedRouteSegment(fromPointId, toPointId)) {
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
    const newVariation = this.inputValidator.validateRelativeBearing(newVariationInput, 'magnetic variation');
    if (isNaN(newVariation)) {
      return;
    }
    const tripSegment = this.tripManager.findTripSegment(tripSegmentIndexInput);
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
    const newFuelConsumpationRate = this.inputValidator.validatePositiveNumber(newFuelConsumpationRateInput, 'fuel consumption rate');
    if (isNaN(newFuelConsumpationRate)) {
      return;
    }
    const tripSegment = this.tripManager.findTripSegment(tripSegmentIndexInput);
    tripSegment.hourlyFuelConsumptionRate = newFuelConsumpationRate;
    this.tripComputeService.updateFuel(tripSegment);
    this.selectedTripSegments.forEach((isSelected, indexInput) => {
      if (isSelected && this.tripManager.findTripSegment(indexInput).hourlyFuelConsumptionRate !== newFuelConsumpationRate) {
        this.setFuelConsumptionRate(indexInput, newFuelConsumpationRateInput);
      }
    });
  }

  setWindVector(tripSegmentIndexInput: string, newWindDirectionInput: string, newWindSpeedInput: string) {
    const newWindDirection = this.inputValidator.validateCourse(newWindDirectionInput, 'wind direction');
    const newWindSpeed = this.inputValidator.validateSpeed(newWindSpeedInput, 'wind speed');
    if (isNaN(newWindDirection) || isNaN(newWindSpeed)) {
      return;
    }
    const tripSegment = this.tripManager.findTripSegment(tripSegmentIndexInput);
    tripSegment.windSpeed = newWindSpeed;
    tripSegment.windDirection = newWindDirection;
    const trueCourse = this.tripManager.findTripSegmentRouting(tripSegment).trueCourse;
    const distance = this.tripManager.findTripSegmentRouting(tripSegment).distance;
    this.tripComputeService.updateMagneticHeading(tripSegment, trueCourse, distance);
    this.selectedTripSegments.forEach((isSelected, indexInput) => {
      if (isSelected && (this.tripManager.findTripSegment(indexInput).windDirection !== newWindDirection
        || this.tripManager.findTripSegment(indexInput).windSpeed !== newWindSpeed)) {
        this.setWindVector(indexInput, newWindDirectionInput, newWindSpeedInput);
      }
    });
  }

  setTrueAirspeed(tripSegmentIndexInput: string, newTrueAirspeedInput: string) {
    const newTrueAirspeed = this.inputValidator.validateSpeed(newTrueAirspeedInput, 'true airspeed');
    if (isNaN(newTrueAirspeed)) {
      return;
    }
    const tripSegment = this.tripManager.findTripSegment(tripSegmentIndexInput);
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
    const newAltitude = this.inputValidator.validateAltitude(newAltitudeInput, 'altitude');
    if (isNaN(newAltitude)) {
      return;
    }
    const tripSegment = this.tripManager.findTripSegment(tripSegmentIndexInput);
    tripSegment.altitude = newAltitude;
    this.selectedTripSegments.forEach((isSelected, indexInput) => {
      if (isSelected && this.tripManager.findTripSegment(indexInput).altitude !== newAltitude) {
        this.setAltitude(indexInput, newAltitudeInput);
      }
    });
    // no computations depend on altitude
  }

  setTime(tripSegmentIndexInput: string, newTimeInput: string) {
    const newTime = this.inputValidator.validateTime(newTimeInput, 'time');
    if (isNaN(newTime)) {
      return;
    }
    const tripSegment = this.tripManager.findTripSegment(tripSegmentIndexInput);
    const distance = this.tripManager.findTripSegmentRouting(tripSegment).distance;
    tripSegment.timeInMinutes = newTime;
    this.tripComputeService.updateTripSegmentWithNewTimeLimit(tripSegment, distance);
    // not propagating split to selection
  }
}
