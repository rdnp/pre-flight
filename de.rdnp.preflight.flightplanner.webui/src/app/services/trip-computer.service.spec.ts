import { TestBed } from '@angular/core/testing';

import { TripComputerService } from './trip-computer.service';

describe('TripComputerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TripComputerService = TestBed.get(TripComputerService);
    expect(service).toBeTruthy();
  });

  it('should compute magnetic course out of true course and variation', () => {
    const service: TripComputerService = TestBed.get(TripComputerService);
    expect(service.magneticCourse(0, 0)).toBe(0);
    expect(service.magneticCourse(10, 2)).toBe(12);
    expect(service.magneticCourse(358, 4)).toBe(2);
    expect(service.magneticCourse(2, -4)).toBe(358);
  });

  it('should compute consumed fuel out of time and hourly fuel consumption rate', () => {
    const service: TripComputerService = TestBed.get(TripComputerService);
    expect(service.fuelConsumed(0, 0)).toBe(0);
    expect(service.fuelConsumed(10, 6)).toBe(1);
    expect(service.fuelConsumed(20, 60)).toBe(20);
  });

  it('should compute time out of distance and ground speed', () => {
    const service: TripComputerService = TestBed.get(TripComputerService);
    expect(service.timeInMinutes(0, 1)).toBe(0);
    expect(service.timeInMinutes(10, 120)).toBe(5);
    expect(service.timeInMinutes(140, 140)).toBe(60);
  });

  it('should compute wind correction angle out of true course, true airspeed and wind vector', () => {
    const service: TripComputerService = TestBed.get(TripComputerService);
    expect(Math.round(service.driftAngle(0, 100, { direction: 0, speed: 100 }))).toBe(0);
    expect(Math.round(service.driftAngle(90, 120, { direction: 0, speed: 30 }))).toBe(-14);
    expect(Math.round(service.driftAngle(120, 110, { direction: 170, speed: 10 }))).toBe(4);
    expect(Math.round(service.driftAngle(120, 110, { direction: 350, speed: 10 }))).toBe(-4);
    expect(Math.round(service.driftAngle(10, 200, { direction: 350, speed: 10 }))).toBe(-1);
    expect(Math.round(service.driftAngle(210, 80, { direction: 350, speed: 50 }))).toBe(24);
  });

  it('should compute ground speed out of true course, true airspeed and wind vector', () => {
    const service: TripComputerService = TestBed.get(TripComputerService);
    expect(Math.round(service.groundSpeed(10, 100, { direction: 10, speed: 50 }))).toBe(50);
    expect(Math.round(service.groundSpeed(10, 200, { direction: 350, speed: 10 }))).toBe(191);
    expect(Math.round(service.groundSpeed(210, 80, { direction: 350, speed: 50 }))).toBe(112);
  });

  it('should compute magnetic heading out of true course, true airspeed, wind vector, and variation', () => {
    const service: TripComputerService = TestBed.get(TripComputerService);
    expect(Math.round(service.magneticHeading(0, 100, { direction: 0, speed: 100 }, 0))).toBe(0);
    expect(Math.round(service.magneticHeading(90, 120, { direction: 0, speed: 30 }, 0))).toBe(76);
    expect(Math.round(service.magneticHeading(120, 110, { direction: 170, speed: 10 }, 0))).toBe(124);
    expect(Math.round(service.magneticHeading(120, 110, { direction: 350, speed: 10 }, 0))).toBe(116);
    expect(Math.round(service.magneticHeading(10, 200, { direction: 350, speed: 10 }, 0))).toBe(9);
    expect(Math.round(service.magneticHeading(210, 80, { direction: 350, speed: 50 }, 0))).toBe(234);
    expect(Math.round(service.magneticHeading(0, 200, { direction: 340, speed: 10 }, 0))).toBe(359);
    expect(Math.round(service.magneticHeading(0, 200, { direction: 340, speed: 10 }, 2))).toBe(1);
    expect(Math.round(service.magneticHeading(90, 120, { direction: 0, speed: 30 }, -4))).toBe(72);
  });

  const defaultTestTripSegment = {
    variation: 2,
    fuelConsumptionRate: 10,
    windDirection: 350,
    windSpeed: 10,
    trueAirspeed: 120,
    altitude: 3000,
    magneticCourse: 0,
    magneticHeading: 0,
    groundSpeed: 0,
    time: 0,
    fuel: 0
  };

  it('should update all derived values for a trip segment on magnetic course update', () => {
    const service: TripComputerService = TestBed.get(TripComputerService);
    defaultTestTripSegment.magneticCourse = 320;
    defaultTestTripSegment.variation = 2;
    service.updateMagneticCourse(defaultTestTripSegment, 318, 10);
    expect(Math.round(defaultTestTripSegment.magneticHeading)).toBe(323);
    expect(Math.round(defaultTestTripSegment.groundSpeed)).toBe(111);
    expect(Math.round(defaultTestTripSegment.time)).toBe(5);
    expect(defaultTestTripSegment.fuel).toBe(0.8333333333333334);
  });
});
