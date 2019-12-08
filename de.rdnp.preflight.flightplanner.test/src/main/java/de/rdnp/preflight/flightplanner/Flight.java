package de.rdnp.preflight.flightplanner;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public final class Flight {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long id;

	private String start;
	private String destination;

	public Flight() {
		this.start = "EDTQ";
		this.destination = "EDDL";
	}
	
	public void setDestination(String destination) {
		this.destination = destination;
	}
	
	public void setStart(String start) {
		this.start = start;
	}

	public String getDestination() {
		return destination;
	}

	public String getStart() {
		return start;
	}
}