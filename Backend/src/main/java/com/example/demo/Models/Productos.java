package com.example.demo.Models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "productos")
@Data
public class Productos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;

    private String nombre;

    private BigDecimal precio; // Se usa BigDecimal o Double para valores monetarios

    private Integer stock;

    private Integer activo; // 1 = Activo, 0 = Inactivo

    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    // --- RELACIÓN CON CATEGORÍA ---
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categorias categoria;

    @PrePersist
    public void asignarFechaRegistro() {
        this.fechaRegistro = LocalDateTime.now();
        if (this.activo == null) {
            this.activo = 1; // Por defecto activo al crear
        }
    }
}