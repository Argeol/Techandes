package com.example.demo.controller;

import com.example.demo.Models.Usuarios;
import com.example.demo.repository.UsuariosRepository;
import com.example.demo.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuariosRepository usuariosRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuarios usuario) {
        if (usuariosRepository.existsByUsername(usuario.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "El usuario ya existe."));
        }

        usuario.setPassword(encoder.encode(usuario.getPassword()));
        
        if (usuario.getRol() == null) {
            usuario.setRol("ROLE_VENDEDOR");
        }

        if (usuario.getEmpleado() != null && usuario.getEmpleado().getIdEmpleado() == null) {
            usuario.setEmpleado(null);
        }

        usuariosRepository.save(usuario);
        return ResponseEntity.ok(Map.of("message", "Usuario registrado correctamente."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> autenticarUsuario(@RequestBody Map<String, String> loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.get("username"),
                        loginRequest.get("password")
                )
        );

        String username = authentication.getName();
        Usuarios usuario = usuariosRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(usuario);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(Map.of("username", username, "message", "Login exitoso."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> cerrarSesion() {
        ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "Sesión cerrada correctamente."));
    }
}