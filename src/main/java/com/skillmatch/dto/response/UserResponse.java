package com.skillmatch.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String type;
    private Double skillMatchScore;
    private Double githubScore;
    private String githubUsername;
    private LocalDateTime githubConnectedAt;
    private String bio;
    private LocalDateTime createdAt;
}
