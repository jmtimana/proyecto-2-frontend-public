package com.skillmatch.service;

import com.skillmatch.dto.request.ScoreFilterRequest;
import com.skillmatch.dto.request.UserUpdateRequest;
import com.skillmatch.dto.response.UserDetailResponse;
import com.skillmatch.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    UserDetailResponse getProfile(Long userId);
    UserDetailResponse updateProfile(Long userId, UserUpdateRequest request);
    UserResponse getUserById(Long id);
    Page<UserResponse> getAllUsers(Pageable pageable);
    Page<UserResponse> searchUsers(ScoreFilterRequest filter, Pageable pageable);
    List<UserResponse> getLeaderboard();
    void deleteUser(Long userId);
}
