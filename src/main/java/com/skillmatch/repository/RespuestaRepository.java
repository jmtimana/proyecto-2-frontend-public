package com.skillmatch.repository;

import com.skillmatch.model.entity.Respuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RespuestaRepository extends JpaRepository<Respuesta, Long> {
    List<Respuesta> findByEvaluacionIdAndUserId(Long evaluacionId, Long userId);
    Optional<Respuesta> findByPreguntaIdAndUserIdAndEvaluacionId(Long preguntaId, Long userId, Long evaluacionId);
    int countByEvaluacionIdAndUserIdAndEsCorrectaTrue(Long evaluacionId, Long userId);
    int countByEvaluacionIdAndUserId(Long evaluacionId, Long userId);

    // Cantidad de envios para una pregunta concreta (para calcular el numero de intento
    // de forma segura, sin reventar con NonUniqueResultException cuando hay varios envios).
    int countByPreguntaIdAndUserIdAndEvaluacionId(Long preguntaId, Long userId, Long evaluacionId);

    // Para impedir responder de nuevo una pregunta ya resuelta correctamente.
    boolean existsByPreguntaIdAndUserIdAndEvaluacionIdAndEsCorrectaTrue(Long preguntaId, Long userId, Long evaluacionId);

    // Cuantos envios CORRECTOS hay de una misma pregunta (para sumar el puntaje una sola vez).
    int countByPreguntaIdAndUserIdAndEvaluacionIdAndEsCorrectaTrue(Long preguntaId, Long userId, Long evaluacionId);
}
