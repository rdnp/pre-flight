package de.rdnp.preflight.flightplanner;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;

@Entity
public class Trip {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long id;

	private long flightId;

	private String dateOfFlight;
	
	private String estimatedOffBlockTime;
	
	private String aircraftRegistration;

	private String aircraftType;

	@OneToMany(cascade = CascadeType.ALL)
	private List<TripSegment> segments;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public long getFlightId() {
		return flightId;
	}

	public void setFlightId(long flightId) {
		this.flightId = flightId;
	}

	public List<TripSegment> getSegments() {
		return segments;
	}

	public void setSegments(List<TripSegment> segments) {
		this.segments = segments;
	}

	public String getDateOfFlight() {
		return dateOfFlight;
	}

	public void setDateOfFlight(String dateOfFlight) {
		this.dateOfFlight = dateOfFlight;
	}

	public String getEstimatedOffBlockTime() {
		return estimatedOffBlockTime;
	}

	public void setEstimatedOffBlockTime(String estimatedOffBlockTime) {
		this.estimatedOffBlockTime = estimatedOffBlockTime;
	}

	public String getAircraftRegistration() {
		return aircraftRegistration;
	}

	public void setAircraftRegistration(String aircraftRegistration) {
		this.aircraftRegistration = aircraftRegistration;
	}

	public String getAircraftType() {
		return aircraftType;
	}

	public void setAircraftType(String aircraftType) {
		this.aircraftType = aircraftType;
	}

}
