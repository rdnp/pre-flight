package de.rdnp.preflight.architecture;

import com.structurizr.Workspace;

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

		PreFlightSystemContext systemContext = new PreFlightSystemContext(workspace.getModel());
		systemContext.buildViews(workspace.getViews());
		
		PreFlightSystemDecomposition decomposition = new PreFlightSystemDecomposition(systemContext);
		decomposition.buildViews(workspace.getViews());

		return workspace;
	}

}
