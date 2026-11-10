package com.example.demo.service;

import com.example.demo.Models.Empleados;
import com.example.demo.repository.EmpleadosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EmpleadosService {

    @Autowired
    private EmpleadosRepository empleadosRepository;

    @Transactional(readOnly = true)
    public List<Empleados> obtenerTodos() {
        return empleadosRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Empleados> buscarPorId(Long id) {
        return empleadosRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Empleados> obtenerPorJefe(Long idJefe) {
        return empleadosRepository.findByJefeIdEmpleado(idJefe);
    }

    @Transactional
    public Empleados guardarEmpleado(Empleados empleado) {
        // Si se envió un jefe, verificamos que exista antes de guardar
        if (empleado.getJefe() != null && empleado.getJefe().getIdEmpleado() != null) {
            Empleados jefe = empleadosRepository.findById(empleado.getJefe().getIdEmpleado())
                    .orElseThrow(() -> new IllegalArgumentException("El jefe asignado no existe."));
            empleado.setJefe(jefe);
        } else {
            empleado.setJefe(null);
        }

        return empleadosRepository.save(empleado);
    }

    @Transactional
    public Empleados actualizarEmpleado(Long id, Empleados detalles) {
        Empleados empleado = empleadosRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empleado no encontrado con ID: " + id));

        empleado.setNombres(detalles.getNombres());
        empleado.setApellidos(detalles.getApellidos());
        empleado.setCargo(detalles.getCargo());
        empleado.setSalario(detalles.getSalario());
        empleado.setFechaIngreso(detalles.getFechaIngreso());

        if (detalles.getJefe() != null && detalles.getJefe().getIdEmpleado() != null) {
            Empleados jefe = empleadosRepository.findById(detalles.getJefe().getIdEmpleado())
                    .orElseThrow(() -> new IllegalArgumentException("El jefe especificado no existe."));
            empleado.setJefe(jefe);
        } else {
            empleado.setJefe(null);
        }

        return empleadosRepository.save(empleado);
    }

    @Transactional
    public void eliminarPorId(Long id) {
        if (!empleadosRepository.existsById(id)) {
            throw new IllegalArgumentException("El empleado no existe.");
        }
        empleadosRepository.deleteById(id);
    }
}