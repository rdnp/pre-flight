package de.rdnp.preflight.flightplanner;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "trips", path = "trips")
public interface TripRepository extends CrudRepository<Trip, Long>{

	  List<Trip> findByFlightId(@Param("id") long flightId);

	  @Transactional
	  void deleteByFlightId(@Param("id") long flightId);
}
