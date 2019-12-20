package de.rdnp.preflight.flightplanner;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;

@Entity
public class TripSegment {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long id;

	private double variation;

	private double hourlyFuelConsumptionRate;

	private int windDirection;

	private int windSpeed;

	private int trueAirspeed;

	private int altitude;

	private double magneticCourse;

	private double magneticHeading;

	private double groundSpeed;

	private double timeInMinutes;

	private double fuel;

	@OneToMany(cascade = CascadeType.ALL)
	private List<TripSegment> children;

	public long getId() {
		return id;
	}
	
	public void setId(long id) {
		this.id = id;
	}

	public double getVariation() {
		return variation;
	}

	public void setVariation(double variation) {
		this.variation = variation;
	}

	public double getHourlyFuelConsumptionRate() {
		return hourlyFuelConsumptionRate;
	}

	public void setHourlyFuelConsumptionRate(double hourlyFuelConsumptionRate) {
		this.hourlyFuelConsumptionRate = hourlyFuelConsumptionRate;
	}

	public int getWindDirection() {
		return windDirection;
	}

	public void setWindDirection(int windDirection) {
		this.windDirection = windDirection;
	}

	public int getWindSpeed() {
		return windSpeed;
	}

	public void setWindSpeed(int windSpeed) {
		this.windSpeed = windSpeed;
	}

	public int getTrueAirspeed() {
		return trueAirspeed;
	}

	public void setTrueAirspeed(int trueAirspeed) {
		this.trueAirspeed = trueAirspeed;
	}

	public int getAltitude() {
		return altitude;
	}

	public void setAltitude(int altitude) {
		this.altitude = altitude;
	}

	public double getMagneticCourse() {
		return magneticCourse;
	}

	public void setMagneticCourse(double magneticCourse) {
		this.magneticCourse = magneticCourse;
	}

	public double getMagneticHeading() {
		return magneticHeading;
	}

	public void setMagneticHeading(double magneticHeading) {
		this.magneticHeading = magneticHeading;
	}

	public double getGroundSpeed() {
		return groundSpeed;
	}

	public void setGroundSpeed(double groundSpeed) {
		this.groundSpeed = groundSpeed;
	}

	public double getTimeInMinutes() {
		return timeInMinutes;
	}

	public void setTimeInMinutes(double timeInMinutes) {
		this.timeInMinutes = timeInMinutes;
	}

	public double getFuel() {
		return fuel;
	}

	public void setFuel(double fuel) {
		this.fuel = fuel;
	}

	public List<TripSegment> getChildren() {
		return children;
	}

	public void setChildren(List<TripSegment> children) {
		this.children = children;
	}

}
