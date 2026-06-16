package com.skillmatch.service.impl;

import com.skillmatch.dto.request.ScoreFilterRequest;
import com.skillmatch.dto.request.UserUpdateRequest;
import com.skillmatch.dto.response.UserDetailResponse;
import com.skillmatch.dto.response.UserResponse;
import com.skillmatch.dto.mapper.UserMapper;
import com.skillmatch.exception.ResourceNotFoundException;
import com.skillmatch.model.entity.Postulacion;
import com.skillmatch.model.entity.User;
import com.skillmatch.model.enums.TipoUsuario;
import com.skillmatch.repository.PostulacionRepository;
import com.skillmatch.repository.UserRepository;
import com.skillmatch.service.UserService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PostulacionRepository postulacionRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return userMapper.toDetailDto(user);
    }

    @Override
    public UserDetailResponse updateProfile(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        userMapper.updateUserFromDto(request, user);
        user = userRepository.save(user);
        log.info("Profile updated for user: {}", userId);
        return userMapper.toDetailDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(ScoreFilterRequest filter, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getScoreMin() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("skillMatchScore"), filter.getScoreMin()));
            }
            if (filter.getScoreMax() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("skillMatchScore"), filter.getScoreMax()));
            }
            if (filter.getGithubUsername() != null && !filter.getGithubUsername().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("githubUsername")),
                        "%" + filter.getGithubUsername().toLowerCase() + "%"));
            }
            if (filter.getHabilidadIds() != null && !filter.getHabilidadIds().isEmpty()) {
                predicates.add(root.join("habilidades").get("id").in(filter.getHabilidadIds()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec, pageable).map(userMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getLeaderboard() {
        return userRepository
                .findTop10ByTipoAndSkillMatchScoreIsNotNullOrderBySkillMatchScoreDesc(TipoUsuario.ESTUDIANTE)
                .stream()
                .map(userMapper::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        postulacionRepository.deleteAll(user.getPostulaciones());
        user.getPostulaciones().clear();

        userRepository.delete(user);
        log.info("User deleted: {}", userId);
    }
}
