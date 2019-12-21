import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';


import { RouteSegmentService } from './route-segment.service';
import { RouteSegment } from 'src/data.model';

describe('RouteSegmentService', () => {

  let service: RouteSegmentService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ]
    });
    service = TestBed.get(RouteSegmentService);
  }));

  // 'Load test data into test server'
  beforeEach(async(inject([HttpClient], (client: HttpClient) => {
    const enableTestData = client.post('http://localhost:8080/setDefaultTestDataForRouteSegments', '');
    enableTestData.subscribe(() => { console.log('Test data for route segments loaded'); }, console.log);
  })));

  // 'Purge test data from test server'
  afterEach(async(inject([HttpClient], (client: HttpClient) => {
    const deleteTestData = client.post('http://localhost:8080/deleteAllTestDataForRouteSegments', '');
    deleteTestData.subscribe(() => { console.log('Test data for route-segments deleted'); }, console.log);
  })));

  it('should find all route segments from the repository', async(() => {
    // check three route segments from the default test data
    service.findRouteSegment('DKB', 'EDTY').subscribe((foundSegment: RouteSegment) => {
      expect(foundSegment.sourcePointId).toBe('DKB');
      expect(foundSegment.targetPointId).toBe('EDTY');
      expect(foundSegment.distance).toBe(18);
      expect(foundSegment.trueCourse).toBe(262);
      expect(foundSegment.minimumSafeAltitude).toBe(5000);
    });

    service.findRouteSegment('EDTQ', 'LBU').subscribe((foundSegment: RouteSegment) => {
      expect(foundSegment.sourcePointId).toBe('EDTQ');
      expect(foundSegment.targetPointId).toBe('LBU');
      expect(foundSegment.distance).toBe(5);
      expect(foundSegment.trueCourse).toBe(56);
      expect(foundSegment.minimumSafeAltitude).toBe(3300);
    });

    service.findRouteSegment('EDTH', 'EDTQ').subscribe((foundSegment: RouteSegment) => {
      expect(foundSegment.sourcePointId).toBe('EDTH');
      expect(foundSegment.targetPointId).toBe('EDTQ');
      expect(foundSegment.distance).toBe(28);
      expect(foundSegment.trueCourse).toBe(275);
      expect(foundSegment.minimumSafeAltitude).toBe(3300);
    });

    // cross-check with non-existing route segment
    service.findRouteSegment('LOWI', 'KJFK').subscribe((foundSegment: RouteSegment) => {
      expect(foundSegment.sourcePointId).toBe('LOWI');
      expect(foundSegment.targetPointId).toBe('KJFK');
      expect(foundSegment.distance).toBe(-1);
      expect(foundSegment.trueCourse).toBe(-1);
      expect(foundSegment.minimumSafeAltitude).toBe(-1);
    });
  }));

  it('should respond with the reverse to an existing route segment in the repository as a fallback', async(() => {
    service.findRouteSegment('EDTY', 'DKB').subscribe((foundSegment: RouteSegment) => {
      expect(foundSegment.sourcePointId).toBe('EDTY');
      expect(foundSegment.targetPointId).toBe('DKB');
      expect(foundSegment.distance).toBe(18);
      expect(foundSegment.trueCourse).toBe(82);
      expect(foundSegment.minimumSafeAltitude).toBe(5000);
    });
  }));

  it('should save route segments to the repository', async(() => {
    // modify existing route segment
    service.findRouteSegment('DKB', 'EDTY').subscribe((foundSegment: RouteSegment) => {
      foundSegment.distance = 15;
      service.saveRouteSegment(foundSegment).subscribe(() => {
        service.findRouteSegment('DKB', 'EDTY').subscribe((secondCallsFoundSegment: RouteSegment) => {
          expect(secondCallsFoundSegment.sourcePointId).toBe('DKB');
          expect(secondCallsFoundSegment.targetPointId).toBe('EDTY');
          expect(secondCallsFoundSegment.distance).toBe(15);
          expect(secondCallsFoundSegment.trueCourse).toBe(262);
          expect(secondCallsFoundSegment.minimumSafeAltitude).toBe(5000);
        });
      });
    });

    // create with non-existing route segment
    const newSegment: RouteSegment = {
      sourcePointId: 'LOWI',
      targetPointId: 'KJFK',
      minimumSafeAltitude: 18000,
      trueCourse: 290,
      distance: 2700,
      _links: undefined
    };
    service.saveRouteSegment(newSegment).subscribe(() => {
      service.findRouteSegment('LOWI', 'KJFK').subscribe((foundSegment: RouteSegment) => {
        expect(foundSegment.sourcePointId).toBe('LOWI');
        expect(foundSegment.targetPointId).toBe('KJFK');
        expect(foundSegment.distance).toBe(2700);
        expect(foundSegment.trueCourse).toBe(290);
        expect(foundSegment.minimumSafeAltitude).toBe(18000);
      });
    });
  }));

});
