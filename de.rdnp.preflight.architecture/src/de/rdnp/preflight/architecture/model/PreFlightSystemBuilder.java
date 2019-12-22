package de.rdnp.preflight.architecture.model;

import javax.annotation.Nonnull;

import com.structurizr.model.Model;
import com.structurizr.model.Person;
import com.structurizr.model.SoftwareSystem;
import com.structurizr.view.ContainerView;
import com.structurizr.view.SystemContextView;
import com.structurizr.view.ViewSet;

/**
 * Builds the system model (context and decomposition into parts) and its views.
 */
public class PreFlightSystemBuilder {

	private SoftwareSystem preFlight;
	private SoftwareSystem aeronauticalInformationService;
	private SoftwareSystem aipService;
	private Person pilot;

	private FlightPlanningWebAppBuilder flightPlanningWebApp;
	private ApproachPlateManagerWebAppBuilder approachPlateManagerWebApp;
	private AircraftManagerWebAppBuilder aircraftManagerWebApp;

	/**
	 * Creates the system model instance.
	 * 
	 * @param model the model to add the system model to.
	 */
	public PreFlightSystemBuilder(@Nonnull Model model) {
		createContextElements(model);		
		createDependencies();
		createParts();
	}

	private void createContextElements(Model model) {
		pilot = model.addPerson("Pilot", "The user of Pre-Flight.");
		preFlight = model.addSoftwareSystem("Pre-Flight", "The Pre-Flght software system.");
		aeronauticalInformationService = model.addSoftwareSystem("Aeronautical Information Service",
				"Enables filing flight plans to ATC");
		aipService = model.addSoftwareSystem("AIP service", "Provides approach plates");
	}

	private void createDependencies() {
		pilot.uses(preFlight, "Plan a flight, manage approach plates, manage aircraft specifications");
		pilot.uses(preFlight, "Provide flight weather information and navigation data");
		preFlight.uses(aeronauticalInformationService, "Transmit flight plans for filing");
		preFlight.uses(aipService, "Download approach plates");
		preFlight.delivers(pilot, "Flight planning report, approach plates");
	}

	private void createParts() {
		aircraftManagerWebApp = new AircraftManagerWebAppBuilder(preFlight, pilot);
		flightPlanningWebApp = new FlightPlanningWebAppBuilder(preFlight,
				aircraftManagerWebApp.getAircraftManagerWebApp(), aeronauticalInformationService,
				pilot);
		aircraftManagerWebApp.setFlightPlanningWebApp(flightPlanningWebApp.getFlightPlanningWebApp());
		approachPlateManagerWebApp = new ApproachPlateManagerWebAppBuilder(preFlight,
				aipService, pilot);
	}
	
	/**
	 * @return the built model
	 */
	public SoftwareSystem getPreFlight() {
		return preFlight;
	}

	/**
	 * Creates a view of the system decomposition and adds it to the given view set.
	 * 
	 * @param views the views to add the context view to.
	 */
	public void buildViews(@Nonnull ViewSet views) {
		// Context view
		SystemContextView contextView = views.createSystemContextView(preFlight, "Pre-Flight - System Context",
				"Pre-Flight System Context diagram.");
		contextView.addAllSoftwareSystems();
		contextView.addAllPeople();
		
		// Container view
		ContainerView systemDecompositionView = views.createContainerView(preFlight,
				"Pre-Flight - Containers", "Pre-Flight system decomposition view");
		systemDecompositionView.addAllContainers();
		systemDecompositionView.add(pilot);
		systemDecompositionView.add(aipService);
		systemDecompositionView.add(aeronauticalInformationService);

		// Views of parts
		aircraftManagerWebApp.buildViews(views);
		flightPlanningWebApp.buildViews(views);
		approachPlateManagerWebApp.buildViews(views);
	}

}
