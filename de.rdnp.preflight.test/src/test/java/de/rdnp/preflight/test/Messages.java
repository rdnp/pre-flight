package de.rdnp.preflight.test;

public class Messages {

	public static String getString(String key) {
		switch (key) {
		case "preflight.test.chrome.driver.path":
			return "../chromedriver/chromedriver.exe";
		case "preflight.test.server.url":
			return "http://localhost:8080";
		}
		return "";
	}
}
