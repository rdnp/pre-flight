import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, concatMap } from 'rxjs/operators';
import { RouteSegmentRepositoryResponse, RouteSegment } from 'src/data.model';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteSegmentService {

  constructor(private http: HttpClient) { }

  /**
   * Tries finding the inverse route segment from the repository and derive a route segmentout of it.
   * Will return a new empty route segment if it finds no inverse route segment.
   */
  private deriveRouteSegmentFromInverse(sourcePointId: string, targetPointId: string) {
    const inverseQueryUrl = window.location.protocol + '//' + window.location.hostname + ':8080'
      + '/route-segments/search/findBySourcePointIdAndTargetPointId?from='
      + targetPointId + '&to=' + sourcePointId;
    return this.http.get(inverseQueryUrl).pipe(
      // unwrap the response
      map((inverseQueryResponse: RouteSegmentRepositoryResponse) => {
        if (inverseQueryResponse._embedded['route-segments'].length > 0) {
          return {
            sourcePointId,
            targetPointId,
            minimumSafeAltitude: inverseQueryResponse._embedded['route-segments'][0].minimumSafeAltitude,
            trueCourse: (inverseQueryResponse._embedded['route-segments'][0].trueCourse + 180) % 360,
            distance: inverseQueryResponse._embedded['route-segments'][0].distance,
            _links: undefined
          };
        }
        return {
          sourcePointId,
          targetPointId,
          minimumSafeAltitude: -1,
          trueCourse: -1,
          distance: -1,
          _links: undefined
        };
      }));
  }

  findRouteSegment(sourcePointId: string, targetPointId: string) {
    const queryUrl = window.location.protocol + '//' + window.location.hostname + ':8080'
      + '/route-segments/search/findBySourcePointIdAndTargetPointId?from='
      + sourcePointId + '&to=' + targetPointId;
    return this.http.get(queryUrl).pipe(
      // unwrap the response
      concatMap((response: RouteSegmentRepositoryResponse) => {
        if (response._embedded['route-segments'].length > 0) {
          return of(response._embedded['route-segments'][0]);
        }
        return this.deriveRouteSegmentFromInverse(sourcePointId, targetPointId);
      }));
  }

  saveRouteSegment(toSave: RouteSegment) {
    return this.findRouteSegment(toSave.sourcePointId, toSave.targetPointId).pipe(concatMap((repositoryRouteSegment) => {
      if (repositoryRouteSegment._links) {
        // update existing route segment
        return this.http.put(repositoryRouteSegment._links.self.href, toSave);
      } else {
        // create new route segment
        return this.http.put(window.location.protocol + '//' + window.location.hostname + ':8080'
          + '/route-segments/9223372036854775807', toSave);
      }
    }));
  }
}
