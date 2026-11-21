package com.example.demo.controller;

import com.example.demo.Models.Usuarios;
import com.example.demo.repository.EmpleadosRepository;
import com.example.demo.repository.UsuariosRepository;
import com.example.demo.security.JwtUtils;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuariosRepository usuariosRepository;
    @Autowired
    private EmpleadosRepository empleadosRepository;

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
        try {
            // 1. Intentar autenticar credenciales
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.get("username"),
                            loginRequest.get("password")));

            // 2. Si las credenciales son válidas, obtener usuario y generar Cookie
            String username = authentication.getName();
            Usuarios usuario = usuariosRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(usuario);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                    .body(Map.of("username", username, "message", "Login exitoso."));

        } catch (BadCredentialsException e) {
            // Credenciales inválidas -> HTTP 401 Unauthorized
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Usuario o contraseña incorrectos."));
        } catch (DisabledException e) {
            // En caso de usuarios desactivados
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "La cuenta de usuario está desactivada."));
        } catch (Exception e) {
            // Cualquier otro fallo inesperado
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al procesar el inicio de sesión."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> cerrarSesion() {
        ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "Sesión cerrada correctamente."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> obtenerUsuarioActual(HttpServletRequest request) {
        String jwt = jwtUtils.getJwtFromCookies(request);

        if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
            Claims claims = jwtUtils.getClaimsFromToken(jwt);

            String username = claims.getSubject();
            String rol = claims.get("rol", String.class);
            Long idUsuario = claims.get("idUsuario", Long.class);
            Long idEmpleado = claims.get("idEmpleado", Long.class);

            // Usamos HashMap porque Map.of() no permite valores nulos ni modificaciones
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("username", username);
            respuesta.put("rol", rol);
            respuesta.put("idUsuario", idUsuario);
            respuesta.put("idEmpleado", idEmpleado);
            // Si el usuario tiene un trabajador/empleado vinculado, consultamos sus datos
            // en BD
            if (idEmpleado != null) {
                empleadosRepository.findById(idEmpleado).ifPresent(empleado -> {
                    respuesta.put("nombre", empleado.getNombres());
                    respuesta.put("apellido", empleado.getApellidos());
                    respuesta.put("cargo", empleado.getCargo());    // <
                });
            } else {
                // Si es un ADMIN sin empleado asociado, enviamos valores por defecto o su
                // username
                respuesta.put("nombre", username);
                respuesta.put("apellido", "");
            }

            return ResponseEntity.ok(respuesta);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "No autenticado"));
    }
}