package com.personalfinance.config;

import com.personalfinance.api.user.entity.Role;
import com.personalfinance.api.user.entity.User;
import com.personalfinance.api.user.entity.Username;
import com.personalfinance.api.user.repository.UserRepository;
import com.personalfinance.api.user.repository.UsernameRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UsernameRepository usernameRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email}")
    private String adminEmail;
    @Value("${admin.username}")
    private String adminUsername;
    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = User.builder()
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(admin);
        Username username = Username.builder()
                .username(adminUsername)
                .changedAt(LocalDateTime.now())
                .user(admin)
                .build();
        usernameRepository.save(username);
    }
}
