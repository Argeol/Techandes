package com.example.demo.service;

import com.example.demo.Models.Categorias;
import com.example.demo.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<Categorias> obtenerTodas() {
        return categoriaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Categorias> buscarPorId(Long id) {
        return categoriaRepository.findById(id);
    }

    @Transactional
    public Categorias guardarCategoria(Categorias categoria) {
        if (categoriaRepository.existsByNombre(categoria.getNombre())) {
            throw new IllegalArgumentException("La categoría ya existe con el nombre especificado.");
        }
        return categoriaRepository.save(categoria);
    }

    @Transactional
    public Categorias actualizarCategoria(Long id, Categorias detallesCategoria) {
        Categorias categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada con el ID: " + id));

        categoria.setNombre(detallesCategoria.getNombre());
        categoria.setDescripcion(detallesCategoria.getDescripcion());

        return categoriaRepository.save(categoria);
    }

    @Transactional
    public void eliminarPorId(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new IllegalArgumentException("No existe la categoría con el ID especificado.");
        }
        categoriaRepository.deleteById(id);
    }
}