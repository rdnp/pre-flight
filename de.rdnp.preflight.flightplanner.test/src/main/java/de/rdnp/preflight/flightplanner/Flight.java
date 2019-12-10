package de.rdnp.preflight.flightplanner;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;

@Entity
public final class Flight {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long id;
	
	private String name;
	
	private String origin;
	
	private String destination;
	
	private String alternate;
	
	private String aircraftType;
	
//	@ManyToMany(targetEntity=Leg.class, fetch=FetchType.EAGER)
//	private List<Leg> legs;
	
	/*
	 * XXX
	 * Open
	 *  - day
	 *  - performanceSetting
	 *  - load
	 */

	public Flight() {
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getOrigin() {
		return origin;
	}

	public void setOrigin(String origin) {
		this.origin = origin;
	}

	public String getDestination() {
		return destination;
	}

	public void setDestination(String destination) {
		this.destination = destination;
	}

	public String getAlternate() {
		return alternate;
	}

	public void setAlternate(String alternate) {
		this.alternate = alternate;
	}

	public String getAircraftType() {
		return aircraftType;
	}

	public void setAircraftType(String aircraftType) {
		this.aircraftType = aircraftType;
	}

//	public List<Leg> getLegs() {
//		return legs;
//	}
//
//	public void setLegs(List<Leg> legs) {
//		this.legs = legs;
//	}
	
	
	
}