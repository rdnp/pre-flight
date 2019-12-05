package de.rdnp.preflight.architecture.build;

import com.structurizr.Workspace;

import de.rdnp.preflight.architecture.model.PreFlightSystemBuilder;

/**
 * Builder for the architecture workspace
 */
public class WorkspaceBuilder {
	
	/**
	 * Builds the entire architecture workspace of the Pre-Flight system.
	 */
	public Workspace buildPreFlightArchitecture() {
		Workspace workspace = new Workspace("Pre-Flight Architecture Workspace",
				"Workspace containing model and all views of Pre-Fligt project.");

		PreFlightSystemBuilder systemBuilder = new PreFlightSystemBuilder(workspace.getModel());
		systemBuilder.buildViews(workspace.getViews());

		return workspace;
	}

}
