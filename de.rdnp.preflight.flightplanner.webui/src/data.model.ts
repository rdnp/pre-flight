export interface Vector {
    direction: number;
    speed: number;
}

export class Trip {
    flightId: string;
    dateOfFlight: string;
    estimatedOffBlockTime: string;
    aircraftRegistration: string;
    aircraftType: string;
    segments: TripSegment[];
    // tslint:disable-next-line: variable-name
    _links: TripLinks;
    deleted: boolean;

    constructor(
        flightId: string,
        dateOfFlight: string,
        estimatedOffBlockTime: string,
        aircraftRegistration: string,
        aircraftType: string,
        segments: TripSegment[],
        // tslint:disable-next-line: variable-name
        _links: TripLinks) {
        this.flightId = flightId;
        this.segments = segments;
        this.dateOfFlight = dateOfFlight;
        this.estimatedOffBlockTime = estimatedOffBlockTime;
        this.aircraftRegistration = aircraftRegistration;
        this.aircraftType = aircraftType;
        this._links = _links;
    }
}

export interface TripList {
    trips: Trip[];
}

export interface TripRepositoryResponse {
    _embedded: TripList;
}

export interface TripLinks {
    self: Link;
    trip: Link;
}

export class TripSegment {
    variation: number;
    hourlyFuelConsumptionRate: number;
    windDirection: number;
    windSpeed: number;
    trueAirspeed: number;
    altitude: number;
    magneticCourse: number;
    magneticHeading: number;
    groundSpeed: number;
    timeInMinutes: number;
    fuel: number;
    children: TripSegment[];
    parent: TripSegment;

    constructor() {
        this.variation = 0;
        this.hourlyFuelConsumptionRate = 0;
        this.windDirection = 0;
        this.windSpeed = 0;
        this.trueAirspeed = 1;
        this.altitude = 0;
        this.magneticCourse = 0;
        this.magneticHeading = 0;
        this.groundSpeed = 0;
        this.timeInMinutes = 0;
        this.fuel = 0;
        this.children = [];
        this.parent = undefined;
    }
}

export interface RouteSegment {
    sourcePointId: string;
    targetPointId: string;
    trueCourse: number;
    distance: number;
    minimumSafeAltitude: number;
    _links: RouteSegmentLinks;
}

export interface RouteSegmentList {
    'route-segments': RouteSegment[];
}

export interface RouteSegmentRepositoryResponse {
    _embedded: RouteSegmentList;
}

export interface RouteSegmentLinks {
    self: Link;
    'route-segment': Link;
}

export class Flight {

    name: string;
    origin: string;
    destination: string;
    alternate: string;
    pointIds: string[];

    // tslint:disable-next-line: variable-name
    _links: FlightLinks; // variable from Spring repository

    constructor(
        name: string, origin: string, destination: string, alternate: string, pointIds: string[],
        // tslint:disable-next-line: variable-name
        _links: FlightLinks) {
        this.name = name;
        this.origin = origin;
        this.destination = destination;
        this.pointIds = pointIds;
        this.alternate = alternate;
    }
}

export interface FlightLinks {
    self: Link;
    flight: Link;
}

export interface Link {
    href: string;
}

export interface FlightList {
    flights: Flight[];
}

export interface FlightRepositoryResponse {
    _embedded: FlightList;
}
