package com.skillmatch.controller;

import com.skillmatch.dto.response.OfertaLaboralResponse;
import com.skillmatch.security.CustomUserDetails;
import com.skillmatch.service.OfertaGuardadaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Ofertas guardadas como favoritas por el estudiante.
 */
@RestController
@RequestMapping("/api/v1/ofertas-guardadas")
@RequiredArgsConstructor
public class OfertaGuardadaController {

    private final OfertaGuardadaService ofertaGuardadaService;

    // Lista mis ofertas guardadas.
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<OfertaLaboralResponse>> getMisGuardadas(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ofertaGuardadaService.getMisOfertasGuardadas(userDetails.getId()));
    }

    // Guardar una oferta.
    @PostMapping("/{ofertaId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> guardar(
            @PathVariable Long ofertaId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ofertaGuardadaService.guardar(ofertaId, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // Quitar una oferta de mis guardadas.
    @DeleteMapping("/{ofertaId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> quitar(
            @PathVariable Long ofertaId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ofertaGuardadaService.quitar(ofertaId, userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}
