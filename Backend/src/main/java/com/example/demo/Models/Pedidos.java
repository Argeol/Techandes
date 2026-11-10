package com.example.demo.Models;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "pedidos")
@Data
public class Pedidos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long idPedido;

    // Relación con Cliente
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    // Relación con Empleado (vendedor que procesa el pedido)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_empleado", nullable = false)
    private Empleados empleado;

    @Column(name = "fecha_pedido", updatable = false)
    private LocalDateTime fechaPedido;

    private String estado; // Pendiente, Entregado, Cancelado

    @Column(name = "metodo_pago")
    private String metodoPago; // Efectivo, Tarjeta, Transferencia

    @PrePersist
    public void asignarFechaYEstado() {
        this.fechaPedido = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = "Pendiente";
        }
    }
}