
package com.example.demo.service;

import com.example.demo.repository.InicioRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InicioService {

    private final InicioRepository inicioRepository;

    public InicioService(InicioRepository inicioRepository) {
        this.inicioRepository = inicioRepository;
    }

    public Map<String, Object> obtenerDatosInicio(Integer idEmpleado) {

        // 1. Indicadores generales
        Map<String, Object> indicadores =
                inicioRepository.obtenerIndicadores();

        // 2. Ventas del empleado
        Map<String, Object> misVentas =
                inicioRepository.obtenerMisVentas(idEmpleado);

        // 3. Últimos pedidos
        List<Map<String, Object>> ultimos =
                inicioRepository.obtenerUltimosPedidos();

        // 4. Productos con stock bajo
        List<Map<String, Object>> bajoStock =
                inicioRepository.obtenerProductosStockBajo();

        // 5. Organizar respuesta
        Map<String, Object> respuesta = new HashMap<>();

        respuesta.put("indicadores", indicadores);
        respuesta.put("misVentas", misVentas);
        respuesta.put("ultimos", ultimos);
        respuesta.put("bajoStock", bajoStock);

        return respuesta;
    }
}
