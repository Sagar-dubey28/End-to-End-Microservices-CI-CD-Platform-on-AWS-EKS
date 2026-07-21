package com.ecommerce.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponseDto {
    private String token;
    private Long userId;
    private String email;
    private String fullName;
}