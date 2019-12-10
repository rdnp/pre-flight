export class Flight {

    name: string;
    origin: string;
    destination: string;
    alternate: string;
    aircraftType: string;
    _links: FlightLinks;

    constructor(name: string, origin: string, destination: string, alternate: string, aircraftType: string, _links: FlightLinks) {
        this.name = name;
        this.origin = origin;
        this.destination = destination;
        this.aircraftType = aircraftType;
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