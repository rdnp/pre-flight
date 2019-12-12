package de.rdnp.preflight.flightplanner;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;


@Entity
public class RouteSegment {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long id;
	
	private String sourcePointId;
	
	private String targetPointId;

	private int minimumSafeAltitude;
	
	private int trueCourse;
	
	private int distance;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getSourcePointId() {
		return sourcePointId;
	}

	public void setSourcePointId(String sourcePointId) {
		this.sourcePointId = sourcePointId;
	}

	public String getTargetPointId() {
		return targetPointId;
	}

	public void setTargetPointId(String targetPointId) {
		this.targetPointId = targetPointId;
	}

	public int getMinimumSafeAltitude() {
		return minimumSafeAltitude;
	}

	public void setMinimumSafeAltitude(int minimumSafeAltitude) {
		this.minimumSafeAltitude = minimumSafeAltitude;
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
