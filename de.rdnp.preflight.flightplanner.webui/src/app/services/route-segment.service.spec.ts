import { TestBed } from '@angular/core/testing';

import { RouteSegmentService } from './route-segment.service';

describe('RouteSegmentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RouteSegmentService = TestBed.get(RouteSegmentService);
    expect(service).toBeTruthy();
  });

  // TODO find route segments on test data

  // TODO save route segment

});
