package com.example.demo.repository;

import com.example.demo.Models.Pedidos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidosRepository extends JpaRepository<Pedidos, Long> {

    // Listar historial de pedidos de un cliente específico
    List<Pedidos> findByClienteId(Long idCliente);

    // Listar pedidos gestionados por un empleado
    List<Pedidos> findByEmpleadoIdEmpleado(Long idEmpleado);

    // Filtrar pedidos por estado (ej: Pendiente, Cancelado)
    List<Pedidos> findByEstado(String estado);
}