package com.example.demo.Models;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "empleados")
@Data
public class Empleados {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
    private Long idEmpleado;

    private String nombres;

    private String apellidos;

    private String cargo;

    private BigDecimal salario;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    // Relación reflexiva: Un empleado tiene un jefe (que también es un Empleado)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_jefe", nullable = true)
    private Empleados jefe;
}