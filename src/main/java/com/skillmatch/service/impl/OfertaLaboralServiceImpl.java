package com.skillmatch.service.impl;

import com.skillmatch.dto.request.OfertaLaboralCreateRequest;
import com.skillmatch.dto.request.OfertaLaboralUpdateRequest;
import com.skillmatch.dto.response.OfertaLaboralDetailResponse;
import com.skillmatch.dto.response.OfertaLaboralResponse;
import com.skillmatch.dto.mapper.OfertaLaboralMapper;
import com.skillmatch.exception.ForbiddenException;
import com.skillmatch.exception.InvalidOperationException;
import com.skillmatch.exception.ResourceNotFoundException;
import com.skillmatch.model.entity.Habilidad;
import com.skillmatch.model.entity.OfertaLaboral;
import com.skillmatch.model.entity.User;
import com.skillmatch.model.enums.EstadoOferta;
import com.skillmatch.repository.HabilidadRepository;
import com.skillmatch.repository.OfertaLaboralRepository;
import com.skillmatch.repository.PostulacionRepository;
import com.skillmatch.repository.UserRepository;
import com.skillmatch.service.OfertaLaboralService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OfertaLaboralServiceImpl implements OfertaLaboralService {

    private final OfertaLaboralRepository ofertaLaboralRepository;
    private final UserRepository userRepository;
    private final HabilidadRepository habilidadRepository;
    private final PostulacionRepository postulacionRepository;
    private final OfertaLaboralMapper ofertaLaboralMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<OfertaLaboralResponse> getAllOfertas(Pageable pageable, String estado, String search) {
        Specification<OfertaLaboral> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (estado != null && !estado.isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("estado"), EstadoOferta.valueOf(estado.toUpperCase())));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid offer status in filter: {}", estado);
                }
            }
            if (search != null && !search.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("titulo")), "%" + search.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return ofertaLaboralRepository.findAll(spec, pageable).map(ofertaLaboralMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public OfertaLaboralDetailResponse getOfertaById(Long id) {
        OfertaLaboral oferta = ofertaLaboralRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OfertaLaboral", "id", id));
        return ofertaLaboralMapper.toDetailDto(oferta);
    }

    @Override
    public OfertaLaboralResponse createOferta(OfertaLaboralCreateRequest request, Long empresaUserId) {
        User empresaUser = userRepository.findById(empresaUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", empresaUserId));

        OfertaLaboral oferta = ofertaLaboralMapper.toEntity(request);
        oferta.setEmpresaUser(empresaUser);
        oferta.setEstado(EstadoOferta.ACTIVA);
        validarDatosOferta(oferta);

        if (request.getHabilidadIds() != null && !request.getHabilidadIds().isEmpty()) {
            Set<Habilidad> habilidades = new HashSet<>(habilidadRepository.findAllById(request.getHabilidadIds()));
            if (habilidades.size() != request.getHabilidadIds().size()) {
                throw new ResourceNotFoundException("Habilidad", "ids", request.getHabilidadIds());
            }
            oferta.setHabilidades(habilidades);
        }

        oferta = ofertaLaboralRepository.save(oferta);
        log.info("Job offer created: {} by company {}", oferta.getId(), empresaUserId);
        return ofertaLaboralMapper.toDto(oferta);
    }

    @Override
    public OfertaLaboralResponse updateOferta(Long id, OfertaLaboralUpdateRequest request, Long empresaUserId) {
        OfertaLaboral oferta = ofertaLaboralRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OfertaLaboral", "id", id));

        if (!oferta.getEmpresaUser().getId().equals(empresaUserId)) {
            throw new ForbiddenException("You do not have permission to modify this offer");
        }

        ofertaLaboralMapper.updateOfertaFromDto(request, oferta);

        if (request.getEstado() != null) {
            try {
                oferta.setEstado(EstadoOferta.valueOf(request.getEstado().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new InvalidOperationException("Invalid offer status: " + request.getEstado()
                        + ". Allowed values: ACTIVA, CERRADA, PAUSADA");
            }
        }
        if (request.getHabilidadIds() != null) {
            Set<Habilidad> habilidades = new HashSet<>(habilidadRepository.findAllById(request.getHabilidadIds()));
            oferta.setHabilidades(habilidades);
        }

        validarDatosOferta(oferta);

        oferta = ofertaLaboralRepository.save(oferta);
        log.info("Job offer updated: {}", id);
        return ofertaLaboralMapper.toDto(oferta);
    }

    // Reglas de negocio para los datos numericos de una oferta.
    private void validarDatosOferta(OfertaLaboral oferta) {
        Double min = oferta.getSalarioMin();
        Double max = oferta.getSalarioMax();
        Double score = oferta.getScoreMinimoRequerido();

        if (min != null && min < 0) {
            throw new InvalidOperationException("Minimum salary cannot be negative");
        }
        if (max != null && max < 0) {
            throw new InvalidOperationException("Maximum salary cannot be negative");
        }
        if (min != null && max != null && min > max) {
            throw new InvalidOperationException("Minimum salary cannot be greater than maximum salary");
        }
        if (score != null && (score < 0.0 || score > 1.0)) {
            throw new InvalidOperationException("Minimum required score must be between 0 and 1");
        }
    }

    @Override
    public void deleteOferta(Long id, Long empresaUserId) {
        OfertaLaboral oferta = ofertaLaboralRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("OfertaLaboral", "id", id));

        if (!oferta.getEmpresaUser().getId().equals(empresaUserId)) {
            throw new ForbiddenException("You do not have permission to delete this offer");
        }

        if (postulacionRepository.existsByOfertaLaboralId(id)) {
            throw new InvalidOperationException(
                    "Cannot delete the offer because it has active applications. Change its status to CLOSED.");
        }

        ofertaLaboralRepository.deleteById(id);
        log.info("Job offer deleted: {}", id);
    }
}
