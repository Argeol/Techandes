package com.example.demo.repository;

import com.example.demo.Models.Categorias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categorias, Long> {

    // Método para buscar una categoría por su nombre
    Optional<Categorias> findByNombre(String nombre);

    // Método para comprobar si ya existe una categoría con ese nombre
    boolean existsByNombre(String nombre);
}