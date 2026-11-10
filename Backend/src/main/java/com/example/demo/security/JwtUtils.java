package com.example.demo.security;

import com.example.demo.Models.Usuarios;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtils {

    @Value("${techandes.app.jwtSecret:TechAndesSecretKeyForJWTEncryption2026SecureKey}")
    private String jwtSecret;

    @Value("${techandes.app.jwtExpirationMs:86400000}") // 24 horas
    private int jwtExpirationMs;

    @Value("${techandes.app.jwtCookieName:jwt_techandes}")
    private String jwtCookieName;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // --- NUEVO: Generar Cookie pasando la Entidad Usuario completa ---
    public ResponseCookie generateJwtCookie(Usuarios usuario) {
        
        // 1. Crear mapa de Claims personalizados
        Map<String, Object> claims = new HashMap<>();
        claims.put("idUsuario", usuario.getIdUsuario());
        claims.put("rol", usuario.getRol());

        // Si el usuario tiene un empleado asociado, guardamos su id_empleado
        if (usuario.getEmpleado() != null) {
            claims.put("idEmpleado", usuario.getEmpleado().getIdEmpleado());
        } else {
            claims.put("idEmpleado", null);
        }

        // 2. Construir el Token JWT con los Claims
        String jwt = Jwts.builder()
                .setClaims(claims) // Inyecta los datos personalizados
                .setSubject(usuario.getUsername()) // Nombre de usuario principal
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        // 3. Empacar el JWT en la Cookie HttpOnly
        return ResponseCookie.from(jwtCookieName, jwt)
                .path("/api")
                .maxAge(24 * 60 * 60)
                .httpOnly(true)
                .secure(false) // Pasar a true en producción HTTPS
                .sameSite("Lax")
                .build();
    }

    // --- Métodos para extraer los Claims en cualquier parte del Backend ---

    public String getUsernameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Extraer un Claim específico (ejemplo: idEmpleado o idUsuario)
    public Claims getClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getJwtFromCookies(HttpServletRequest request) {
        Cookie cookie = WebUtils.getCookie(request, jwtCookieName);
        return (cookie != null) ? cookie.getValue() : null;
    }

    public ResponseCookie getCleanJwtCookie() {
        return ResponseCookie.from(jwtCookieName, "")
                .path("/api")
                .maxAge(0)
                .httpOnly(true)
                .build();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parse(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}