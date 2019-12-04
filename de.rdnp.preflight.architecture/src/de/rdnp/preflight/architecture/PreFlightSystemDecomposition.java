package de.rdnp.preflight.architecture;

import javax.annotation.Nonnull;

import com.structurizr.model.Container;
import com.structurizr.model.SoftwareSystem;
import com.structurizr.view.ContainerView;
import com.structurizr.view.ViewSet;

/**
 * Decomposition model of the Pre-Flight system into its parts.
 */
public class PreFlightSystemDecomposition {

	private PreFlightSystemContext context;
	private Container flightPlanningWebApp;
	private Container approachPlateManagerWebApp;
	private Container aircraftManagerWebApp;

	/**
	 * Creates the decomposition model.
	 * 
	 * @param preFlightSystemModel the Pre-Flight system model instance to which the
	 *                             decomposition view will be added.
	 */
	public PreFlightSystemDecomposition(@Nonnull PreFlightSystemContext context) {
		this.context = context;
		SoftwareSystem preFlightSystemModel = context.getPreFlight();
		flightPlanningWebApp = preFlightSystemModel.addContainer("Flight Planning", "Provides flight planning capabilities",
				"Web-Application");
		approachPlateManagerWebApp = preFlightSystemModel.addContainer("Approach Plate Manager",
				"View and print approach plates", "Web-Application");
		aircraftManagerWebApp = preFlightSystemModel.addContainer("Aircraft Manager",
				"View and edit aircraft performance data", "Web-Application");
		flightPlanningWebApp.uses(aircraftManagerWebApp, "Get aircraft performance data");
		flightPlanningWebApp.uses(context.getAeronauticalInformationService(), "Transmit flight plan");
		approachPlateManagerWebApp.uses(context.getAipService(), "Get approach plates");
		context.getPilot().uses(flightPlanningWebApp, "Create/Edit flight plans");
		context.getPilot().uses(flightPlanningWebApp, "Create/Edit flight weather information");
		context.getPilot().uses(flightPlanningWebApp, "Create/Edit navigation data");
		context.getPilot().uses(approachPlateManagerWebApp, "View and print approach plates");
		context.getPilot().uses(aircraftManagerWebApp, "Create/Edit aircraft performance data");
	}

	/**
	 * Creates a view of the system decomposition.
	 * 
	 * @param views the views to add the context view to.
	 */
	public void buildViews(ViewSet views) {
		ContainerView systemDecompositionView = views.createContainerView(context.getPreFlight(),
				"System Decomposition", "Pre-Flight system decomposition view");
		systemDecompositionView.addAllContainers();
		systemDecompositionView.add(context.getPilot());
		systemDecompositionView.add(context.getAipService());
		systemDecompositionView.add(context.getAeronauticalInformationService());
	}

}
