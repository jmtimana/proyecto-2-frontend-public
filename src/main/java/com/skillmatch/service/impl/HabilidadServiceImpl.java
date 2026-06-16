package com.skillmatch.service.impl;

import com.skillmatch.dto.request.HabilidadCreateRequest;
import com.skillmatch.dto.response.HabilidadResponse;
import com.skillmatch.dto.mapper.HabilidadMapper;
import com.skillmatch.exception.DuplicateResourceException;
import com.skillmatch.exception.ConflictException;
import com.skillmatch.exception.ResourceNotFoundException;
import com.skillmatch.model.entity.Habilidad;
import com.skillmatch.repository.HabilidadRepository;
import com.skillmatch.service.HabilidadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class HabilidadServiceImpl implements HabilidadService {

    private final HabilidadRepository habilidadRepository;
    private final HabilidadMapper habilidadMapper;

    @Override
    @Transactional(readOnly = true)
    public List<HabilidadResponse> getAllHabilidades() {
        return habilidadRepository.findAll()
                .stream()
                .map(habilidadMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public HabilidadResponse createHabilidad(HabilidadCreateRequest request) {
        if (habilidadRepository.existsByNombre(request.getNombre())) {
            throw new DuplicateResourceException("Skill already exists: " + request.getNombre());
        }

        Habilidad habilidad = habilidadMapper.toEntity(request);
        habilidad = habilidadRepository.save(habilidad);
        log.info("Skill created: {}", habilidad.getNombre());
        return habilidadMapper.toDto(habilidad);
    }

    @Override
    public void deleteHabilidad(Long id) {
        if (!habilidadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Habilidad", "id", id);
        }
        try {
            habilidadRepository.deleteById(id);
            habilidadRepository.flush(); // forzamos el DELETE aqui para capturar el error de FK
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException(
                    "Cannot delete the skill because it is in use by offers, evaluations or users");
        }
        log.info("Skill deleted: {}", id);
    }
}
