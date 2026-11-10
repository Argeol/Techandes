package com.example.demo.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Rutas públicas
                        .requestMatchers("/api/auth/**", "/error").permitAll()

                        // 2. Módulo de EMPLEADOS (Específico -> General)
                        .requestMatchers("/api/empleados/me").hasAnyRole("ADMIN", "VENDEDOR")
                        .requestMatchers("/api/empleados/**").hasRole("ADMIN")

                        // 3. Módulo de PRODUCTOS (Específico por Verbo HTTP -> General)
                        // Cualquier consulta (GET) la pueden hacer ADMIN y VENDEDOR
                        .requestMatchers(HttpMethod.GET, "/api/productos/**").hasAnyRole("ADMIN", "VENDEDOR")
                        // Cualquier otra acción (POST, PUT, DELETE) sobre productos es EXCLUSIVA de
                        // ADMIN
                        .requestMatchers("/api/productos/**").hasRole("ADMIN")

                        // 4. Módulo de PEDIDOS y CLIENTES (General para ambos roles)
                        .requestMatchers("/api/pedidos/**").hasAnyRole("ADMIN", "VENDEDOR")
                        .requestMatchers("/api/clientes/**").hasAnyRole("ADMIN", "VENDEDOR")

                        // 5. Regla Global Final (Cualquier otro endpoint no listado requiere estar
                        // autenticado)
                        .anyRequest().authenticated() // El resto requiere JWT válido en la Cookie
                );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000")); // Puerto por defecto de Next.js
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // OBLIGATORIO para enviar y recibir Cookies HttpOnly

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}