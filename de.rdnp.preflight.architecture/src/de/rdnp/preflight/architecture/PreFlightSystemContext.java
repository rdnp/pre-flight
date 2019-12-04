package de.rdnp.preflight.architecture;

import com.structurizr.model.Model;
import com.structurizr.model.Person;
import com.structurizr.model.SoftwareSystem;
import com.structurizr.view.SystemContextView;
import com.structurizr.view.ViewSet;

public class PreFlightSystemContext {

	private SoftwareSystem preFlight;
	private SoftwareSystem weatherService;
	private SoftwareSystem aeronauticalInformationService;
	private SoftwareSystem aipService;
	private SoftwareSystem navDataService;
	private SoftwareSystem aircraftOperationManual;
	private Person pilot;

	public PreFlightSystemContext(Model model) {
		createContextElements(model);		
		createDependencies();

	}

	private void createContextElements(Model model) {
		pilot = model.addPerson("Pilot", "The user of Pre-Flight.");
		preFlight = model.addSoftwareSystem("Pre-Flight", "The Pre-Flght software system.");
		weatherService = model.addSoftwareSystem("Weather Service", "Provides flight weather information");
		aeronauticalInformationService = model.addSoftwareSystem("Aeronautical Information Service",
				"Enables filing flight plans to ATC");
		aipService = model.addSoftwareSystem("AIP service", "Provides approach plates");
		navDataService = model.addSoftwareSystem("Navigation data service", "Provides aviation maps and en-route navigation data");
		aircraftOperationManual = model.addSoftwareSystem("Aircraft operation manual", "Provides performance data of the aircraft");
	}

	private void createDependencies() {
		pilot.uses(preFlight, "Plan a flight");
		preFlight.uses(weatherService, "Get weather information");
		preFlight.uses(aeronauticalInformationService, "Transmit flight plans for filing");
		preFlight.uses(aipService, "Download approach plates");
		preFlight.uses(navDataService, "Download navigation data");
		preFlight.uses(aircraftOperationManual, "Get aircraft performance data");
	}
	
	public void buildViews(ViewSet views) {
		SystemContextView contextView = views.createSystemContextView(preFlight, "SystemContext",
				"Pre-Flight System Context diagram.");
		contextView.addAllSoftwareSystems();
		contextView.addAllPeople();
	}

}
