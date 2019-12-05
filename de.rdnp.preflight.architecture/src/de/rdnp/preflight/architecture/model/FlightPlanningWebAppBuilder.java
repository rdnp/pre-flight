package de.rdnp.preflight.architecture.model;

import javax.annotation.Nonnull;

import com.structurizr.model.Component;
import com.structurizr.model.Container;
import com.structurizr.model.Person;
import com.structurizr.model.SoftwareSystem;
import com.structurizr.view.ComponentView;
import com.structurizr.view.ViewSet;

/**
 * Builds the flight planning web app container model and its views.
 */
public class FlightPlanningWebAppBuilder {

	private Container flightPlanningWebApp;
	private Person pilot;
	private Container aircraftManagerWebApp;
	private SoftwareSystem aeronauticalInformationService;
	private SoftwareSystem preFlight;

	/**
	 * * Instantiates the builder and, while doing so, the model.
	 * 
	 * @param preFlight                      the preFlight software system instance
	 *                                       to add the container to.
	 * @param aircraftManagerWebApp          the web app used for obtaining aircraft
	 *                                       performance information from.
	 * @param aeronauticalInformationService the AIS service used to file flight
	 *                                       plans with.
	 * @param pilot                          the pilot using the web app.
	 */
	public FlightPlanningWebAppBuilder(@Nonnull SoftwareSystem preFlight, @Nonnull Container aircraftManagerWebApp,
			@Nonnull SoftwareSystem aeronauticalInformationService, @Nonnull Person pilot) {
		this.preFlight = preFlight;
		this.aircraftManagerWebApp = aircraftManagerWebApp;
		this.aeronauticalInformationService = aeronauticalInformationService;
		this.pilot = pilot;
		createContainerDependencies();
		createContainerDecomposition();
	}

	private void createContainerDependencies() {
		flightPlanningWebApp = preFlight.addContainer("Flight Planning", "Provides flight planning capabilities",
				"Web-Application");
		flightPlanningWebApp.uses(aircraftManagerWebApp, "Get aircraft performance data");
		flightPlanningWebApp.uses(aeronauticalInformationService, "Transmit flight plan");
		pilot.uses(flightPlanningWebApp, "Create/Edit flight plans");
		pilot.uses(flightPlanningWebApp, "Create/Edit flight weather information");
		pilot.uses(flightPlanningWebApp, "Create/Edit navigation data");
		flightPlanningWebApp.delivers(pilot, "Flight planning report");
	}

	private void createContainerDecomposition() {
		Component weatherService = flightPlanningWebApp.addComponent("Weather Service",
				"Stores current (transient) weather information for flight planning", "REST Service");
		Component flightDatabase = flightPlanningWebApp.addComponent("Flight DB",
				"Stores the information from previous and current flights", "Database");
		Component flightPlanBuilder = flightPlanningWebApp.addComponent("Flight Plan Builder",
				"Builds a flight plan for filing with ATC using the route, pilot details, and aircraft details",
				"REST Service");

		Component navigationComputer = flightPlanningWebApp.addComponent("Navigation Computer",
				"Builds a flight log computing the legs between points, including necessary climb/descent, wind corrections, time consumed, fuel used",
				"REST Service.");
		navigationComputer.uses(weatherService, "Get current flight weather");
		navigationComputer.uses(flightDatabase, "Store flight route");
		navigationComputer.uses(aircraftManagerWebApp, "Get aircraft climb, cruise, descent performance");

		Component flightPlanningReportBuilder = flightPlanningWebApp.addComponent("Flight Planning Report Builder",
				"Builds a flight planning report containing the flight log, weight and balance computation, fuel computation, take-off and landing performance, the filed flight plans, and all the information used to generate the data (such as weather and performance settings).",
				"REST Service");
		flightPlanningReportBuilder.uses(navigationComputer, "Get flight log, Store navigation data");
		flightPlanningReportBuilder.uses(flightPlanBuilder, "Get flight plan");
		flightPlanningReportBuilder.uses(aircraftManagerWebApp,
				"Get weight and balance, get take-off and landing performance");

		flightPlanBuilder.uses(aeronauticalInformationService, "Transmit flight plan");

		Component flightPlanningUI = flightPlanningWebApp.addComponent("Flight Planning UI",
				"UI for the pilot to edit and view flight planning information", "Web-Client");
		flightPlanningUI.uses(flightPlanBuilder, "Create/Edit flight plans");
		flightPlanningUI.uses(flightPlanningReportBuilder, "Get flight planning report");
		flightPlanningUI.uses(navigationComputer, "Get flight log");
		flightPlanningUI.uses(weatherService, "Store current flight weather information");
		flightPlanningUI.delivers(pilot, "Flight planning report");

		pilot.uses(flightPlanningUI, "Create/Edit flight plans");
		pilot.uses(flightPlanningUI, "Create/Edit flight weather information");
		pilot.uses(flightPlanningUI, "Create/Edit navigation data");
	}

	/**
	 * @return the built Container
	 */
	public Container getFlightPlanningWebApp() {
		return flightPlanningWebApp;
	}

	/**
	 * Creates a container view of the flight planning web app and adds it to the
	 * given view set.
	 * 
	 * @param views the views to add the context view to.
	 */
	public void buildViews(@Nonnull ViewSet views) {
		ComponentView componentView = views.createComponentView(flightPlanningWebApp, "Flight Planning Web App",
				"Web app content overview");
		componentView.add(pilot);
		componentView.add(aircraftManagerWebApp);
		componentView.add(aeronauticalInformationService);
		componentView.addAllComponents();
	}
}
