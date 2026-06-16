package com.skillmatch.service;

import com.skillmatch.dto.response.OfertaLaboralResponse;

import java.util.List;

public interface OfertaGuardadaService {
    void guardar(Long ofertaId, Long userId);
    void quitar(Long ofertaId, Long userId);
    List<OfertaLaboralResponse> getMisOfertasGuardadas(Long userId);
}
