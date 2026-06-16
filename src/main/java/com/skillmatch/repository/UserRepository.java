package com.skillmatch.repository;

import com.skillmatch.model.entity.User;
import com.skillmatch.model.enums.TipoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByTipo(TipoUsuario tipo);

    // Top 10 estudiantes con score, de mayor a menor (para el ranking / leaderboard).
    List<User> findTop10ByTipoAndSkillMatchScoreIsNotNullOrderBySkillMatchScoreDesc(TipoUsuario tipo);

    @Query("SELECT u FROM User u WHERE u.githubToken IS NOT NULL")
    List<User> findUsersWithGithubToken();

    @Query("SELECT u FROM User u WHERE u.skillMatchScore >= :scoreMin")
    List<User> findBySkillMatchScoreGreaterThanEqual(Double scoreMin);

    @Query("SELECT u FROM User u JOIN u.habilidades h WHERE h.id IN :habilidadIds GROUP BY u HAVING COUNT(DISTINCT h.id) >= :minCount")
    List<User> findUsersWithMinHabilidades(Set<Long> habilidadIds, long minCount);
}
