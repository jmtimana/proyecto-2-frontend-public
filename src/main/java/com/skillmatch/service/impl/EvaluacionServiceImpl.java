package com.skillmatch.service.impl;

import com.skillmatch.dto.request.EvaluacionCreateRequest;
import com.skillmatch.dto.request.EvaluacionUpdateRequest;
import com.skillmatch.dto.response.EvaluacionDetailResponse;
import com.skillmatch.dto.response.EvaluacionResponse;
import com.skillmatch.dto.response.PreguntaResponse;
import com.skillmatch.dto.response.ResultadoResponse;
import com.skillmatch.dto.mapper.EvaluacionMapper;
import com.skillmatch.dto.mapper.PreguntaMapper;
import com.skillmatch.dto.mapper.ResultadoMapper;
import com.skillmatch.exception.EvaluacionAlreadyStartedException;
import com.skillmatch.exception.ConflictException;
import com.skillmatch.exception.ResourceNotFoundException;
import com.skillmatch.model.entity.Evaluacion;
import com.skillmatch.model.entity.Habilidad;
import com.skillmatch.model.entity.Resultado;
import com.skillmatch.model.entity.User;
import com.skillmatch.model.enums.EstadoEvaluacion;
import com.skillmatch.repository.EvaluacionRepository;
import com.skillmatch.repository.HabilidadRepository;
import com.skillmatch.repository.PreguntaRepository;
import com.skillmatch.repository.ResultadoRepository;
import com.skillmatch.repository.UserRepository;
import com.skillmatch.service.EvaluacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EvaluacionServiceImpl implements EvaluacionService {

    private final EvaluacionRepository evaluacionRepository;
    private final PreguntaRepository preguntaRepository;
    private final ResultadoRepository resultadoRepository;
    private final UserRepository userRepository;
    private final HabilidadRepository habilidadRepository;
    private final EvaluacionMapper evaluacionMapper;
    private final PreguntaMapper preguntaMapper;
    private final ResultadoMapper resultadoMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<EvaluacionResponse> getAllEvaluaciones(Pageable pageable) {
        if (!pageable.getSort().isSorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        return evaluacionRepository.findAll(pageable).map(evaluacionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluacionDetailResponse getEvaluacionById(Long id) {
        Evaluacion evaluacion = evaluacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluacion", "id", id));
        return evaluacionMapper.toDetailDto(evaluacion);
    }

    @Override
    public EvaluacionResponse createEvaluacion(EvaluacionCreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Evaluacion evaluacion = evaluacionMapper.toEntity(request);
        evaluacion.setPuntajeMaximo(0);
        evaluacion.setCreatedBy(user);

        if (request.getHabilidadIds() != null && !request.getHabilidadIds().isEmpty()) {
            Set<Habilidad> habilidades = new HashSet<>(habilidadRepository.findAllById(request.getHabilidadIds()));
            evaluacion.setHabilidades(habilidades);
        }

        evaluacion = evaluacionRepository.save(evaluacion);
        log.info("Evaluation created: {} by user {}", evaluacion.getId(), userId);
        return evaluacionMapper.toDto(evaluacion);
    }

    @Override
    public EvaluacionResponse updateEvaluacion(Long id, EvaluacionUpdateRequest request) {
        Evaluacion evaluacion = evaluacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluacion", "id", id));

        evaluacionMapper.updateEvaluacionFromDto(request, evaluacion);

        if (request.getHabilidadIds() != null) {
            Set<Habilidad> habilidades = new HashSet<>(habilidadRepository.findAllById(request.getHabilidadIds()));
            evaluacion.setHabilidades(habilidades);
        }

        evaluacion = evaluacionRepository.save(evaluacion);
        log.info("Evaluation updated: {}", id);
        return evaluacionMapper.toDto(evaluacion);
    }

    @Override
    public void deleteEvaluacion(Long id) {
        if (!evaluacionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Evaluacion", "id", id);
        }
        evaluacionRepository.deleteById(id);
        log.info("Evaluation deleted: {}", id);
    }

    @Override
    public ResultadoResponse iniciarEvaluacion(Long evaluacionId, Long userId) {
        Evaluacion evaluacion = evaluacionRepository.findById(evaluacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluacion", "id", evaluacionId));

        if (!Boolean.TRUE.equals(evaluacion.getActiva())) {
            throw new EvaluacionAlreadyStartedException("The evaluation is not active");
        }

        // No se puede volver a rendir una evaluacion que el usuario YA COMPLETO.
        boolean yaCompletada = resultadoRepository.existsByEvaluacionIdAndUserIdAndEstado(
                evaluacionId, userId, EstadoEvaluacion.COMPLETADA);
        if (yaCompletada) {
            throw new ConflictException("You have already completed this evaluation and cannot retake it");
        }

        boolean yaEnProgreso = resultadoRepository.existsByEvaluacionIdAndUserIdAndEstado(
                evaluacionId, userId, EstadoEvaluacion.EN_PROGRESO);
        if (yaEnProgreso) {
            throw new EvaluacionAlreadyStartedException("You already have an evaluation in progress");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Resultado resultado = Resultado.builder()
                .user(user)
                .evaluacion(evaluacion)
                .estado(EstadoEvaluacion.EN_PROGRESO)
                .fechaInicio(LocalDateTime.now())
                .intentos(0)
                .puntajeObtenido(0.0)
                .puntajeMaximo(evaluacion.getPuntajeMaximo() != null ? evaluacion.getPuntajeMaximo().doubleValue() : 0.0)
                .build();

        resultado = resultadoRepository.save(resultado);
        log.info("Evaluation started: {} by user {}", evaluacionId, userId);
        return resultadoMapper.toDto(resultado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreguntaResponse> getPreguntasByEvaluacion(Long evaluacionId) {
        if (!evaluacionRepository.existsById(evaluacionId)) {
            throw new ResourceNotFoundException("Evaluacion", "id", evaluacionId);
        }
        return preguntaRepository.findByEvaluacionIdOrderByOrdenAsc(evaluacionId)
                .stream()
                .map(preguntaMapper::toDto)
                .collect(Collectors.toList());
    }
}
