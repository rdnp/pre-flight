package de.rdnp.preflight.flightplanner;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "route-segments", path = "route-segments")
public interface RouteSegmentRepository extends CrudRepository<RouteSegment, Long> {

	List<RouteSegment> findBySourcePointIdAndTargetPointId(@Param("from") String source, @Param("to") String target);

	@Transactional
	void deleteBySourcePointIdAndTargetPointId(@Param("from") String source, @Param("to") String target);

}
