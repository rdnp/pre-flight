package de.rdnp.preflight.architecture.build;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import com.structurizr.Workspace;
import com.structurizr.io.plantuml.PlantUMLWriter;
import com.structurizr.view.View;

/**
 * Exports all architecture views
 */
public class ArchitectureViewsExporter {

	/**
	 * Runs the export
	 * 
	 * @param args no arguments expected, may be null.
	 * @throws FileNotFoundException
	 */
	public static void main(String[] args) {
		System.out.println("Starting export of architecture views to PlantUML...");
		
		exportToPlantUml();

		System.out.println("Starting conversion to PNG files...");
		
		convertToPng();
		
		System.out.println("Done with export of architecture views.");
	}


	private static void exportToPlantUml() {
		Workspace exportWorkspace = new WorkspaceBuilder().buildPreFlightArchitecture();
		for (View view : exportWorkspace.getViews().getViews()) {
			StringWriter stringWriter = new StringWriter();
			PlantUMLWriter writer = new PlantUMLWriter();
			writer.write(view, stringWriter);
			System.out.println();
			System.out.println();
			System.out.println("=============== EXPORTING: " + view.getName() + "===============");
			System.out.println(stringWriter.toString());
			try (PrintWriter fileWriter = new PrintWriter(new File("target/plantuml", view.getName() + ".puml"))) {
				fileWriter.println(stringWriter.toString());
			} catch (FileNotFoundException e) {
				e.printStackTrace();
				System.out.println("============ ERROR EXPORTING: " + view.getName() + "============");
			}
			System.out.println("============= DONE EXPORTING: " + view.getName() + "=============");
		}
	}
	

	private static void convertToPng() {
		ProcessBuilder processBuilder = new ProcessBuilder("C:\\Windows\\System32\\cmd.exe", "/C", "plantuml.bat");
		processBuilder.inheritIO();
		try {
			processBuilder.start();
		} catch (IOException e) {
			e.printStackTrace();
			System.out.println("============ ERROR CONVERTING PLANTUML TO PNG ============");
		}
	}

}
