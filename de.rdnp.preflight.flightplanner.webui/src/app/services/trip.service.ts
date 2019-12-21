import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TripRepositoryResponse, Trip, TripSegment } from 'src/data.model';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  constructor(private http: HttpClient) { }

  findAllTripsForFlight(flightId: string) {
    const queryUrl = environment.repositoryUrl + '/trips/search/findByFlightId?id=' + parseFloat(flightId).toFixed(0);
    return this.http.get(queryUrl).pipe(
      map((response: TripRepositoryResponse) => {
        return response._embedded.trips;
      })
    );
  }

  deleteAllTripsForFlight(flightId: string) {
    const queryUrl = environment.repositoryUrl + '/trips/search/deleteByFlightId?id=' + flightId;
    return this.http.get(queryUrl);
  }

  private tripWithoutParentReferences(trip: Trip) {
    return JSON.parse(
      JSON.stringify(trip, (key, value) => {
        if (key === 'parent') {
          return undefined;
        }
        return value;
      }
      )) as Trip;
  }

  createTrip(trip: Trip) {
    return this.http.put(environment.repositoryUrl + '/trips/9223372036854775807', this.tripWithoutParentReferences(trip));
  }

  updateTrip(trip: Trip) {
    return this.http.put(trip._links.trip.href, this.tripWithoutParentReferences(trip));
  }

  deleteTrip(trip: Trip) {
    return this.http.delete(trip._links.self.href);
  }

  isEmptyTrip(trip: Trip) {
    let hasContent = false;
    if (trip.dateOfFlight || trip.estimatedOffBlockTime
      || trip.aircraftRegistration || trip.aircraftType) {
      hasContent = (trip.dateOfFlight.length > 0) || (trip.estimatedOffBlockTime.length > 0)
        || (trip.aircraftRegistration.length > 0) || (trip.aircraftType.length > 0);
    }
    let segmentsHaveContent = false;
    for (const tripSegment of trip.segments) {
      if ((tripSegment.altitude !== 0) || (tripSegment.variation !== 0) || (tripSegment.hourlyFuelConsumptionRate !== 0)
        || (tripSegment.windDirection !== 0) || (tripSegment.windSpeed !== 0) || (tripSegment.trueAirspeed !== 1)
        || (tripSegment.children.length > 0)) {
        segmentsHaveContent = true;
      }
      if (segmentsHaveContent) {
        break;
      }
    }
    return !hasContent && !segmentsHaveContent;
  }
}
