package de.rdnp.preflight.flightplanner;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FlightController {
	
	@RequestMapping(path = "/whereto", method = RequestMethod.GET)
	public Flight getFlight() {
		return new Flight();
	}

}
