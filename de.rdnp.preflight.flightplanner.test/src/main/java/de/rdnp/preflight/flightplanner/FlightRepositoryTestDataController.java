package de.rdnp.preflight.flightplanner;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class FlightRepositoryTestDataController {
	
	private RestTemplate restTemplate = new RestTemplate();
	
	@CrossOrigin()
	@RequestMapping(path = "/setTestCase1", method = RequestMethod.POST)
	public List<Flight> getFlight() {
		List<Flight> testData = new ArrayList<Flight>();
		Flight flight = new Flight();
		flight.setName("Sample.Local.Flight");
		flight.setOrigin("EDTQ");
		flight.setDestination("EDTQ");
		restTemplate.put("http://localhost:8080/flights/9999999", flight);
		testData.add(flight);
		flight = new Flight();
		flight.setName("Flight.to.Berlin");
		flight.setDestination("EDDB");
		flight.setAircraftType("C172");
		restTemplate.put("http://localhost:8080/flights/9999999", flight);
		testData.add(flight);
		flight = new Flight();
		flight.setName("Flight.to.Schwaebisch.Hall");
		flight.setOrigin("EDTY");
		restTemplate.put("http://localhost:8080/flights/9999999", flight);
		testData.add(flight);
		System.out.println("Added data for test case 1");
		return testData;
	}

}
