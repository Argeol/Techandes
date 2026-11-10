package com.example.demo.controller;

import com.example.demo.Models.Pedidos;
import com.example.demo.service.PedidosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    // GET /api/pedidos/cliente/1
    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<Pedidos>> obtenerPorCliente(@PathVariable Long idCliente) {
        return ResponseEntity.ok(pedidosService.obtenerPorCliente(idCliente));
    }

    // POST /api/pedidos
    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody Pedidos pedido) {
        try {
            Pedidos nuevoPedido = pedidosService.crearPedido(pedido);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PATCH /api/pedidos/1/estado (Para cambiar únicamente el estado: Pendiente, Entregado, Cancelado)
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
}