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
      Math.round(this.magneticHeading(trueCourse, leg.trueAirspeed,
        { direction: leg.windDirection, speed: leg.windSpeed }, leg.variation));
    leg.groundSpeed =
      Math.round(this.groundSpeed(trueCourse, leg.trueAirspeed,
        { direction: leg.windDirection, speed: leg.windSpeed }));
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
        childDistance += this.distance(child.time, child.groundSpeed);
      }
      leg.time = Math.round(this.timeInMinutes(distance - childDistance, leg.groundSpeed) );
    } else {
      this.updateTime(leg.parent, distance);
    }
    this.updateFuel(leg);
  }

  updateFuel(leg: TripSegment) {
    leg.fuel = this.fuelConsumed(leg.fuelConsumptionRate, leg.time);
  }

  splitTripSegmentOnTimeLimit(leg: TripSegment, distance: number) {
    if (leg.time === 0 && leg.parent) {
      for (let i = 0; i < leg.parent.children.length; i++) {
        if (leg.parent.children[i] === leg) {
          leg.parent.children.splice(i, 1);
        }
      }
    } else {
      const childLeg = new TripSegment();
      leg.children.push(childLeg);
      childLeg.parent = leg;
      // TODO - does the child inherit parent's params on split? e.g. TAS, wind, etc.?
      const childLegDistance = this.distance(leg.time, leg.groundSpeed);
      const parentLegDistance = distance - childLegDistance;
      childLeg.time = leg.time;
      leg.time = this.timeInMinutes(parentLegDistance, leg.groundSpeed);
      this.updateFuel(leg);
      this.updateFuel(childLeg);
    }
  }
}
