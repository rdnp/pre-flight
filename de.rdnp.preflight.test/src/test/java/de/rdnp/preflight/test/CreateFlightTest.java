package de.rdnp.preflight.test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class CreateFlightTest {

	private static final int WAIT_TIMEOUT_SECONDS = 3;
	private static final int NUMBER_OF_RETRIES = 3;
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

		// close web driver
		driver.close();
	}

	/**
	 * Automation of introduction scenario according to user guide:
	 * https://github.com/rdnp/pre-flight/wiki/Flight-Planning:-First-Steps
	 */
	@Test
	public void createFlightFromScratch_AccordingToUserGuide_FlightInListAndHasAllDetails() {
		String flightName = "Flight to Schwäbisch Hall_" + System.currentTimeMillis();
		enterFlightInformation(flightName);

		saveFlightAndReturn(flightName);
		By linkToFlight = waitForLink(flightName);

		// re-open flight to check if parameters are still there.
		navigateToFlightFirstTrip(flightName);
		checkAllFlightAndTripDetails(flightName);

		// delete created flight
		saveFlightAndReturn(flightName);
		linkToFlight = waitForLink(flightName);
		deleteFlight(linkToFlight);
	}

	private By waitForLink(String flightName) {
		By linkToFlight = By.xpath("//a[text()='" + flightName + " (EDTQ -> EDTY)']");
		for (int i = 1; i <= NUMBER_OF_RETRIES; i++) {
			try {
				WebDriverWait waitForLink = new WebDriverWait(driver, WAIT_TIMEOUT_SECONDS);
				waitForLink.until(ExpectedConditions.elementToBeClickable(linkToFlight));
			} catch (TimeoutException e) {
				System.out.println("Attempt #" + i + " failed, retrying...");
				driver.get(Messages.getString("preflight.test.server.url"));
			}
		}
		assertTrue("The flight list should contain the newly created flight's name.",
				this.driver.getPageSource().contains(flightName));
		return linkToFlight;
	}

	private void deleteFlight(By linkToFlight) {
		String flightRowStringContent = this.driver.findElement(linkToFlight).getAttribute("id");
		By flightDeleteButton = By
				.id("flight-row-delete" + flightRowStringContent.substring(flightRowStringContent.lastIndexOf("-")));
		WebDriverWait waitForDelete = new WebDriverWait(driver, 5);
		waitForDelete.until(ExpectedConditions.visibilityOfElementLocated(flightDeleteButton));
		driver.findElement(flightDeleteButton).click();
	}

	/**
	 * Automation of introduction scenario according to user guide:
	 * https://github.com/rdnp/pre-flight/wiki/Flight-Planning:-First-Steps
	 * https://github.com/rdnp/pre-flight/wiki/Route-Planning:-First-Steps
	 * <p>
	 * Test case does both tutorials in a row without saving.
	 */
	@Test
	public void editFlightRouteSavingAtEnd_FlightAsInUserGuide_FlightContainsFlightRoute() {
		String flightName = "Flight to Schwäbisch Hall_" + System.currentTimeMillis();
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

		saveFlightAndReturn(flightName);
		navigateToFlightFirstTrip(flightName);
		checkDerivedFlightRouteInformation();

		// delete created flight
		saveFlightAndReturn(flightName);
		By linkToFlight = waitForLink(flightName);
		deleteFlight(linkToFlight);
	}

	/**
	 * Automation of renaming a flight containing some trip data by saving it under
	 * another name and then deleting the other flight.
	 */
	@Test
	public void renameFlight_FlightAsInUserGuide_FlightContainsFlightAndTrips() {
		String flightName = "Flight to Schwäbisch Hall_" + System.currentTimeMillis();
		String newFlightName = "Flight to Schwäbisch Hall_NEW_" + System.currentTimeMillis();
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
		saveFlightAndReturn(flightName);

		// check flight information, save under new name
		By linkToFlight = waitForLink(flightName);
		navigateToFlightFirstTrip(flightName);
		checkDerivedFlightRouteInformation();
		saveFlightAndReturn(newFlightName);

		// delete first created flight
		linkToFlight = waitForLink(flightName);
		deleteFlight(linkToFlight);

		// check new flight information
		By linkToNewFlight = waitForLink(newFlightName);
		navigateToFlightFirstTrip(newFlightName);
		checkDerivedFlightRouteInformation();
		saveFlightAndReturn(newFlightName);

		// delete new created flight
		deleteFlight(linkToNewFlight);
	}

	/**
	 * Automation of introduction scenario according to user guide:
	 * https://github.com/rdnp/pre-flight/wiki/Route-Planning:-First-Steps
	 * <p>
	 * Saves the flight once before starting the route editing.
	 */
	@Test
	public void editFlightRouteSavingInBetween_FlightAsInUserGuide_FlightContainsFlightRoute() {
		String flightName = "Flight to Schwäbisch Hall_" + System.currentTimeMillis();
		enterFlightInformation(flightName);
		saveFlightAndReturn(flightName);
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

		saveFlightAndReturn(flightName);
		navigateToFlightFirstTrip(flightName);
		checkDerivedFlightRouteInformation();

		// delete created flight
		saveFlightAndReturn(flightName);
		By linkToFlight = waitForLink(flightName);
		deleteFlight(linkToFlight);
	}

	/**
	 * Creates one flight according to user guide:
	 * https://github.com/rdnp/pre-flight/wiki/Flight-Planning:-First-Steps
	 * <p>
	 * After this, it deletes the flight and checks that it's no longer in the list.
	 */
	@Test
	public void createAndDeleteAFlight_FlightAsInUserGuide_FlightNoLongerShown() {
		String flightName = "Flight to Schwäbisch Hall_" + System.currentTimeMillis();
		enterFlightInformation(flightName);
		saveFlightAndReturn(flightName);

		WebDriverWait waitForLink = new WebDriverWait(driver, 5);
		By linkToFlight = By.xpath("//a[text()='" + flightName + " (EDTQ -> EDTY)']");
		waitForLink.until(ExpectedConditions.elementToBeClickable(linkToFlight));

		assertTrue("Flight should be shown in flight list before deletion.",
				this.driver.getPageSource().contains(flightName));

		String linkId = this.driver.findElement(linkToFlight).getAttribute("id");
		this.driver.findElement(By.id("flight-row-delete" + linkId.substring(linkId.lastIndexOf('-')))).click();

		WebDriverWait waitForLinkToBeRemoved = new WebDriverWait(driver, 5);
		waitForLinkToBeRemoved.until(ExpectedConditions.invisibilityOfElementLocated(linkToFlight));

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
		WebDriverWait waitForElementAdded = new WebDriverWait(driver, 5);
		By msaInput = By.id("route-msa-3");
		waitForElementAdded.until(ExpectedConditions.visibilityOfElementLocated(msaInput));
		this.driver.findElement(msaInput).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(msaInput).sendKeys("3300");
		this.driver.findElement(By.id("route-tc-3")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-tc-3")).sendKeys("160");
		this.driver.findElement(By.id("route-d-3")).sendKeys(Keys.BACK_SPACE, Keys.BACK_SPACE, Keys.BACK_SPACE,
				Keys.BACK_SPACE);
		this.driver.findElement(By.id("route-d-3")).sendKeys("20");
	}

	private void enterRouteFromPattonvilleToSchwaebischHall() {
		WebDriverWait waitForInputs = new WebDriverWait(driver, 5);
		waitForInputs.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.id("route-d-2")));

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
		WebDriverWait waitForLink = new WebDriverWait(driver, 5);
		By linkToFlight = By.xpath("//a[text()='" + flightName + " (EDTQ -> EDTY)']");
		waitForLink.until(ExpectedConditions.elementToBeClickable(linkToFlight));
		this.driver.findElement(linkToFlight).click();
		WebDriverWait waitForInput = new WebDriverWait(driver, 5);
		By tripSelector = By.id("trip-select");
		waitForInput.until(ExpectedConditions.elementToBeClickable(tripSelector));
		this.driver.findElement(tripSelector).sendKeys(Keys.DOWN);
	}

	private void enterFlightInformation(String flightName) {
		this.driver.findElement(By.xpath("//button[@color=\"primary\"]")).click();

		WebDriverWait waitForPageReady = new WebDriverWait(driver, 5);
		By flightOriginInput = By.id("flight-origin");
		waitForPageReady.until(ExpectedConditions.visibilityOfElementLocated(flightOriginInput));
		this.driver.findElement(flightOriginInput).sendKeys("EDTQ");
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

	private void saveFlightAndReturn(String flightName) {
		for (int i = 0; i < 100; i++) {
			this.driver.findElement(By.id("save-flight-name")).sendKeys(Keys.BACK_SPACE);
		}
		this.driver.findElement(By.id("save-flight-name")).sendKeys(flightName);
		this.driver.findElement(By.id("save-flight-button")).click();
		By returnButton = By.xpath("//button[@tabindex=0]");
		WebDriverWait waitForSaveButton = new WebDriverWait(driver, 5);
		waitForSaveButton.until(ExpectedConditions.elementToBeClickable(returnButton));
		this.driver.findElement(returnButton).click();
	}

}
