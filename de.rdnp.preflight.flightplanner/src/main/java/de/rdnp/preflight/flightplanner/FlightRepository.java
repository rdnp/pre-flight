package de.rdnp.preflight.flightplanner;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "flights", path = "flights")
public interface FlightRepository extends CrudRepository<Flight, Long> {
	
	  List<Flight> findByName(@Param("name") String name);

	  @Transactional
	  void deleteByName(@Param("name") String name);
}
