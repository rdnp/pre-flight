package de.rdnp.preflight.flightplanner;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class FlightRepositoryMockController {
	
	private RestTemplate restTemplate = new RestTemplate();
	
	@CrossOrigin()
	@RequestMapping(path = "/setTestCase1", method = RequestMethod.POST)
	public List<Flight> getFlight() {
		List<Flight> testData = new ArrayList<Flight>();
		Flight flight = new Flight();
		restTemplate.put("http://localhost:8080/flights/9999999", flight);
		testData.add(flight);
		flight = new Flight();
		flight.setDestination("EDDB");
		restTemplate.put("http://localhost:8080/flights/9999999", flight);
		testData.add(flight);
		flight = new Flight();
		flight.setStart("EDTY");
		restTemplate.put("http://localhost:8080/flights/9999999", flight);
		testData.add(flight);
		System.out.println("Added data for test case 1");
		return testData;
	}

}
