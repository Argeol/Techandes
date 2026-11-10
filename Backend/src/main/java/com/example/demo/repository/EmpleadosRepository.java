package com.example.demo.repository;

import com.example.demo.Models.Empleados;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmpleadosRepository extends JpaRepository<Empleados, Long> {

    // Buscar empleados por cargo
    List<Empleados> findByCargo(String cargo);

    // Buscar empleados a cargo de un jefe específico
    List<Empleados> findByJefeIdEmpleado(Long idJefe);
}