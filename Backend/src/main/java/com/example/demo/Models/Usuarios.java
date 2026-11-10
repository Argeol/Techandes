package com.example.demo.Models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "usuarios")
@Data
public class Usuarios {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    private String rol; // Ejemplo: "ROLE_ADMIN", "ROLE_VENDEDOR"

    // Relación opcional con Empleado (un usuario puede o no estar asociado a un empleado)
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_empleado", nullable = true, unique = true)
    private Empleados empleado;
}