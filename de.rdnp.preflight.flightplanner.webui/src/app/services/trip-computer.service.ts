import { Injectable } from '@angular/core';
import { Vector, TripSegment } from 'src/data.model';

@Injectable({
  providedIn: 'root'
})
export class TripComputerService {

  constructor() { }

  magneticCourse(trueCourse: number, variation: number) {
    return (trueCourse + variation + 360) % 360;
  }

  fuelConsumed(hourlyRate: number, minutesFlown: number) {
    return hourlyRate * minutesFlown / 60;
  }

  timeInMinutes(distance: number, groundSpeed: number) {
    return distance / groundSpeed * 60;
  }

  distance(timeInMinutes: number, groundSpeed: number) {
    return timeInMinutes * groundSpeed / 60;
  }

  driftAngle(trueCourse: number, trueAirspeed: number, windVector: Vector) {
    const windAngleRadians = (trueCourse - windVector.direction + 180) * (Math.PI / 180);
    const windCorrectionAngleInRadians = Math.asin(windVector.speed * Math.sin(windAngleRadians) / trueAirspeed);
    return windCorrectionAngleInRadians / (Math.PI / 180);
  }

  magneticHeading(trueCourse: number, trueAirspeed: number, windVector: Vector, variation: number) {
    const magneticCourse = this.magneticCourse(trueCourse, variation);
    const driftAngle = this.driftAngle(trueCourse, trueAirspeed, windVector);
    return (magneticCourse + driftAngle + 360) % 360;
  }

  groundSpeed(trueCourse: number, trueAirspeed: number, windVector: Vector) {
    if (Math.round(trueCourse) === Math.round(windVector.direction)) {
      return trueAirspeed - windVector.speed;
    }
    const windAngleRadians = (trueCourse - windVector.direction + 180) * (Math.PI / 180);
    const windCorrectionAngleInRadians = this.driftAngle(trueCourse, trueAirspeed, windVector) * (Math.PI / 180);
    const sineOfWindAngleMinusWindCorrectionAngle = Math.sin(windAngleRadians + windCorrectionAngleInRadians);
    return sineOfWindAngleMinusWindCorrectionAngle / Math.sin(windAngleRadians) * trueAirspeed;
  }

  updateMagneticHeading(leg: TripSegment, trueCourse: number, distance: number) {
    leg.magneticHeading =
      this.magneticHeading(trueCourse, leg.trueAirspeed,
        { direction: leg.windDirection, speed: leg.windSpeed }, leg.variation);
    leg.groundSpeed =
      this.groundSpeed(trueCourse, leg.trueAirspeed,
        { direction: leg.windDirection, speed: leg.windSpeed });
    this.updateTime(leg, distance);
  }

  updateMagneticCourse(leg: TripSegment, trueCourse: number, distance: number) {
    leg.magneticCourse = this.magneticCourse(trueCourse, leg.variation);
    this.updateMagneticHeading(leg, trueCourse, distance);
  }

  updateTime(leg: TripSegment, distance: number) {
    if (!leg.parent) {
      let childDistance = 0;
      for (const child of leg.children) {
        childDistance += this.distance(child.timeInMinutes, child.groundSpeed);
      }
      leg.timeInMinutes = this.timeInMinutes(distance - childDistance, leg.groundSpeed);
    } else {
      this.updateTime(leg.parent, distance);
    }
    this.updateFuel(leg);
  }

  updateFuel(leg: TripSegment) {
    leg.fuel = this.fuelConsumed(leg.hourlyFuelConsumptionRate, leg.timeInMinutes);
  }

  private createChildTripSegmentWithNewTimeLimit(leg: TripSegment, distance: number) {
    const childLeg = new TripSegment();
    childLeg.windDirection = leg.windDirection;
    childLeg.windSpeed = leg.windSpeed;
    childLeg.altitude = leg.altitude;
    childLeg.hourlyFuelConsumptionRate = leg.hourlyFuelConsumptionRate;
    childLeg.trueAirspeed = leg.trueAirspeed;
    childLeg.variation = leg.variation;
    childLeg.magneticCourse = leg.magneticCourse;
    const childLegTrueCourse = (childLeg.magneticCourse - childLeg.variation + 360) % 360;
    this.updateMagneticCourse(childLeg, childLegTrueCourse, distance);
    leg.children.push(childLeg);
    childLeg.parent = leg;
    const childLegDistance = this.distance(leg.timeInMinutes, leg.groundSpeed);
    const parentLegDistance = distance - childLegDistance;
    childLeg.timeInMinutes = leg.timeInMinutes;
    leg.timeInMinutes = this.timeInMinutes(parentLegDistance, leg.groundSpeed);
    this.updateFuel(leg);
    this.updateFuel(childLeg);
  }

  private updateChildTripSegmentWithNewTimeLimit(leg: TripSegment, distance: number) {
    if (leg.timeInMinutes === 0) {
      for (let i = 0; i < leg.parent.children.length; i++) {
        if (leg.parent.children[i] === leg) {
          leg.parent.children.splice(i, 1);
        }
      }
    }
    const parentTrueCourse = (leg.parent.magneticCourse - leg.parent.variation + 360) % 360;
    this.updateMagneticCourse(leg.parent, parentTrueCourse, distance);
    const legTrueCourse = (leg.magneticCourse - leg.variation + 360) % 360;
    this.updateMagneticCourse(leg, legTrueCourse, distance);
  }

  updateTripSegmentWithNewTimeLimit(leg: TripSegment, distance: number) {
    if (leg.parent) {
      this.updateChildTripSegmentWithNewTimeLimit(leg, distance);
    } else {
      this.createChildTripSegmentWithNewTimeLimit(leg, distance);
    }
  }
}
