import { InputValidator } from './input-validator';

describe('InputValidator', () => {

    let validator: InputValidator;

    beforeEach(() => {
        validator = new InputValidator();
    });

    it('should validate that a course value is a number in degrees', () => {
        expect(validator.validateCourse('0', '')).toBe(0);
        expect(validator.validateCourse('360', '')).toBe(360);
        expect(validator.validateCourse('124', '')).toBe(124);
        expect(validator.validateCourse('-1', '')).toBeNaN();
        expect(validator.validateCourse('361', '')).toBeNaN();
        expect(validator.validateCourse('1000', '')).toBeNaN();
        expect(validator.validateCourse('a', '')).toBeNaN();
    });

    it('should validate that an altitude value is a number between -2000 and 100000', () => {
        expect(validator.validateAltitude('0', '')).toBe(0);
        expect(validator.validateAltitude('100000', '')).toBe(100000);
        expect(validator.validateAltitude('-2000', '')).toBe(-2000);
        expect(validator.validateAltitude('100001', '')).toBeNaN();
        expect(validator.validateAltitude('-2001', '')).toBeNaN();
        expect(validator.validateAltitude('a', '')).toBeNaN();
    });

    it('should validate that a distance value is a number between 0 and 23000', () => {
        expect(validator.validateDistance('0', '')).toBe(0);
        expect(validator.validateDistance('23000', '')).toBe(23000);
        expect(validator.validateDistance('2341', '')).toBe(2341);
        expect(validator.validateDistance('-1', '')).toBeNaN();
        expect(validator.validateDistance('23001', '')).toBeNaN();
        expect(validator.validateDistance('a', '')).toBeNaN();
    });

    it('should validate that a relative bearing value is a number between -180 and 180', () => {
        expect(validator.validateRelativeBearing('0', '')).toBe(0);
        expect(validator.validateRelativeBearing('180', '')).toBe(180);
        expect(validator.validateRelativeBearing('-180', '')).toBe(-180);
        expect(validator.validateRelativeBearing('-181', '')).toBeNaN();
        expect(validator.validateRelativeBearing('181', '')).toBeNaN();
        expect(validator.validateRelativeBearing('a', '')).toBeNaN();
    });

    it('should validate that a fuel consumption rate value is a positive number', () => {
        expect(validator.validatePositiveNumber('0.1', '')).toBe(0.1);
        expect(validator.validatePositiveNumber('100000', '')).toBe(100000);
        expect(validator.validatePositiveNumber('-1', '')).toBeNaN();
        expect(validator.validatePositiveNumber('0', '')).toBeNaN();
        expect(validator.validateRelativeBearing('a', '')).toBeNaN();
    });

    it('should validate that a speed is between zero and 582,700,000', () => {
        expect(validator.validateSpeed('0', '')).toBe(0);
        expect(validator.validateSpeed('582700000', '')).toBe(582700000);
        expect(validator.validateSpeed('582700001', '')).toBeNaN();
        expect(validator.validateSpeed('-1', '')).toBeNaN();
        expect(validator.validateSpeed('a', '')).toBeNaN();
    });

    it('should validate that a time is between zero and 27,600', () => {
        expect(validator.validateTime('0', '')).toBe(0);
        expect(validator.validateTime('27600', '')).toBe(27600);
        expect(validator.validateTime('-1', '')).toBeNaN();
        expect(validator.validateTime('27601', '')).toBeNaN();
        expect(validator.validateTime('a', '')).toBeNaN();
    });
});
