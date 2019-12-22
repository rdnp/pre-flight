package de.rdnp.preflight.architecture.model;

import javax.annotation.Nonnull;

import com.structurizr.model.Component;
import com.structurizr.model.Container;
import com.structurizr.model.Person;
import com.structurizr.model.SoftwareSystem;
import com.structurizr.view.ComponentView;
import com.structurizr.view.DynamicView;
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
	private Component flightListUI;
	private Component flightEditorUI;
	private Component flightRepositoryService;
	private Component routeRepositoryService;
	private Component tripRepositoryService;
	private Component tripComputer;

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
		flightRepositoryService = flightPlanningWebApp.addComponent("Flight Repository",
				"Stores flight information: Flight plan templates including routes.", "Repository Service");
		routeRepositoryService = flightPlanningWebApp.addComponent("Route Repository",
				"Stores navigation data to build flight routes", "Repository Service");
		tripRepositoryService = flightPlanningWebApp.addComponent("Trip Repository",
				"Stores trip information, which is information on concrete executions of flights, e.g. weather information.",
				"Repository Service");
		Component flightPlanBuilder = flightPlanningWebApp.addComponent("Flight Plan Builder",
				"Builds a flight plan for filing with ATC using the route, pilot details, and aircraft details",
				"Angular Service");

		tripComputer = flightPlanningWebApp.addComponent("Trip Computer",
				"Computes the legs between points, including necessary climb/descent, wind corrections, time consumed, fuel used",
				"Angular Service.");
		tripComputer.uses(aircraftManagerWebApp, "Get aircraft climb, cruise, descent performance");

		flightPlanBuilder.uses(aeronauticalInformationService, "Transmit flight plan");

		flightEditorUI = flightPlanningWebApp.addComponent("Flight Editor UI",
				"UI for the pilot to edit and view flight planning information."
						+ "Builds a flight planning report containing the flight, route, and trip information",
				"Angular Component");
		flightEditorUI.uses(flightRepositoryService, "Store/Get flight information");
		flightEditorUI.uses(routeRepositoryService, "Store/Get navigation data");
		flightEditorUI.uses(tripRepositoryService, "Store/Get trip data");
		flightEditorUI.uses(flightPlanBuilder, "Create/Edit flight plans");
		flightEditorUI.uses(tripComputer, "Get flight log");
		flightEditorUI.delivers(pilot, "Flight planning report");

		flightEditorUI.uses(aircraftManagerWebApp, "Get weight and balance, get take-off and landing performance");

		flightListUI = flightPlanningWebApp.addComponent("Flight List UI",
				"UI for the pilot to create, delete and list flight planning information", "Angular Component");
		flightListUI.uses(flightRepositoryService, "Store/Get flight information");
		flightListUI.uses(tripRepositoryService, "Store/Get trip data");
		flightListUI.delivers(pilot, "Flight list");

		pilot.uses(flightListUI, "Create/Edit flight plans");
		pilot.uses(flightEditorUI, "Create/Edit flight weather information");
		pilot.uses(flightEditorUI, "Create/Edit navigation data");
	}

	private void createCreateFlightDynamicView(@Nonnull ViewSet views) {
		DynamicView flightManagementInteraction = views.createDynamicView(flightPlanningWebApp,
				"Pre-Flight - Flight Planning - Create Flight", "Creating a flight");
		flightManagementInteraction.add(pilot, "Open page", flightListUI);
		flightManagementInteraction.add(flightListUI, "Fetch all flight data", flightRepositoryService);
		flightManagementInteraction.add(flightListUI, "Display flight list", pilot);
		flightManagementInteraction.add(pilot, "Create flight", flightListUI);
		flightManagementInteraction.add(flightListUI, "Redirect to flight editor", pilot);
	}

	private void createDeleteFlightDynamicView(@Nonnull ViewSet views) {
		DynamicView flightManagementInteraction = views.createDynamicView(flightPlanningWebApp,
				"Pre-Flight - Flight Planning - Delete Flight", "Deleting a flight");
		flightManagementInteraction.add(pilot, "Open page", flightListUI);
		flightManagementInteraction.add(flightListUI, "Fetch all flight data", flightRepositoryService);
		flightManagementInteraction.add(flightListUI, "Display flight list", pilot);
		flightManagementInteraction.add(pilot, "Delete flight", flightListUI);
		flightManagementInteraction.add(flightListUI, "Delete flight data", flightRepositoryService);
		flightManagementInteraction.add(flightListUI, "Delete trip data of flight", tripRepositoryService);
		flightManagementInteraction.add(flightListUI, "Fetch all flight data", flightRepositoryService);
		flightManagementInteraction.add(flightListUI, "Show updated flight list", pilot);
	}

	private void createOpenFlightDynamicView(@Nonnull ViewSet views) {
		DynamicView flightManagementInteraction = views.createDynamicView(flightPlanningWebApp,
				"Pre-Flight - Flight Planning - Open Flight", "Opening a flight");
		flightManagementInteraction.add(pilot, "Open page", flightListUI);
		flightManagementInteraction.add(flightListUI, "Fetch all flight data", flightRepositoryService);
		flightManagementInteraction.add(flightListUI, "Display flight list", pilot);
		flightManagementInteraction.add(pilot, "Open flight", flightListUI);
		flightManagementInteraction.add(flightListUI, "Redirect to flight editor", pilot);
	}

	private void createEditFlightDataDynamicView(@Nonnull ViewSet views) {
		DynamicView flightManagementInteraction = views.createDynamicView(flightPlanningWebApp,
				"Pre-Flight - Flight Planning - Edit Flight", "Editing a flight");
		flightManagementInteraction.add(pilot, "Edit flight data", flightEditorUI);

		flightManagementInteraction.add(pilot, "Save flight", flightEditorUI);
		flightManagementInteraction.add(flightEditorUI, "Save all flight data", flightRepositoryService);

		flightManagementInteraction.add(flightEditorUI, "Flight plan", pilot);
	}
	
	private void createEditRouteDynamicView(@Nonnull ViewSet views) {
		DynamicView flightManagementInteraction = views.createDynamicView(flightPlanningWebApp,
				"Pre-Flight - Flight Planning - Edit Flight Route", "Editing a flight's route");
		flightManagementInteraction.add(pilot, "Edit flight route", flightEditorUI);
		flightManagementInteraction.add(flightEditorUI, "Fetch relevant additional route data", routeRepositoryService);
		flightManagementInteraction.add(flightEditorUI, "Compute derived trip data", tripComputer);

		flightManagementInteraction.add(pilot, "Save flight", flightEditorUI);
		flightManagementInteraction.add(flightEditorUI, "Save flight's route data", routeRepositoryService);

		flightManagementInteraction.add(flightEditorUI, "Flight plan", pilot);
	}
	
	private void createEditTripDynamicView(@Nonnull ViewSet views) {
		DynamicView flightManagementInteraction = views.createDynamicView(flightPlanningWebApp,
				"Pre-Flight - Flight Planning - Edit Flight Trip Details", "Editing a flight's trip details");
		flightManagementInteraction.add(pilot, "Select trip from flight", flightEditorUI);

		flightManagementInteraction.add(flightEditorUI, "Fetch trip data", tripRepositoryService);

		flightManagementInteraction.add(pilot, "Edit trip data", flightEditorUI);
		flightManagementInteraction.add(flightEditorUI, "Compute derived trip data", tripComputer);

		flightManagementInteraction.add(pilot, "Save flight", flightEditorUI);
		flightManagementInteraction.add(flightEditorUI, "Save flight's trip data", tripRepositoryService);

		flightManagementInteraction.add(flightEditorUI, "Flight plan", pilot);
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
		ComponentView componentView = views.createComponentView(flightPlanningWebApp,
				"Pre-Flight - Flight Planning - Components", "Web app content overview");
		componentView.add(pilot);
		componentView.add(aircraftManagerWebApp);
		componentView.add(aeronauticalInformationService);
		componentView.addAllComponents();

		createCreateFlightDynamicView(views);
		createDeleteFlightDynamicView(views);
		createOpenFlightDynamicView(views);
		createEditFlightDataDynamicView(views);
		createEditRouteDynamicView(views);
		createEditTripDynamicView(views);
	}
}
