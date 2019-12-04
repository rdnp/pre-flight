package de.rdnp.preflight.architecture;

import com.structurizr.Workspace;

public class WorkspaceBuilder {

	public Workspace buildPreFlightArchitecture() {
		Workspace workspace = new Workspace("Pre-Flight Architecture Workspace",
				"Workspace containing model and all views of Pre-Fligt project.");

		PreFlightSystemContext contextView = new PreFlightSystemContext(workspace.getModel());
		contextView.buildViews(workspace.getViews());

		return workspace;
	}

}
