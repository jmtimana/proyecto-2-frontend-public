package com.skillmatch.service.impl;

import com.skillmatch.dto.mapper.OfertaLaboralMapper;
import com.skillmatch.dto.response.OfertaLaboralResponse;
import com.skillmatch.exception.ConflictException;
import com.skillmatch.exception.ResourceNotFoundException;
import com.skillmatch.model.entity.OfertaGuardada;
import com.skillmatch.model.entity.OfertaLaboral;
import com.skillmatch.model.entity.User;
import com.skillmatch.repository.OfertaGuardadaRepository;
import com.skillmatch.repository.OfertaLaboralRepository;
import com.skillmatch.repository.UserRepository;
import com.skillmatch.service.OfertaGuardadaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OfertaGuardadaServiceImpl implements OfertaGuardadaService {

    private final OfertaGuardadaRepository ofertaGuardadaRepository;
    private final OfertaLaboralRepository ofertaLaboralRepository;
    private final UserRepository userRepository;
    private final OfertaLaboralMapper ofertaLaboralMapper;

    @Override
    public void guardar(Long ofertaId, Long userId) {
        OfertaLaboral oferta = ofertaLaboralRepository.findById(ofertaId)
                .orElseThrow(() -> new ResourceNotFoundException("OfertaLaboral", "id", ofertaId));

        if (ofertaGuardadaRepository.existsByUserIdAndOfertaLaboralId(userId, ofertaId)) {
            throw new ConflictException("You have already saved this offer");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        OfertaGuardada guardada = OfertaGuardada.builder()
                .user(user)
                .ofertaLaboral(oferta)
                .build();
        ofertaGuardadaRepository.save(guardada);
        log.info("Offer {} saved by user {}", ofertaId, userId);
    }

    @Override
    public void quitar(Long ofertaId, Long userId) {
        OfertaGuardada guardada = ofertaGuardadaRepository
                .findByUserIdAndOfertaLaboralId(userId, ofertaId)
                .orElseThrow(() -> new ResourceNotFoundException("OfertaGuardada", "ofertaId", ofertaId));
        ofertaGuardadaRepository.delete(guardada);
        log.info("Offer {} removed from saved by user {}", ofertaId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfertaLaboralResponse> getMisOfertasGuardadas(Long userId) {
        return ofertaGuardadaRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(g -> ofertaLaboralMapper.toDto(g.getOfertaLaboral()))
                .collect(Collectors.toList());
    }
}
