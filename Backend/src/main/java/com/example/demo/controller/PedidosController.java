package com.example.demo.controller;

import com.example.demo.Models.DetallePedido;
import com.example.demo.Models.Pedidos;
import com.example.demo.dto.CrearPedidoRequest;
import com.example.demo.security.JwtUtils;
import com.example.demo.service.PedidosService;

import io.jsonwebtoken.Claims;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidosController {

    @Autowired
    private PedidosService pedidosService;

    // GET /api/pedidos
    @GetMapping
    public ResponseEntity<List<Pedidos>> obtenerTodos() {
        return ResponseEntity.ok(pedidosService.obtenerTodos());
    }

    // GET /api/pedidos/1
    @GetMapping("/{id}")
    public ResponseEntity<Pedidos> buscarPorId(@PathVariable Long id) {
        return pedidosService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/pedidos
    // @PostMapping
    // public ResponseEntity<?> crearPedido(@RequestBody Pedidos pedido) {
    // try {
    // Pedidos nuevoPedido = pedidosService.crearPedido(pedido);
    // return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
    // } catch (IllegalArgumentException e) {
    // return ResponseEntity.badRequest().body(e.getMessage());
    // }
    // }

    // PATCH /api/pedidos/1/estado (Para cambiar únicamente el estado: Pendiente,
    // Entregado, Cancelado)
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String nuevoEstado = body.get("estado");
            Pedidos actualizado = pedidosService.cambiarEstado(id, nuevoEstado);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/detalles")
    public ResponseEntity<List<DetallePedido>> obtenerDetallesPorPedido(@PathVariable Long id) {
        return ResponseEntity.ok(pedidosService.buscarPorIdPedido(id));
    }

    @PostMapping
    public ResponseEntity<?> crearVenta(
            Authentication authentication,
            @RequestBody CrearPedidoRequest request) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> details = (Map<String, Object>) authentication.getDetails();
            Long idEmpleado = (Long) details.get("idEmpleado");

            if (idEmpleado == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "El usuario no tiene un empleado asociado."));
            }

            Pedidos pedidoCreado = pedidosService.registrarVenta(request, idEmpleado);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "idPedido", pedidoCreado.getIdPedido(),
                    "estado", pedidoCreado.getEstado(),
                    "mensaje", "Venta registrada con éxito"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}