package com.example.demo.controller;

import com.example.demo.Models.Empleados;
import com.example.demo.service.EmpleadosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empleados")
@CrossOrigin(origins = "*")
public class EmpleadosController {

    @Autowired
    private EmpleadosService empleadosService;

    // GET /api/empleados
    @GetMapping
    public ResponseEntity<List<Empleados>> obtenerTodos() {
        return ResponseEntity.ok(empleadosService.obtenerTodos());
    }

    // GET /api/empleados/1
    @GetMapping("/{id}")
    public ResponseEntity<Empleados> buscarPorId(@PathVariable Long id) {
        return empleadosService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/empleados/subordinados/1 (Obtener empleados bajo la dirección de un jefe)
    @GetMapping("/subordinados/{idJefe}")
    public ResponseEntity<List<Empleados>> obtenerPorJefe(@PathVariable Long idJefe) {
        return ResponseEntity.ok(empleadosService.obtenerPorJefe(idJefe));
    }

    // POST /api/empleados
    @PostMapping
    public ResponseEntity<?> crearEmpleado(@RequestBody Empleados empleado) {
        try {
            Empleados nuevo = empleadosService.guardarEmpleado(empleado);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/empleados/1
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarEmpleado(@PathVariable Long id, @RequestBody Empleados empleado) {
        try {
            Empleados actualizado = empleadosService.actualizarEmpleado(id, empleado);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/empleados/1
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarEmpleado(@PathVariable Long id) {
        try {
            empleadosService.eliminarPorId(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}