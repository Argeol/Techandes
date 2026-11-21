package com.example.demo.controller;

import com.example.demo.service.InicioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/inicio")
public class InicioController {

    @Autowired
    private InicioService inicioService;

    @GetMapping
    public ResponseEntity<?> obtenerDashboard() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Integer idEmpleado = null;

        // Extraer idEmpleado guardado en Authentication.getDetails() por el filtro JWT
        if (auth != null && auth.getDetails() != null) {
            if (auth.getDetails() instanceof Integer) {
                idEmpleado = (Integer) auth.getDetails();
            } else if (auth.getDetails() instanceof Long) {
                idEmpleado = ((Long) auth.getDetails()).intValue();
            } else if (auth.getDetails() instanceof Map) {
                Object idObj = ((Map<?, ?>) auth.getDetails()).get("idEmpleado");
                if (idObj instanceof Number) {
                    idEmpleado = ((Number) idObj).intValue();
                }
            }
        }

        // Llama a tu método en InicioService (ajusta el nombre si lo llamaste distinto)
        Map<String, Object> dashboard = inicioService.obtenerDatosInicio(idEmpleado);
        return ResponseEntity.ok(dashboard);
    }
}