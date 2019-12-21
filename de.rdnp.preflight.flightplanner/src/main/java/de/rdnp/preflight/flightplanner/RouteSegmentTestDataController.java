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
public class RouteSegmentTestDataController {

	private static final String PUT_NEW_URL = "http://localhost:8080/route-segments/9223372036854775807";

	private RestTemplate restTemplate = new RestTemplate();

	@Autowired
	private RouteSegmentRepository repository;

	@CrossOrigin()
	@RequestMapping(path = "/setDefaultTestDataForRouteSegments", method = RequestMethod.POST)
	public List<RouteSegment> createDefaultTestDataForRouteSegments() {
		List<RouteSegment> testData = new ArrayList<RouteSegment>();
		RouteSegment testSegment = new RouteSegment();
		testSegment.setSourcePointId("EDTQ");
		testSegment.setTargetPointId("LBU");
		testSegment.setTrueCourse(56);
		testSegment.setDistance(5);
		testSegment.setMinimumSafeAltitude(3300);
		restTemplate.put(PUT_NEW_URL, testSegment);
		testData.add(testSegment);
		testSegment = new RouteSegment();
		testSegment.setSourcePointId("LBU");
		testSegment.setTargetPointId("DKB");
		testSegment.setTrueCourse(66);
		testSegment.setDistance(38);
		testSegment.setMinimumSafeAltitude(5000);
		restTemplate.put(PUT_NEW_URL, testSegment);
		testData.add(testSegment);
		testSegment = new RouteSegment();
		testSegment.setSourcePointId("DKB");
		testSegment.setTargetPointId("EDTY");
		testSegment.setTrueCourse(262);
		testSegment.setDistance(18);
		testSegment.setMinimumSafeAltitude(5000);
		restTemplate.put(PUT_NEW_URL, testSegment);
		testData.add(testSegment);
		testSegment = new RouteSegment();
		testSegment.setSourcePointId("EDTY");
		testSegment.setTargetPointId("EDTH");
		testSegment.setTrueCourse(160);
		testSegment.setDistance(20);
		testSegment.setMinimumSafeAltitude(3300);
		restTemplate.put(PUT_NEW_URL, testSegment);
		testData.add(testSegment);
		testSegment = new RouteSegment();
		testSegment.setSourcePointId("EDTH");
		testSegment.setTargetPointId("EDTQ");
		testSegment.setTrueCourse(275);
		testSegment.setDistance(28);
		testSegment.setMinimumSafeAltitude(3300);
		restTemplate.put(PUT_NEW_URL, testSegment);
		testData.add(testSegment);
		System.out.println("Added default route segment test data");
		return testData;
	}

	@CrossOrigin()
	@RequestMapping(path = "/deleteAllTestDataForRouteSegments", method = RequestMethod.POST)
	public void deleteAllRouteSegmentTestData() {
		repository.deleteAll();
		System.out.println("All route-segment test data purged.");
	}
}
