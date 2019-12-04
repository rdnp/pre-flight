package de.rdnp.preflight.architecture;

import java.io.File;
import java.io.PrintWriter;
import java.io.StringWriter;

import com.structurizr.Workspace;
import com.structurizr.io.plantuml.PlantUMLWriter;
import com.structurizr.model.Model;
import com.structurizr.model.Person;
import com.structurizr.model.SoftwareSystem;
import com.structurizr.view.SystemContextView;
import com.structurizr.view.ViewSet;

public class PreFlightSystemArchitecture {

	public static void main(String[] args) throws Exception {
		Workspace workspace = new Workspace("Getting Started", "This is a model of my software system.");
		Model model = workspace.getModel();

		Person user = model.addPerson("User", "A user of my software system.");
		SoftwareSystem softwareSystem = model.addSoftwareSystem("Software System", "My software system.");
		user.uses(softwareSystem, "Uses");

		ViewSet views = workspace.getViews();
		SystemContextView contextView = views.createSystemContextView(softwareSystem, "SystemContext",
				"An example of a System Context diagram.");
		contextView.addAllSoftwareSystems();
		contextView.addAllPeople();

		StringWriter stringWriter = new StringWriter();
		PlantUMLWriter writer = new PlantUMLWriter();
		writer.write(contextView, stringWriter);
		System.out.println(stringWriter.toString());
		PrintWriter fileWriter = new PrintWriter(new File("target/plantuml", "system.puml"));
		fileWriter.println(stringWriter.toString());
		fileWriter.close();
	}
}
