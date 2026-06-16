package com.skillmatch.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailResponse {
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
    private Set<HabilidadResponse> skills;
    private EmpresaResponse companyProfile;
    private LocalDateTime createdAt;
}
