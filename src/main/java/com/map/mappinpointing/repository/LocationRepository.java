package com.map.mappinpointing.repository;

import com.map.mappinpointing.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, Long> {
}
