package com.skillmatch.service;

import com.skillmatch.dto.request.RespuestaSubmitRequest;
import com.skillmatch.dto.response.RespuestaResponse;

import java.util.List;

public interface RespuestaService {
    RespuestaResponse submitRespuesta(RespuestaSubmitRequest request, Long userId);

    RespuestaResponse getRespuesta(Long respuestaId, Long userId);

    // Todas mis respuestas de una evaluacion (para ver el detalle pregunta por pregunta).
    List<RespuestaResponse> getMisRespuestasByEvaluacion(Long evaluacionId, Long userId);
}