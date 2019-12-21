package de.rdnp.preflight.flightplanner;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class FlightRepositoryTestDataController {
	
	private static final String PUT_NEW_URL = "http://localhost:8080/flights/9223372036854775807";
	
	private RestTemplate restTemplate = new RestTemplate();

	@Autowired 
	private FlightRepository repository;
	
	@CrossOrigin()
	@RequestMapping(path = "/setDefaultTestDataForFlights", method = RequestMethod.POST)
	public List<Flight> getFlight() {
		List<Flight> testData = new ArrayList<Flight>();
		List<String> pointIds = new ArrayList<String>();
		Flight flight = new Flight();
		flight.setName("Sample.Local.Flight");
		flight.setOrigin("EDTQ");
		flight.setDestination("EDTQ");
		pointIds.add("EDTQ");
		pointIds.add("EDTQ");
		flight.setPointIds(pointIds);
		restTemplate.put(PUT_NEW_URL, flight);
		testData.add(flight);
		flight.setName("Flight.to.Berlin");
		flight.setDestination("EDDB");
		pointIds.clear();
		pointIds.add("EDTQ");
		pointIds.add("EDDB");
		restTemplate.put(PUT_NEW_URL, flight);
		testData.add(flight);
		flight.setName("Flight.to.Schwaebisch.Hall");
		flight.setOrigin("EDTQ");
		flight.setDestination("EDTY");
		flight.setAlternate("EDTH");
		pointIds.clear();
		pointIds.add("EDTQ");
		pointIds.add("LBU");
		pointIds.add("DKB");
		pointIds.add("EDTY");
		pointIds.add("EDTH");
		restTemplate.put(PUT_NEW_URL, flight);
		testData.add(flight);
		System.out.println("Added data for test case 1");
		return testData;
	}

	@CrossOrigin()
	@RequestMapping(path = "/deleteAllTestDataForFlights", method = RequestMethod.POST)
	public void deleteAllRouteSegmentTestData() {
		repository.deleteAll();
		System.out.println("All flight test data purged.");
	}

}
