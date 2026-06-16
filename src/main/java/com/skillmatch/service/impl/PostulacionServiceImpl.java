package com.skillmatch.service.impl;

import com.skillmatch.dto.request.PostulacionCreateRequest;
import com.skillmatch.dto.request.PostulacionEstadoRequest;
import com.skillmatch.dto.response.PostulacionResponse;
import com.skillmatch.dto.mapper.PostulacionMapper;
import com.skillmatch.event.NotificacionEmailEvent;
import com.skillmatch.exception.*;
import com.skillmatch.model.entity.OfertaLaboral;
import com.skillmatch.model.entity.Postulacion;
import com.skillmatch.model.entity.User;
import com.skillmatch.model.enums.EstadoOferta;
import com.skillmatch.model.enums.EstadoPostulacion;
import com.skillmatch.repository.OfertaLaboralRepository;
import com.skillmatch.repository.PostulacionRepository;
import com.skillmatch.repository.UserRepository;
import com.skillmatch.service.PostulacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PostulacionServiceImpl implements PostulacionService {

    private final PostulacionRepository postulacionRepository;
    private final OfertaLaboralRepository ofertaLaboralRepository;
    private final UserRepository userRepository;
    private final PostulacionMapper postulacionMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public PostulacionResponse postular(PostulacionCreateRequest request, Long userId) {
        OfertaLaboral oferta = ofertaLaboralRepository.findById(request.getOfertaLaboralId())
                .orElseThrow(() -> new ResourceNotFoundException("OfertaLaboral", "id", request.getOfertaLaboralId()));

        if (oferta.getEstado() != EstadoOferta.ACTIVA) {
            throw new ValidationException("The offer is not active");
        }

        // No tiene sentido postularse a tu propia oferta.
        if (oferta.getEmpresaUser() != null && oferta.getEmpresaUser().getId().equals(userId)) {
            throw new ForbiddenException("You cannot apply to your own offer");
        }

        if (postulacionRepository.existsByUserIdAndOfertaLaboralId(userId, request.getOfertaLaboralId())) {
            throw new ConflictException("You have already applied to this offer");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Double scoreMinimo = oferta.getScoreMinimoRequerido();
        double scoreUsuario = user.getSkillMatchScore() != null ? user.getSkillMatchScore() : 0.0;
        if (scoreMinimo != null && scoreUsuario < scoreMinimo) {
            throw new ValidationException("You do not meet the minimum required score: " + scoreMinimo);
        }

        Postulacion postulacion = Postulacion.builder()
                .user(user)
                .ofertaLaboral(oferta)
                .estado(EstadoPostulacion.PENDIENTE)
                .cartaPresentacion(request.getCartaPresentacion())
                .build();

        postulacion = postulacionRepository.save(postulacion);

        String empresaEmail = oferta.getEmpresaUser().getEmail();
        eventPublisher.publishEvent(new NotificacionEmailEvent(this, empresaEmail, "NUEVA_POSTULACION",
                Map.of("ofertaTitulo", oferta.getTitulo(), "usuarioNombre", user.getNombre() + " " + user.getApellido())));

        log.info("Application created: {} for offer {} by user {}", postulacion.getId(), oferta.getId(), userId);
        return postulacionMapper.toDto(postulacion);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostulacionResponse> getMisPostulaciones(Long userId, Pageable pageable) {
        return postulacionRepository.findByUserId(userId, pageable)
                .map(postulacionMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostulacionResponse> getPostulacionesByOferta(Long ofertaId, Long empresaUserId, Pageable pageable) {
        OfertaLaboral oferta = ofertaLaboralRepository.findById(ofertaId)
                .orElseThrow(() -> new ResourceNotFoundException("OfertaLaboral", "id", ofertaId));

        if (!oferta.getEmpresaUser().getId().equals(empresaUserId)) {
            throw new ForbiddenException("You do not have permission to view applications for this offer");
        }

        return postulacionRepository.findByOfertaLaboralId(ofertaId, pageable)
                .map(postulacionMapper::toDto);
    }

    @Override
    public PostulacionResponse actualizarEstado(Long postulacionId, PostulacionEstadoRequest request, Long empresaUserId) {
        Postulacion postulacion = postulacionRepository.findById(postulacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Postulacion", "id", postulacionId));

        OfertaLaboral oferta = postulacion.getOfertaLaboral();
        if (!oferta.getEmpresaUser().getId().equals(empresaUserId)) {
            throw new ForbiddenException("You do not have permission to update this application");
        }

        EstadoPostulacion nuevoEstado;
        try {
            nuevoEstado = EstadoPostulacion.valueOf(request.getEstado().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidOperationException("Invalid application status: " + request.getEstado()
                    + ". Allowed values: PENDIENTE, ACEPTADA, RECHAZADA");
        }

        EstadoPostulacion estadoActual = postulacion.getEstado();
        if (estadoActual == EstadoPostulacion.ACEPTADA || estadoActual == EstadoPostulacion.RECHAZADA) {
            throw new InvalidOperationException("Cannot change status from " + estadoActual + " to " + nuevoEstado);
        }

        postulacion.setEstado(nuevoEstado);
        postulacion = postulacionRepository.save(postulacion);
        log.info("Application {} updated to status: {}", postulacionId, request.getEstado());
        return postulacionMapper.toDto(postulacion);
    }
}
