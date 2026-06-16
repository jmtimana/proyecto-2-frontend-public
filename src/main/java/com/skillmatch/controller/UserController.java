package com.skillmatch.controller;

import com.skillmatch.dto.request.ScoreFilterRequest;
import com.skillmatch.dto.request.UserUpdateRequest;
import com.skillmatch.dto.response.UserDetailResponse;
import com.skillmatch.dto.response.UserResponse;
import com.skillmatch.security.CustomUserDetails;
import com.skillmatch.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDetailResponse> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getId()));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserDetailResponse> updateProfile(
            @Valid @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getId(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Ranking de los mejores estudiantes por SkillMatch Score (cualquier usuario logueado).
    @GetMapping("/leaderboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<java.util.List<UserResponse>> getLeaderboard() {
        return ResponseEntity.ok(userService.getLeaderboard());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('EMPRESA')")
    public ResponseEntity<Page<UserResponse>> searchUsers(ScoreFilterRequest filter, Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(filter, pageable));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
