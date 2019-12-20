package de.rdnp.preflight.flightplanner;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;

@CrossOrigin(methods = {RequestMethod.DELETE, RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT})
@RepositoryRestResource(collectionResourceRel = "trips", path = "trips")
public interface TripRepository extends CrudRepository<Trip, Long>{

	  List<Trip> findByFlightId(@Param("id") long flightId);

	  @Transactional
	  void deleteByFlightId(@Param("id") long flightId);
}
