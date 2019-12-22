package de.rdnp.preflight.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class CreateFlightTest {

	private WebDriver driver;

	@Before
	public void setupEnvironment() {
		System.setProperty("webdriver.chrome.driver", Messages.getString("preflight.test.chrome.driver.path")); //$NON-NLS-1$ //$NON-NLS-2$
		driver = new ChromeDriver();
		driver.navigate().to(Messages.getString("preflight.test.server.url")); //$NON-NLS-1$
		// smoke test that main page can load
		assertTrue("The loaded page during the smoke test should contain \"Flight\".", //$NON-NLS-1$
				driver.getPageSource().contains("Flight"));
	}

	@After
	public void closeWebDriver() {
		if (driver.getPageSource().contains("Flight Details")) {
			// we are in Flight Editor, so navigate back to main page
			this.driver.findElement(By.xpath("//button[@tabindex=0]")).click();
		}
		
		// delete all generated flights on the system under test
		while (driver.getPageSource().contains("Delete")) {
			this.driver.findElement(By.xpath("//button[text()=' Delete ']")).click();
			// find create button (wait for page reload)
			this.driver.findElement(By.xpath("//button[@color=\"primary\"]"));
		}
		// close web driver
		driver.close();
	}

	/**
	 * Automation of introduction scenario according to user guide:
	 * https://github.com/rdnp/pre-flight/wiki/Flight-Planning:-First-Steps
	 */
	@Test
	public void createFlightFromScratch_AccordingToUserGuide_FlightInListAndHasAllDetails() {
		String flightName = "Flight to Schw�bisch Hall_" + System.currentTimeMillis();
		enterFlightInformation(flightName);

		saveFlightAndReturn();

		assertTrue("The flight list should contain the newly created flight's name.",
				this.driver.getPageSource().contains(flightName));

		// re-open flight to check if parameters are still there.
		navigateToFlightFirstTrip(flightName);
		checkAllFlightAndTripDetails(flightName);
	}

	/**
	 * Automation of introduction scenario according to user guide:
	 * https://github.com/rdnp/pre-flight/wiki/Flight-Planning:-First-Steps
	 * https://github.com/rdnp/pre-flight/wiki/Route-Planning:-First-Steps
	 * <p>
	 * Test case does both tutorials in a row without saving.
	 */
	@Test
	public void editFlightRoute_AccordingToUserGuideSavingAtEnd_FlightContainsFlightRoute() {
		String flightName = "Flight to Schw�bisch Hall_" + System.currentTimeMillis();
		enterFlightInformation(flightName);
		checkAllFlightAndTripDetails(flightName);

		// add two points
		this.driver.findElement(By.xpath("//button[text()='+']")).click();
		this.driver.findElement(By.xpath("//button[text()='+']")).click();

		// set point and route details
		enterRouteFromPattonvilleToSchwaebischHall();
		addAlternateSegmentToHeubach();
		addTripInformation();

		checkDerivedFlightRouteInformation();

		saveFlightAndReturn();
		navigateToFlightFirstTrip(flightName);
		checkDerivedFlightRouteInformation();
	}

	/**
	 * Automation of introduction scenario according to user guide:
	 * https://github.com/rdnp/pre-flight/wiki/Route-Planning:-First-Steps
	 * <p>
	 * Saves the flight once before starting the route editing.
	 */
	@Test
	public void editFlightRoute_AccordingToUserGuideSavingInBetween_FlightContainsFlightRoute() {
		String flightName = "Flight to Schw�bisch Hall_" + System.currentTimeMillis();
		enterFlightInformation(flightName);
		saveFlightAndReturn();
		navigateToFlightFirstTrip(flightName);
		checkAllFlightAndTripDetails(flightName);

		// add two points
		this.driver.findElement(By.xpath("//button[text()='+']")).click();
		this.driver.findElement(By.xpath("//button[text()='+']")).click();

		// set point and route details
		enterRouteFromPattonvilleToSchwaebischHall();
		addAlternateSegmentToHeubach();
		addTripInformation();

		checkDerivedFlightRouteInformation();

		saveFlightAndReturn();
		navigateToFlightFirstTrip(flightName);
		checkDerivedFlightRouteInformation();
	}

	/**
	 * Creates one flight according to user guide:
	 * https://github.com/rdnp/pre-flight/wiki/Flight-Planning:-First-Steps
	 * <p>
	 * After this, it deletes the flight and checks that it's no longer in the list.
	 */
	@Test
	public void createAndDeleteAFlight_FlightAsInUserGuide_FlightNoLongerShown() {
		String flightName = "Flight to Schw�bisch Hall_" + System.currentTimeMillis();
		enterFlightInformation(flightName);
		saveFlightAndReturn();
		
		assertTrue("Flight should be shown in flight list before deletion.", this.driver.getPageSource().contains(flightName));

		String linkId = this.driver.findElement(By.xpath("//a[text()='" + flightName + " (EDTQ -> EDTY)']"))
				.getAttribute("id");
		this.driver.findElement(By.id("flight-row-delete" + linkId.substring(linkId.lastIndexOf('-')))).click();
		// find create button (wait for page reload)
		this.driver.findElement(By.xpath("//button[@color=\"primary\"]"));

		assertFalse("Flight should no longer be shown after deletion.",
				this.driver.getPageSource().contains(flightName));
	}

	private void checkDerivedFlightRouteInformation() {
		assertEquals("54", this.driver.findElement(By.id("trip-mc-0")).getAttribute("value"));
		assertEquals("50", this.driver.findElement(By.id("trip-mh-0")).getAttribute("value"));
		assertEquals("79", this.driver.findElement(By.id("trip-gs-0")).getAttribute("value"));
		assertEquals("4", this.driver.findElement(By.id("trip-t-0")).getAttribute("value"));
		assertEquals("1.0", this.driver.findElement(By.id("trip-f-0")).getAttribute("value"));

		assertEquals("68", this.driver.findElement(By.id("trip-mc-1.0")).getAttribute("value"));
		assertEquals("65", this.driver.findElement(By.id("trip-mh-1.0")).getAttribute("value"));
		assertEquals("80", this.driver.findElement(By.id("trip-gs-1.0")).getAttribute("value"));
		assertEquals("4", this.driver.findElement(By.id("trip-t-1.0")).getAttribute("value"));
		assertEquals("1.1", this.driver.findElement(By.id("trip-f-1.0")).getAttribute("value"));

		assertEquals("68", this.driver.findElement(By.id("trip-mc-1")).getAttribute("value"));
		assertEquals("63", this.driver.findElement(By.id("trip-mh-1")).getAttribute("value"));
		assertEquals("114", this.driver.findElement(By.id("trip-gs-1")).getAttribute("value"));
		assertEquals("17", this.driver.findElement(By.id("trip-t-1")).getAttribute("value"));
		assertEquals("3.4", this.driver.findElement(By.id("trip-f-1")).getAttribute("value"));

		assertEquals("264", this.driver.findElement(By.id("trip-mc-2")).getAttribute("value"));
		assertEquals("269", this.driver.findElement(By.id("trip-mh-2")).getAttribute("value"));
		assertEquals("116", this.driver.findElement(By.id("trip-gs-2")).getAttribute("value"));
		assertEquals("9", this.driver.findElement(By.id("trip-t-2")).getAttribute("value"));
		assertEquals("1.9", this.driver.findElement(By.id("trip-f-2")).getAttribute("value"));

		assertEquals("162", this.driver.findElement(By.id("trip-mc-3")).getAttribute("value"));
		assertEquals("161", this.driver.findElement(By.id("trip-mh-3")).getAttribute("value"));
		assertEquals("127", this.driver.findElement(By.id("trip-gs-3")).getAttribute("value"));
		assertEquals("9", this.driver.findElement(By.id("trip-t-3")).getAttribute("value"));
		assertEquals("1.9", this.driver.findElement(By.id("trip-f-3")).getAttribute("value"));
	}

	private void addTripInformation() {
		// magnetic variation for all legs
		this.driver.findElement(By.id("trip-edit-1")).click();
		this.driver.findElement(By.id("trip-edit-2")).click();
		this.driver.findElement(By.id("trip-edit-3")).click();
		this.driver.findElement(By.id("trip-var-0")).sendKeys("2");
		// cruise legs
		this.driver.findElement(By.id("trip-fcr-1")).sendKeys("12");
		this.driver.findElement(By.id("trip-wv-direction-1")).sendKeys("350");
		this.driver.findElement(By.id("trip-wv-speed-1")).sendKeys("10");
		this.driver.findElement(By.id("trip-tas-1")).sendKeys(Keys.BACK_SPACE, "117");
		this.driver.findElement(By.id("trip-alt-1")).sendKeys("5000");
		this.driver.findElement(By.id("trip-edit-1")).click();
		this.driver.findElement(By.id("trip-edit-2")).click();
		this.driver.findElement(By.id("trip-edit-3")).click();
		// add leg for climb
		this.driver.findElement(By.id("trip-t-1")).sendKeys(Keys.BACK_SPACE);
		this.driver.findElement(By.id("trip-t-1.0")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, "4");
		this.driver.findElement(By.id("trip-edit-1.0")).click();
		this.driver.findElement(By.id("trip-fcr-0")).sendKeys("16");
		this.driver.findElement(By.id("trip-wv-direction-0")).sendKeys("320");
		this.driver.findElement(By.id("trip-wv-speed-0")).sendKeys("5");
		this.driver.findElement(By.id("trip-tas-0")).sendKeys(Keys.BACK_SPACE, "79");
		this.driver.findElement(By.id("trip-edit-1.0")).click();
		this.driver.findElement(By.id("trip-alt-0")).sendKeys("3300");
	}

	private void addAlternateSegmentToHeubach() {
		this.driver.findElement(By.xpath("//table//tr[6]//button")).click();
		this.driver.findElement(By.id("point-name-3")).sendKeys("EDTY");
		this.driver.findElement(By.id("point-name-4")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("point-name-4")).sendKeys("EDTH");
		this.driver.findElement(By.id("route-msa-3")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-msa-3")).sendKeys("3300");
		this.driver.findElement(By.id("route-tc-3")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-tc-3")).sendKeys("160");
		this.driver.findElement(By.id("route-d-3")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-d-3")).sendKeys("20");
	}

	private void enterRouteFromPattonvilleToSchwaebischHall() {
		this.driver.findElement(By.id("point-name-1")).sendKeys("LBU");
		this.driver.findElement(By.id("point-name-2")).sendKeys("DKB");
		this.driver.findElement(By.id("route-msa-0")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-msa-0")).sendKeys("3300");
		this.driver.findElement(By.id("route-msa-1")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-msa-1")).sendKeys("5000");
		this.driver.findElement(By.id("route-msa-2")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-msa-2")).sendKeys("3300");
		this.driver.findElement(By.id("route-tc-0")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-tc-0")).sendKeys("052");
		this.driver.findElement(By.id("route-tc-1")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-tc-1")).sendKeys("066");
		this.driver.findElement(By.id("route-tc-2")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-tc-2")).sendKeys("262");
		this.driver.findElement(By.id("route-d-0")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-d-0")).sendKeys("5");
		this.driver.findElement(By.id("route-d-1")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-d-1")).sendKeys("38");
		this.driver.findElement(By.id("route-d-2")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-d-2")).sendKeys("18");
	}

	private void checkAllFlightAndTripDetails(String flightName) {
		assertEquals("EDTQ", this.driver.findElement(By.id("flight-origin")).getAttribute("value"));
		assertEquals("EDTY", this.driver.findElement(By.id("flight-destination")).getAttribute("value"));
		assertEquals("EDTH", this.driver.findElement(By.id("flight-alternate")).getAttribute("value"));
		assertEquals("EDTQ", this.driver.findElement(By.id("point-name-0")).getAttribute("value"));
		assertEquals("EDTY", this.driver.findElement(By.id("point-name-1")).getAttribute("value"));

		assertEquals("DESAE", this.driver.findElement(By.id("trip-ac-reg")).getAttribute("value"));
		assertEquals("C172", this.driver.findElement(By.id("trip-ac-type")).getAttribute("value"));
		assertEquals("2019-12-24", this.driver.findElement(By.id("trip-date")).getAttribute("value"));
		assertEquals("12:00", this.driver.findElement(By.id("trip-eobt")).getAttribute("value"));
	}

	private void navigateToFlightFirstTrip(String flightName) {
		this.driver.findElement(By.xpath("//a[text()='" + flightName + " (EDTQ -> EDTY)']")).click();
		assertEquals(flightName, this.driver.findElement(By.id("save-flight-name")).getAttribute("value"));
		this.driver.findElement(By.id("trip-select")).sendKeys(Keys.DOWN);
	}

	private void enterFlightInformation(String flightName) {
		this.driver.findElement(By.xpath("//button[@color=\"primary\"]")).click();
		this.driver.findElement(By.id("flight-origin")).sendKeys("EDTQ");
		this.driver.findElement(By.id("flight-destination")).sendKeys("EDTY");
		this.driver.findElement(By.id("flight-alternate")).sendKeys("EDTH");
		this.driver.findElement(By.id("point-name-0")).sendKeys("EDTQ");
		this.driver.findElement(By.id("point-name-1")).sendKeys("EDTY");
		this.driver.findElement(By.id("save-flight-name")).sendKeys(flightName);
		this.driver.findElement(By.id("trip-date")).sendKeys("24122019");
		this.driver.findElement(By.id("trip-eobt")).sendKeys("1200");
		this.driver.findElement(By.id("trip-ac-reg")).sendKeys("DESAE");
		this.driver.findElement(By.id("trip-ac-type")).sendKeys("C172");
	}

	private void saveFlightAndReturn() {
		this.driver.findElement(By.id("save-flight-button")).click();
		this.driver.findElement(By.xpath("//button[@tabindex=0]")).click();
	}
}