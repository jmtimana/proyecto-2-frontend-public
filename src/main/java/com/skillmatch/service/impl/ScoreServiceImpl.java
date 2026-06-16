package com.skillmatch.service.impl;

import com.skillmatch.dto.response.ScoreResponse;
import com.skillmatch.event.ScoreCalculadoEvent;
import com.skillmatch.exception.ResourceNotFoundException;
import com.skillmatch.model.entity.Resultado;
import com.skillmatch.model.entity.User;
import com.skillmatch.model.enums.EstadoEvaluacion;
import com.skillmatch.repository.PreguntaRepository;
import com.skillmatch.repository.RespuestaRepository;
import com.skillmatch.repository.ResultadoRepository;
import com.skillmatch.repository.UserRepository;
import com.skillmatch.service.ScoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ScoreServiceImpl implements ScoreService {

    private final ResultadoRepository resultadoRepository;
    private final UserRepository userRepository;
    private final PreguntaRepository preguntaRepository;
    private final RespuestaRepository respuestaRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public ScoreResponse calcular(Long resultadoId) {
        Resultado resultado = resultadoRepository.findById(resultadoId)
                .orElseThrow(() -> new ResourceNotFoundException("Resultado", "id", resultadoId));

        double puntajeMaximo = resultado.getPuntajeMaximo() != null && resultado.getPuntajeMaximo() > 0
                ? resultado.getPuntajeMaximo() : 100.0;
        double puntajeObtenido = resultado.getPuntajeObtenido() != null ? resultado.getPuntajeObtenido() : 0.0;

        double porcentaje = Math.round(((puntajeObtenido / puntajeMaximo) * 100.0) * 100.0) / 100.0;
        double evaluacionScore = porcentaje / 100.0;

        resultado.setPorcentaje(porcentaje);

        int totalPreguntas = preguntaRepository.countByEvaluacionId(resultado.getEvaluacion().getId());
        // Contar PREGUNTAS DISTINTAS efectivamente respondidas (corregidas), no el total de envios.
        long respondidas = respuestaRepository.findByEvaluacionIdAndUserId(
                        resultado.getEvaluacion().getId(), resultado.getUser().getId())
                .stream()
                .filter(r -> "CORRECTA".equals(r.getEstado()) || "INCORRECTA".equals(r.getEstado()))
                .map(r -> r.getPregunta().getId())
                .distinct()
                .count();

        if (totalPreguntas > 0 && respondidas >= totalPreguntas) {
            resultado.setEstado(EstadoEvaluacion.COMPLETADA);
            resultado.setFechaFin(java.time.LocalDateTime.now());
        }

        resultadoRepository.save(resultado);

        User user = resultado.getUser();
        Double currentAvg = calcularPromedioEvaluaciones(user.getId());
        Double githubScore = user.getGithubScore() != null ? user.getGithubScore() : 0.0;
        Double skillMatchScore = (currentAvg * 0.7) + (githubScore * 0.3);
        user.setSkillMatchScore(skillMatchScore);
        userRepository.save(user);

        eventPublisher.publishEvent(new ScoreCalculadoEvent(this, user.getId(), skillMatchScore,
                resultado.getEvaluacion().getId(), puntajeObtenido, puntajeMaximo));

        log.info("Score calculated for result {}: {}", resultadoId, skillMatchScore);

        return buildScoreResponse(user, evaluacionScore);
    }

    @Override
    public ScoreResponse recalcular(Long userId, Long evaluacionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Double puntajeObtenido = null;
        Double puntajeMaximo = null;

        if (evaluacionId != null) {
            Resultado resultado = resultadoRepository.findByEvaluacionIdAndUserId(evaluacionId, userId)
                    .orElse(null);
            if (resultado != null) {
                puntajeObtenido = resultado.getPuntajeObtenido();
                puntajeMaximo = resultado.getPuntajeMaximo();
            }
        }

        Double promedioEval = calcularPromedioEvaluaciones(userId);
        Double githubScore = user.getGithubScore() != null ? user.getGithubScore() : 0.0;
        Double skillMatchScore = (promedioEval * 0.7) + (githubScore * 0.3);

        user.setSkillMatchScore(skillMatchScore);
        userRepository.save(user);

        log.info("Score recalculated for user {}: {}", userId, skillMatchScore);

        eventPublisher.publishEvent(new ScoreCalculadoEvent(this, userId, skillMatchScore,
                evaluacionId, puntajeObtenido, puntajeMaximo));

        return buildScoreResponse(user, promedioEval);
    }

    @Override
    public Double calcularSkillMatchScore(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Double promedioEval = calcularPromedioEvaluaciones(userId);
        Double githubScore = user.getGithubScore() != null ? user.getGithubScore() : 0.0;

        return (promedioEval * 0.7) + (githubScore * 0.3);
    }

    private Double calcularPromedioEvaluaciones(Long userId) {
        List<Resultado> resultados = resultadoRepository.findByUserIdAndEstado(userId, EstadoEvaluacion.COMPLETADA);
        if (resultados.isEmpty()) return 0.0;
        return resultados.stream()
                .filter(r -> r.getPorcentaje() != null)
                .mapToDouble(Resultado::getPorcentaje)
                .average()
                .orElse(0.0) / 100.0;
    }

    private ScoreResponse buildScoreResponse(User user, Double evaluacionScore) {
        Double skillScore = user.getSkillMatchScore() != null ? user.getSkillMatchScore() : 0.0;
        Double githubScore = user.getGithubScore() != null ? user.getGithubScore() : 0.0;

        String nivel;
        if (skillScore >= 0.8) nivel = "EXCELENTE";
        else if (skillScore >= 0.6) nivel = "BUENO";
        else if (skillScore >= 0.4) nivel = "REGULAR";
        else nivel = "BASICO";

        return ScoreResponse.builder()
                .userId(user.getId())
                .skillMatchScore(skillScore)
                .githubScore(githubScore)
                .totalScore(skillScore)
                .level(nivel)
                .build();
    }
}
