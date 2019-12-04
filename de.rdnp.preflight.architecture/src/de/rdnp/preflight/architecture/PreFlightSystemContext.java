package de.rdnp.preflight.architecture;

import javax.annotation.Nonnull;

import com.structurizr.model.Model;
import com.structurizr.model.Person;
import com.structurizr.model.SoftwareSystem;
import com.structurizr.view.SystemContextView;
import com.structurizr.view.ViewSet;

/**
 * Model of the Pre-Flight system's context.
 */
public class PreFlightSystemContext {

	private SoftwareSystem preFlight;
	private SoftwareSystem aeronauticalInformationService;
	private SoftwareSystem aipService;
	private Person pilot;

	/**
	 * Creates the context model instance.
	 * 
	 * @param model the model to add the context model to.
	 */
	public PreFlightSystemContext(@Nonnull Model model) {
		createContextElements(model);		
		createDependencies();

	}
	
	public SoftwareSystem getPreFlight() {
		return preFlight;
	}

	public SoftwareSystem getAeronauticalInformationService() {
		return aeronauticalInformationService;
	}

	public SoftwareSystem getAipService() {
		return aipService;
	}

	public Person getPilot() {
		return pilot;
	}

	private void createContextElements(Model model) {
		pilot = model.addPerson("Pilot", "The user of Pre-Flight.");
		preFlight = model.addSoftwareSystem("Pre-Flight", "The Pre-Flght software system.");
		aeronauticalInformationService = model.addSoftwareSystem("Aeronautical Information Service",
				"Enables filing flight plans to ATC");
		aipService = model.addSoftwareSystem("AIP service", "Provides approach plates");
	}

	private void createDependencies() {
		pilot.uses(preFlight, "Plan a flight, manage approach plates, manage aircraft performance data");
		pilot.uses(preFlight, "Provide flight weather information and navigation data");
		preFlight.uses(aeronauticalInformationService, "Transmit flight plans for filing");
		preFlight.uses(aipService, "Download approach plates");
		preFlight.delivers(pilot, "Flight planning report, approach plates");
	}
	
	/**
	 * Creates a view of the system context. 
	 * 
	 * @param views the views to add the context view to.
	 */
	public void buildViews(@Nonnull ViewSet views) {
		SystemContextView contextView = views.createSystemContextView(preFlight, "SystemContext",
				"Pre-Flight System Context diagram.");
		contextView.addAllSoftwareSystems();
		contextView.addAllPeople();
	}

}
