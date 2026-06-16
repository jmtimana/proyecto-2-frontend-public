package com.skillmatch.service.impl;

import com.skillmatch.client.PistonClient;
import com.skillmatch.event.EvaluacionCompletadaEvent;
import com.skillmatch.exception.CodeExecutionException;
import com.skillmatch.exception.ResourceNotFoundException;
import com.skillmatch.model.entity.Respuesta;
import com.skillmatch.model.entity.Resultado;
import com.skillmatch.repository.RespuestaRepository;
import com.skillmatch.service.PistonExecutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.skillmatch.repository.ResultadoRepository;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Slf4j
@Service
@RequiredArgsConstructor
public class PistonExecutionServiceImpl implements PistonExecutionService {

    private final PistonClient pistonClient;
    private final RespuestaRepository respuestaRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ResultadoRepository resultadoRepository;

    @Override
    @Async
    @Transactional
    public void ejecutarAsync(Long respuestaId) {
        Respuesta respuesta = respuestaRepository.findById(respuestaId)
                .orElseThrow(() -> new ResourceNotFoundException("Respuesta", "id", respuestaId));

        try {
            Map<String, Object> result = ejecutar(
                    respuesta.getCodigoEnviado(),
                    respuesta.getLenguaje(),
                    null);

            String output = "";
            Boolean esCorrecta = false;
            Long tiempoMs = 0L;
            Long memoriaKb = 0L;

            if (result.containsKey("run")) {
                Map<String, Object> runResult = (Map<String, Object>) result.get("run");
                output = (String) runResult.getOrDefault("output", "");
                Number time = (Number) runResult.get("time");
                tiempoMs = time != null ? (long) (time.doubleValue() * 1000) : 0L;
                Number memory = (Number) runResult.get("memory");
                memoriaKb = memory != null ? memory.longValue() : 0L;
            }

            esCorrecta = verificarSolucion(respuesta, output);

            respuesta.setSalidaObtenida(output);
            respuesta.setEsCorrecta(esCorrecta);
            respuesta.setTiempoEjecucionMs(tiempoMs);
            respuesta.setMemoriaKb(memoriaKb);
            respuesta.setEstado(esCorrecta ? "CORRECTA" : "INCORRECTA");
            respuestaRepository.save(respuesta);

            // Actualizar puntaje del resultado
            if (esCorrecta) {
                // Sumar el puntaje SOLO la primera vez que esta pregunta se responde bien,
                // para que reenviar una respuesta correcta no infle el score.
                int correctasDeEstaPregunta = respuestaRepository
                        .countByPreguntaIdAndUserIdAndEvaluacionIdAndEsCorrectaTrue(
                                respuesta.getPregunta().getId(),
                                respuesta.getUser().getId(),
                                respuesta.getEvaluacion().getId());
                if (correctasDeEstaPregunta == 1) {
                    Resultado resultado = resultadoRepository.findByEvaluacionIdAndUserId(
                                    respuesta.getEvaluacion().getId(), respuesta.getUser().getId())
                            .orElse(null);
                    if (resultado != null) {
                        double puntajeActual = resultado.getPuntajeObtenido() != null ? resultado.getPuntajeObtenido() : 0.0;
                        resultado.setPuntajeObtenido(puntajeActual + respuesta.getPregunta().getPuntaje());
                        resultadoRepository.save(resultado);
                    }
                }
            }

            eventPublisher.publishEvent(new EvaluacionCompletadaEvent(
                    this, respuestaId, respuesta.getEvaluacion().getId(),
                    respuesta.getUser().getId(), esCorrecta, tiempoMs, memoriaKb));

            log.info("Code executed for response {}: correct={}", respuestaId, esCorrecta);

        } catch (Exception e) {
            log.error("Error executing code for response {}: {}", respuestaId, e.getMessage());
            respuesta.setEstado("ERROR");
            respuesta.setSalidaObtenida("Error: " + e.getMessage());
            respuestaRepository.save(respuesta);
        }
    }

    @Override
    public Map<String, Object> ejecutar(String codigo, String lenguaje, String stdin) {
        try {
            String version = obtenerVersion(lenguaje);
            CompletableFuture<Map<String, Object>> future = pistonClient.executeCode(lenguaje, version, codigo, stdin);
            Map<String, Object> result = future.get();
            return result;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new CodeExecutionException("Execution interrupted: " + e.getMessage());
        } catch (ExecutionException e) {
            throw new CodeExecutionException("Execution error: " + e.getMessage());
        }
    }

    private Boolean verificarSolucion(Respuesta respuesta, String salidaObtenida) {
        String solucionEsperada = respuesta.getPregunta().getSolucionEsperada();
        if (solucionEsperada == null || solucionEsperada.isEmpty()) {
            return false;
        }
        String salida = salidaObtenida != null ? salidaObtenida : "";
        return solucionEsperada.trim().equals(salida.trim());
    }

    private String obtenerVersion(String lenguaje) {
        return "*";
    }
}
