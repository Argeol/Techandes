package com.example.demo.repository;

import com.example.demo.Models.DetallePedido;
import com.example.demo.Models.DetallePedidoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, DetallePedidoId> {

    // Obtener los productos que pertenecen a un pedido específico
    List<DetallePedido> findByPedidoIdPedido(Long idPedido);
}