package com.example.demo.Models;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "clientes")
@Data
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long id;
    private String documento;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fecha_registro;
    @PrePersist
    public void asignarFechaRegistro() {
        this.fecha_registro = LocalDateTime.now();
    }
}

