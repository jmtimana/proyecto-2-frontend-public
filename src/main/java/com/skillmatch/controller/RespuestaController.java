package com.skillmatch.controller;

import com.skillmatch.dto.request.RespuestaSubmitRequest;
import com.skillmatch.dto.response.RespuestaResponse;
import com.skillmatch.security.CustomUserDetails;
import com.skillmatch.service.RespuestaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/respuestas")
@RequiredArgsConstructor
public class RespuestaController {

    private final RespuestaService respuestaService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RespuestaResponse> submitRespuesta(
            @Valid @RequestBody RespuestaSubmitRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(respuestaService.submitRespuesta(request, userDetails.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RespuestaResponse> getRespuesta(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(respuestaService.getRespuesta(id, userDetails.getId()));
    }

    // Todas mis respuestas de una evaluacion (detalle pregunta por pregunta).
    @GetMapping("/evaluacion/{evaluacionId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<java.util.List<RespuestaResponse>> getMisRespuestasByEvaluacion(
            @PathVariable Long evaluacionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(
                respuestaService.getMisRespuestasByEvaluacion(evaluacionId, userDetails.getId()));
    }
}