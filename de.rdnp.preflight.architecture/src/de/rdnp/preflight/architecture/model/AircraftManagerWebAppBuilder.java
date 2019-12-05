package de.rdnp.preflight.architecture.model;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

import com.structurizr.model.Component;
import com.structurizr.model.Container;
import com.structurizr.model.Person;
import com.structurizr.model.SoftwareSystem;
import com.structurizr.view.ComponentView;
import com.structurizr.view.ViewSet;

/**
 * Builds the aircraft manager web app container model and its views.
 */
public class AircraftManagerWebAppBuilder {

	private Container aircraftManagerWebApp;
	private Person pilot;
	private Component aircraftSpecificationService;
	private Container flightPlanningWebApp;
	private Component weightAndBalanceComputer;
	private Component takeOffAndLandingPerformanceComputer;

	/**
	 * Instantiates the builder and, while doing so, the model.
	 * 
	 * @param preFlight the preFlight software system instance to add the container
	 *                  to.
	 * @param pilot     the pilot using the web app.
	 */
	public AircraftManagerWebAppBuilder(@Nonnull SoftwareSystem preFlight, @Nonnull Person pilot) {
		this.pilot = pilot;

		aircraftManagerWebApp = preFlight.addContainer("Aircraft Manager", "View and edit aircraft specifications (e.g. performance data)",
				"Web-Application");

		// Dependencies
		pilot.uses(aircraftManagerWebApp, "Create/Edit aircraft performance data");

		createContainerDecomposition(pilot);
	}

	private void createContainerDecomposition(Person pilot) {
		aircraftSpecificationService = aircraftManagerWebApp.addComponent("Aircraft Specification Service",
				"Service to access the aircraft performance DB for retrieving and storing aircraft specifications", "REST Service");
		weightAndBalanceComputer = aircraftManagerWebApp.addComponent("Weight and Balance Computer",
				"Service to compute the weight and balance (take-off mass, landing mass, zero fuel mass).", "REST Service");
		takeOffAndLandingPerformanceComputer = aircraftManagerWebApp.addComponent("T/O and LDG Performance Computer",
				"Service to compute take off and landing distance and run considering weather conditions.", "REST Service");
		Component aircraftDB = aircraftManagerWebApp.addComponent("Aircraft Performance DB",
				"Database that holds the aircraft specifications", "Database");
		Component aircraftManagerUI = aircraftManagerWebApp.addComponent("Aircraft Manager UI",
				"Web UI where the user can create, edit and view aircraft specifications", "Web-Client");
		weightAndBalanceComputer.uses(aircraftSpecificationService, "Get aircraft specification");
		takeOffAndLandingPerformanceComputer.uses(aircraftSpecificationService, "Get aircraft specification");
		aircraftSpecificationService.uses(aircraftDB, "Get/Store aircraft specification");
		aircraftManagerUI.uses(aircraftSpecificationService, "Get/Store aircraft specification");
		pilot.uses(aircraftManagerUI, "Create/Edit aircraft specification");
	}

	/**
	 * @param flightPlanningWebApp the web app for flight planning tha consumes
	 *                             aircraft specifications from the aircraft manager
	 */
	public void setFlightPlanningWebApp(@Nullable Container flightPlanningWebApp) {
		this.flightPlanningWebApp = flightPlanningWebApp;
		if (flightPlanningWebApp != null) {
			flightPlanningWebApp.uses(aircraftSpecificationService, "Get aircraft climb, cruise, descent performance");
			flightPlanningWebApp.uses(weightAndBalanceComputer, "Get weight and balance for used fuel");
			flightPlanningWebApp.uses(takeOffAndLandingPerformanceComputer, "Get take-off and landing performance for weather");
		}
	}

	/**
	 * @return the built Container
	 */
	public Container getAircraftManagerWebApp() {
		return aircraftManagerWebApp;
	}

	/**
	 * Creates a container view of the aircraft manager web app and adds it to the
	 * given view set.
	 * 
	 * @param views the views to add the context view to.
	 */
	public void buildViews(@Nonnull ViewSet views) {
		ComponentView componentView = views.createComponentView(aircraftManagerWebApp, "Aircraft Manager Web App",
				"Web app content overview");
		componentView.add(pilot);
		if (flightPlanningWebApp != null) {
			componentView.add(flightPlanningWebApp);
		}
		componentView.addAllComponents();
	}
}
