package com.example.demo.repository;

import com.example.demo.Models.Productos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductosRepository extends JpaRepository<Productos, Long> {

    // Buscar productos por el ID de su categoría
    List<Productos> findByCategoriaIdCategoria(Long idCategoria);

    // Buscar productos que tengan stock por debajo de un límite (para alertas del Dashboard)
    List<Productos> findByStockLessThanEqualAndActivo(Integer limiteStock, Integer activo);

    // Buscar productos por estado (activos/inactivos)
    List<Productos> findByActivo(Integer activo);
}