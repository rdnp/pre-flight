package de.rdnp.preflight.architecture.model;

import javax.annotation.Nonnull;

import com.structurizr.model.Component;
import com.structurizr.model.Container;
import com.structurizr.model.Person;
import com.structurizr.model.SoftwareSystem;
import com.structurizr.view.ComponentView;
import com.structurizr.view.ViewSet;

/**
 * Builds the approach plate manager web app container model and its views.
 */
public class ApproachPlateManagerWebAppBuilder {

	private Container approachPlateManagerWebApp;
	private Person pilot;
	private SoftwareSystem aipService;

	/**
	 * Instantiates the builder and, while doing so, the model.
	 * 
	 * @param preFlight  the preFlight software system instance to add the container
	 *                   to.
	 * @param aipService the AIP service used by the web app to download approach
	 *                   plates from.
	 * @param pilot      the pilot using the web app.
	 */
	public ApproachPlateManagerWebAppBuilder(@Nonnull SoftwareSystem preFlight, @Nonnull SoftwareSystem aipService,
			@Nonnull Person pilot) {
		this.aipService = aipService;
		this.pilot = pilot;

		approachPlateManagerWebApp = preFlight.addContainer("Approach Plate Manager", "View and print approach plates",
				"Web-Application");

		// Dependencies
		approachPlateManagerWebApp.uses(aipService, "Get approach plates");
		pilot.uses(approachPlateManagerWebApp, "View and print approach plates");

		// Decomposition
		createContainerDecomposition(aipService, pilot);
	}

	private void createContainerDecomposition(SoftwareSystem aipService, Person pilot) {
		Component approachPlateUpdater = approachPlateManagerWebApp.addComponent("Approach Plate Updater",
				"Checks if approach plates in the DB must be updated and keeps the DB up to date; fetches current appraoch plates from the DB");
		Component approachPlateDB = approachPlateManagerWebApp.addComponent("Approach Plate Repository",
				"Stores the data of the downloaded approach plates", "Repository Service");
		Component approachPlateManagerClient = approachPlateManagerWebApp.addComponent("Approach Plate Manager UI",
				"Provides a Web UI where the user can get approach plates for a flight", "Angular Component");
		approachPlateManagerClient.uses(approachPlateUpdater, "Get approach plates for flight");
		approachPlateUpdater.uses(approachPlateDB, "Store downloaded approach plates, get approach plates for flight");
		approachPlateUpdater.uses(aipService, "Download approach plates");
		pilot.uses(approachPlateManagerClient, "Get approach plates for flight");
	}

	/**
	 * @return the built Container
	 */
	public Container getApproachPlateManagerWebApp() {
		return approachPlateManagerWebApp;
	}

	/**
	 * Creates a container view of the approach plate manager web app and adds it to
	 * the given view set.
	 * 
	 * @param views the views to add the context view to.
	 */
	public void buildViews(@Nonnull ViewSet views) {
		ComponentView componentView = views.createComponentView(approachPlateManagerWebApp,
				"Pre-Flight - Approach Plate Manager - Components", "Web app content overview");
		componentView.add(pilot);
		componentView.add(aipService);
		componentView.addAllComponents();
	}

}
