export class InputValidator {

    validateCourse(courseInput: string, valueLabel: string): number {
        const courseValue = parseFloat(courseInput);
        if (courseValue < 0 || courseValue > 360) {
            alert('You entered "' + courseValue + '" as ' + valueLabel + ', which is outside the reasonable range.\n' +
                'Course values are given in degrees.\n' +
                'Values allowed are between 0 and 360.\n' +
                'Please correct the value, as invalid values will not be saved.\n' +
                'Refreshing this page will restore saved values.');
            return NaN;
        }
        return courseValue;
    }

    validateAltitude(altitudeInput: string, valueLabel: string): number {
        const altitudeValue = parseFloat(altitudeInput);
        if (altitudeValue < -2000 || altitudeValue > 100000) {
            alert('You entered "' + altitudeValue + '" as ' + valueLabel + ', which is outside the reasonable range.\n' +
                'Altitude values are given in feet above MSL.\n' +
                'Values allowed are between -2000 and 100000.\n' +
                'Please correct the value, as invalid values will not be saved.\n' +
                'Refreshing this page will restore saved values..');
            return NaN;
        }
        return altitudeValue;
    }

    validateDistance(distanceInput: string, valueLabel: string): number {
        const distanceValue = parseFloat(distanceInput);
        if (distanceValue < 0 || distanceValue > 23000) {
            alert('You entered "' + distanceValue + '" as ' + valueLabel + ', which is outside the reasonable range.\n' +
                'Distance values are given in NM.\n' +
                'Values allowed are between 0 and 23000.\n' +
                'Please correct the value, as invalid values will not be saved.\n' +
                'Refreshing this page will restore saved values..');
            return NaN;
        }
        return distanceValue;
    }

    validateRelativeBearing(relativeBearingInput: string, valueLabel: string): number {
        const relativeBearingValue = parseFloat(relativeBearingInput);
        if (relativeBearingValue < -180 || relativeBearingValue > 180) {
            alert('You entered "' + relativeBearingValue + '" as ' + valueLabel + ', which is outside the reasonable range.\n' +
                'Relative bearings are given in degrees.\n' +
                'Values allowed are between -180 and 180.\n' +
                'Please correct the value, as invalid values will not be saved.\n' +
                'Refreshing this page will restore saved values.');
            return NaN;
        }
        return relativeBearingValue;
    }

    validatePositiveNumber(positiveNumberInput: string, valueLabel: string): number {
        const positiveNumberValue = parseFloat(positiveNumberInput);
        if (positiveNumberValue <= 0) {
            alert('You entered "' + positiveNumberValue + '" as ' + valueLabel + ', which is outside the reasonable range.\n' +
                'Values allowed must be positive numbers (not including zero).\n' +
                'Please correct the value, as invalid values will not be saved.\n' +
                'Refreshing this page will restore saved values.');
            return NaN;
        }
        return positiveNumberValue;
    }

    validateSpeed(speedInput: string, valueLabel: string): number {
        const speedValue = parseFloat(speedInput);
        if (speedValue < 0 || speedValue > 582700000) {
            alert('You entered "' + speedValue + '" as ' + valueLabel + ', which is outside the reasonable range.\n' +
                'Speed values are given in knots.\n' +
                'Values allowed must be between zero and 582,700,000.\n' +
                'Please correct the value, as invalid values will not be saved.\n' +
                'Refreshing this page will restore saved values.');
            return NaN;
        }
        return speedValue;
    }

    validateTime(timeInput: string, valueLabel: string): number {
        const timeValue = parseFloat(timeInput);
        if (timeValue < 0 || timeValue > 27600) {
            alert('You entered "' + timeValue + '" as ' + valueLabel + ', which is outside the reasonable range.\n' +
                'Time values are given in minutes.\n' +
                'Values allowed must be between zero and 27,600.\n' +
                'Please correct the value, as invalid values will not be saved.\n' +
                'Refreshing this page will restore saved values.');
            return NaN;
        }
        return timeValue;
    }
}
