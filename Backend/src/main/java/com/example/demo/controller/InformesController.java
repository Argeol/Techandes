package com.example.demo.controller;

import com.example.demo.service.InformesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/informes")
public class InformesController {

    @Autowired
    private InformesService informesService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRADOR') or hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> obtenerInformes() {

        Map<String, Object> informe =
                informesService.generarInformeGeneral();

        return ResponseEntity.ok(informe);
    }
}