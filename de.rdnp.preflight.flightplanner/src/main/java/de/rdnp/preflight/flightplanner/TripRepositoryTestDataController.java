package de.rdnp.preflight.flightplanner;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class TripRepositoryTestDataController {

	private static final String PUT_NEW_URL = "http://localhost:8080/trips/9223372036854775807";

	private RestTemplate restTemplate = new RestTemplate();
	
	@Autowired
	private TripRepository repository;

	@Autowired
	private FlightRepository flightRepository;
	

	@CrossOrigin()
	@RequestMapping(path = "/setDefaultTestDataForTrips", method = RequestMethod.POST)
	public List<Trip> createDefaultTestDataForTrips() {
		List<Trip> testData = new ArrayList<>();
		
		Trip tripOne = new Trip();
		Flight flight = flightRepository.findByName("Flight.to.Schwaebisch.Hall").get(0);
		tripOne.setFlightId(flight.getId());
		tripOne.setDateOfFlight("2019-12-18");
		tripOne.setEstimatedOffBlockTime("10:10");
		tripOne.setAircraftRegistration("DESAE");
		tripOne.setAircraftType("C172");
		tripOne.setSegments(createFirstSampleTripToSchwaebischHall());
		testData.add(tripOne);
		restTemplate.put(PUT_NEW_URL, tripOne);
		
		Trip tripTwo = new Trip();
		tripTwo.setFlightId(flight.getId());
		tripTwo.setDateOfFlight("2019-12-19");
		tripTwo.setEstimatedOffBlockTime("06:50");
		tripTwo.setAircraftRegistration("DESAC");
		tripTwo.setAircraftType("C172");
		tripTwo.setSegments(createSecondSampleTripToSchwaebischHall());
		testData.add(tripTwo);
		restTemplate.put(PUT_NEW_URL, tripTwo);
		
		return testData;
	}
	
	private List<TripSegment> createFirstSampleTripToSchwaebischHall() {
		List<TripSegment> testTrip = new ArrayList<>();
		testTrip.add(createSegmentToLBU(testTrip));
		testTrip.add(createSegmentToDKB(testTrip));
		testTrip.add(createSegmentToEDTY(testTrip));
		return testTrip;
	}
	
	private List<TripSegment> createSecondSampleTripToSchwaebischHall() {
		List<TripSegment> testTrip = new ArrayList<>();
		TripSegment createSegmentToLBU = createSegmentToLBU(testTrip);
		createSegmentToLBU.setAltitude(5000);
		testTrip.add(createSegmentToLBU);
		TripSegment createSegmentToDKB = createSegmentToDKB(testTrip);
		createSegmentToDKB.setChildren(Collections.emptyList());
		createSegmentToDKB.setAltitude(5000);
		testTrip.add(createSegmentToDKB);
		TripSegment createSegmentToEDTY = createSegmentToEDTY(testTrip);
		createSegmentToEDTY.setAltitude(5000);
		testTrip.add(createSegmentToEDTY);
		return testTrip;
	}


	private TripSegment createSegmentToLBU(List<TripSegment> testTrip) {
		TripSegment newSegment = new TripSegment();
		newSegment.setVariation(2);
		newSegment.setHourlyFuelConsumptionRate(12);
		newSegment.setWindDirection(350);
		newSegment.setWindSpeed(10);
		newSegment.setTrueAirspeed(79);
		newSegment.setAltitude(3300);
		newSegment.setMagneticCourse(58);
		newSegment.setMagneticHeading(51);
		newSegment.setGroundSpeed(74);
		newSegment.setTimeInMinutes(4);
		newSegment.setFuel(0.8);
		newSegment.setChildren(Collections.emptyList());
		return newSegment;
	}
	
	private TripSegment createSegmentToDKB(List<TripSegment> testTrip) {
		TripSegment newSegment = new TripSegment();
		newSegment.setVariation(2);
		newSegment.setHourlyFuelConsumptionRate(9.8);
		newSegment.setWindDirection(350);
		newSegment.setWindSpeed(10);
		newSegment.setTrueAirspeed(117);
		newSegment.setAltitude(3300);
		newSegment.setMagneticCourse(68);
		newSegment.setMagneticHeading(63);
		newSegment.setGroundSpeed(114);
		newSegment.setTimeInMinutes(19);
		newSegment.setFuel(3.0);
		List<TripSegment> children = new ArrayList<TripSegment>();
		TripSegment childSegment = new TripSegment();
		childSegment.setVariation(2);
		childSegment.setHourlyFuelConsumptionRate(12);
		childSegment.setWindDirection(350);
		childSegment.setWindSpeed(10);
		childSegment.setTrueAirspeed(79);
		childSegment.setAltitude(3300);
		childSegment.setMagneticCourse(68);
		childSegment.setMagneticHeading(61);
		childSegment.setGroundSpeed(76);
		childSegment.setTimeInMinutes(2);
		childSegment.setFuel(0.4);
		children.add(childSegment);
		newSegment.setChildren(children);
		return newSegment;
	}

	private TripSegment createSegmentToEDTY(List<TripSegment> testTrip) {
		TripSegment newSegment = new TripSegment();
		newSegment.setVariation(2);
		newSegment.setHourlyFuelConsumptionRate(9.8);
		newSegment.setWindDirection(350);
		newSegment.setWindSpeed(10);
		newSegment.setTrueAirspeed(117);
		newSegment.setAltitude(3300);
		newSegment.setMagneticCourse(264);
		newSegment.setMagneticHeading(269);
		newSegment.setGroundSpeed(116);
		newSegment.setTimeInMinutes(9);
		newSegment.setFuel(1.5);
		newSegment.setChildren(Collections.emptyList());
		return newSegment;
	}

	@CrossOrigin()
	@RequestMapping(path = "/deleteAllTestDataForTrips", method = RequestMethod.POST)
	public void deleteAllTripTestData() {
		repository.deleteAll();
		System.out.println("All route-segment test data purged.");
	}
}
