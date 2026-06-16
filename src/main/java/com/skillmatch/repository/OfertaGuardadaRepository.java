package com.skillmatch.repository;

import com.skillmatch.model.entity.OfertaGuardada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfertaGuardadaRepository extends JpaRepository<OfertaGuardada, Long> {
    boolean existsByUserIdAndOfertaLaboralId(Long userId, Long ofertaLaboralId);
    Optional<OfertaGuardada> findByUserIdAndOfertaLaboralId(Long userId, Long ofertaLaboralId);
    List<OfertaGuardada> findByUserIdOrderByCreatedAtDesc(Long userId);
}
