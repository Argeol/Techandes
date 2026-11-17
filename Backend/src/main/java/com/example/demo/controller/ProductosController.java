package com.example.demo.controller;

import com.example.demo.Models.Productos;
import com.example.demo.service.ProductosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
public class ProductosController {

    @Autowired
    private ProductosService productosService;

    // 1. Listar todos (Accesible por ADMIN y VENDEDOR)
    @GetMapping
    public ResponseEntity<List<Productos>> listarProductos() {
        return ResponseEntity.ok(productosService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerProductoPorId(@PathVariable Long id) {
        return productosService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 2. Crear producto (Solo ADMIN - protegido en SecurityConfig)
    @PostMapping
    public ResponseEntity<?> crearProducto(@RequestBody Productos producto) {
        try {
            Productos nuevo = productosService.guardarProducto(producto);
            return ResponseEntity.ok(nuevo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error al crear producto: " + e.getMessage()));
        }
    }

    // 3. Actualizar producto (Solo ADMIN)
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @RequestBody Productos producto) {
        try {
            Productos actualizado = productosService.actualizarProducto(id, producto);
            return ResponseEntity.ok(actualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error al actualizar: " + e.getMessage()));
        }
    }

    // 4. Eliminar producto (Solo ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) {
        try {
            productosService.eliminarPorId(id);
            return ResponseEntity.ok(Map.of("message", "Producto eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "No se puede eliminar (puede estar asociado a pedidos)."));
        }
    }
}