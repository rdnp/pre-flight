package de.rdnp.preflight.flightplanner;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.web.bind.annotation.CrossOrigin;

@RepositoryRestResource(collectionResourceRel = "flights", path = "flights")
public interface FlightRepository extends PagingAndSortingRepository<Flight, Long> {
	  List<Flight> findByDestination(@Param("destination") String destination);
}
