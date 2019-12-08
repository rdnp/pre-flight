package de.rdnp.preflight.test;

import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class PreFlightSystemTest {

	/**
	 * Simply checks the Selenium setup, will later be replaced by some real tests
	 */
	@Test
	public void sampleTest() {
		System.setProperty("webdriver.chrome.driver", "../chromedriver/chromedriver.exe");
		WebDriver driver = new ChromeDriver();
		driver.navigate().to("http://localhost:8080");
		assertTrue(driver.getPageSource().contains("Flight"));
		driver.close();
	}
}
