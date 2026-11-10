package com.example.demo.controller;

import com.example.demo.Models.Productos;
import com.example.demo.service.ProductosService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductosController {

    @Autowired
    private ProductosService productosService;

    // GET /api/productos
    @GetMapping
    public ResponseEntity<List<Productos>> obtenerTodos() {
        return ResponseEntity.ok(productosService.obtenerTodos());
    }

    // GET /api/productos/1
    @GetMapping("/{id}")
    public ResponseEntity<Productos> buscarPorId(@PathVariable Long id) {
        return productosService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/productos/categoria/2
    @GetMapping("/categoria/{idCategoria}")
    public ResponseEntity<List<Productos>> obtenerPorCategoria(@PathVariable Long idCategoria) {
        return ResponseEntity.ok(productosService.obtenerPorCategoria(idCategoria));
    }

    // GET /api/productos/reabastecer?limite=5
    @GetMapping("/reabastecer")
    public ResponseEntity<List<Productos>> obtenerBajoStock(@RequestParam(defaultValue = "5") Integer limite) {
        return ResponseEntity.ok(productosService.obtenerBajoStock(limite));
    }

    // POST /api/productos
    @PostMapping
    public ResponseEntity<?> crearProducto(@RequestBody Productos producto) {
        try {
            Productos nuevoProducto = productosService.guardarProducto(producto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/productos/1
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @RequestBody Productos producto) {
        try {
            Productos actualizado = productosService.actualizarProducto(id, producto);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE /api/productos/1
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) {
        try {
            productosService.eliminarPorId(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}