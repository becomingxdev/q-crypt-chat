package com.solveIT.qkdchatserver.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (Cross-Site Request Forgery) since we are using a token-based stateless API
            .csrf(csrf -> csrf.disable())

            // Set the session management to stateless, as we are not using traditional sessions
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Define authorization rules for different endpoints
            .authorizeHttpRequests(auth -> auth
                // Allow unauthenticated access to the WebSocket handshake endpoints
                .requestMatchers("/ws/**").permitAll()
                // All other requests must be authenticated
                .anyRequest().authenticated()
            );

        // We will add the Firebase token filter here in a later step

        return http.build();
    }
}