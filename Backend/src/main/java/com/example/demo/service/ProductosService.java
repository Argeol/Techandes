package com.example.demo.service;



import com.example.demo.Models.Categorias;
import com.example.demo.Models.Productos;
import com.example.demo.repository.CategoriaRepository;
import com.example.demo.repository.ProductosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductosService {

    @Autowired
    private ProductosRepository productosRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<Productos> obtenerTodos() {
        return productosRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Productos> buscarPorId(Long id) {
        return productosRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Productos> obtenerPorCategoria(Long idCategoria) {
        return productosRepository.findByCategoriaIdCategoria(idCategoria);
    }

    @Transactional(readOnly = true)
    public List<Productos> obtenerBajoStock(Integer limite) {
        return productosRepository.findByStockLessThanEqualAndActivo(limite, 1);
    }

    @Transactional
    public Productos guardarProducto(Productos producto) {
        // Verificar que la categoría asignada exista en MySQL
        Long idCat = producto.getCategoria().getIdCategoria();
        Categorias categoria = categoriaRepository.findById(idCat)
                .orElseThrow(() -> new IllegalArgumentException("La categoría especificada no existe con el ID: " + idCat));

        producto.setCategoria(categoria);
        return productosRepository.save(producto);
    }

    @Transactional
    public Productos actualizarProducto(Long id, Productos detalles) {
        Productos producto = productosRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con el ID: " + id));

        // Verificar categoría si viene en la actualización
        if (detalles.getCategoria() != null && detalles.getCategoria().getIdCategoria() != null) {
            Categorias categoria = categoriaRepository.findById(detalles.getCategoria().getIdCategoria())
                    .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada."));
            producto.setCategoria(categoria);
        }

        producto.setNombre(detalles.getNombre());
        producto.setPrecio(detalles.getPrecio());
        producto.setStock(detalles.getStock());
        if (detalles.getActivo() != null) {
            producto.setActivo(detalles.getActivo());
        }

        return productosRepository.save(producto);
    }

    @Transactional
    public void eliminarPorId(Long id) {
        if (!productosRepository.existsById(id)) {
            throw new IllegalArgumentException("El producto no existe.");
        }
        productosRepository.deleteById(id);
    }
}