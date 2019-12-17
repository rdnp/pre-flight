import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, concatMap } from 'rxjs/operators';
import { RouteSegmentRepositoryResponse, RouteSegment } from 'src/data.model';

@Injectable({
  providedIn: 'root'
})
export class RouteSegmentService {

  constructor(private http: HttpClient) { }

  findRouteSegment(sourcePointId: string, targetPointId: string) {
    const queryUrl = 'http://localhost:8080/route-segments/search/findBySourcePointIdAndTargetPointId?from='
      + sourcePointId + '&to=' + targetPointId;
    return this.http.get(queryUrl).pipe(
      // unwrap the response
      map((response: RouteSegmentRepositoryResponse) => {
        if (response._embedded['route-segments'].length > 0) {
          return response._embedded['route-segments'][0];
        }
        return {
          sourcePointId,
          targetPointId,
          minimumSafeAltitude: -1,
          trueCourse: -1,
          distance: -1,
          _links: undefined
        };
      })
    );
  }

  saveRouteSegment(toSave: RouteSegment) {
    return this.findRouteSegment(toSave.sourcePointId, toSave.targetPointId).pipe(concatMap((repositoryRouteSegment) => {
      if (repositoryRouteSegment._links) {
        // update existing route segment
        console.log(toSave);
        return this.http.put(repositoryRouteSegment._links.self.href, toSave);
      } else {
        // create new route segment
        console.log(toSave);
        return this.http.put('http://localhost:8080/route-segments/9223372036854775807', toSave);
      }
    }));
  }
}
