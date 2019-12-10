package de.rdnp.preflight.flightplanner;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;


@Entity
public class Leg {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long id;
	
	private String from;
	
	private String to;

	private int plannedAltitude;
	
	private int trueCourse;
	
	private int distance;

	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}

	public String getTo() {
		return to;
	}

	public void setTo(String to) {
		this.to = to;
	}

	public int getPlannedAltitude() {
		return plannedAltitude;
	}

	public void setPlannedAltitude(int plannedAltitude) {
		this.plannedAltitude = plannedAltitude;
	}

	public int getTrueCourse() {
		return trueCourse;
	}

	public void setTrueCourse(int trueCourse) {
		this.trueCourse = trueCourse;
	}

	public int getDistance() {
		return distance;
	}

	public void setDistance(int distance) {
		this.distance = distance;
	}
	
	
}
