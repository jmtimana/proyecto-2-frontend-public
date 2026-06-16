package com.skillmatch.service.impl;

import com.skillmatch.dto.request.RespuestaSubmitRequest;
import com.skillmatch.dto.response.RespuestaResponse;
import com.skillmatch.dto.mapper.RespuestaMapper;
import com.skillmatch.event.EvaluacionEnviadaEvent;
import com.skillmatch.exception.ForbiddenException;
import com.skillmatch.exception.InvalidOperationException;
import com.skillmatch.exception.ResourceNotFoundException;
import com.skillmatch.model.entity.Evaluacion;
import com.skillmatch.model.entity.Pregunta;
import com.skillmatch.model.entity.Respuesta;
import com.skillmatch.model.entity.Resultado;
import com.skillmatch.model.entity.User;
import com.skillmatch.model.enums.EstadoEvaluacion;
import com.skillmatch.repository.EvaluacionRepository;
import com.skillmatch.repository.PreguntaRepository;
import com.skillmatch.repository.RespuestaRepository;
import com.skillmatch.repository.ResultadoRepository;
import com.skillmatch.repository.UserRepository;
import com.skillmatch.service.RespuestaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RespuestaServiceImpl implements RespuestaService {

    private final RespuestaRepository respuestaRepository;
    private final PreguntaRepository preguntaRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final ResultadoRepository resultadoRepository;
    private final UserRepository userRepository;
    private final RespuestaMapper respuestaMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public RespuestaResponse submitRespuesta(RespuestaSubmitRequest request, Long userId) {
        Pregunta pregunta = preguntaRepository.findById(request.getPreguntaId())
                .orElseThrow(() -> new ResourceNotFoundException("Pregunta", "id", request.getPreguntaId()));

        Evaluacion evaluacion = evaluacionRepository.findById(request.getEvaluacionId())
                .orElseThrow(() -> new ResourceNotFoundException("Evaluacion", "id", request.getEvaluacionId()));

        // La pregunta debe pertenecer a la evaluacion indicada (evita mezclar evaluaciones).
        if (pregunta.getEvaluacion() == null
                || !pregunta.getEvaluacion().getId().equals(request.getEvaluacionId())) {
            throw new InvalidOperationException("The question does not belong to this evaluation");
        }

        Resultado resultado = resultadoRepository.findByEvaluacionIdAndUserIdAndEstado(
                        request.getEvaluacionId(), userId, EstadoEvaluacion.EN_PROGRESO)
                .orElseThrow(() -> new InvalidOperationException("There is no evaluation in progress"));

        // No se puede volver a responder una pregunta que ya fue resuelta correctamente.
        if (respuestaRepository.existsByPreguntaIdAndUserIdAndEvaluacionIdAndEsCorrectaTrue(
                request.getPreguntaId(), userId, request.getEvaluacionId())) {
            throw new InvalidOperationException("You have already answered this question correctly");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        int nuevoIntento = respuestaRepository.countByPreguntaIdAndUserIdAndEvaluacionId(
                request.getPreguntaId(), userId, request.getEvaluacionId()) + 1;

        resultado.setIntentos(resultado.getIntentos() != null ? resultado.getIntentos() + 1 : 1);
        resultadoRepository.save(resultado);

        Respuesta respuesta = Respuesta.builder()
                .user(user)
                .pregunta(pregunta)
                .evaluacion(evaluacion)
                .codigoEnviado(request.getCodigo())
                .lenguaje(request.getLenguaje())
                .estado("PENDIENTE")
                .intentos(nuevoIntento)
                .build();

        respuesta = respuestaRepository.save(respuesta);

        eventPublisher.publishEvent(new EvaluacionEnviadaEvent(
                this, respuesta.getId(), pregunta.getId(), request.getCodigo(), request.getLenguaje()));

        log.info("Answer submitted: {} by user {}", respuesta.getId(), userId);
        return respuestaMapper.toDto(respuesta);
    }

    @Override
    @Transactional(readOnly = true)
    public RespuestaResponse getRespuesta(Long respuestaId, Long userId) {
        Respuesta respuesta = respuestaRepository.findById(respuestaId)
                .orElseThrow(() -> new ResourceNotFoundException("Respuesta", "id", respuestaId));

        // Seguridad: solo el dueno de la respuesta puede verla
        if (!respuesta.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to view this answer");
        }

        return respuestaMapper.toDto(respuesta);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<RespuestaResponse> getMisRespuestasByEvaluacion(Long evaluacionId, Long userId) {
        return respuestaRepository.findByEvaluacionIdAndUserId(evaluacionId, userId)
                .stream()
                .map(respuestaMapper::toDto)
                .collect(java.util.stream.Collectors.toList());
    }
}