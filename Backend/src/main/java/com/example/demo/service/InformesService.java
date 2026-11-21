package com.example.demo.service;

import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InformesService {

    @Autowired
    private InformesRepository informesRepository;

    public Map<String, Object> generarInformeGeneral() {
        // 1. Obtener ventas por categoría y calcular granTotal
        List<CategoriaInformeProjection> rawCategorias = informesRepository.obtenerVentasPorCategoria();
        
        double granTotal = 0.0;
        for (CategoriaInformeProjection cat : rawCategorias) {
            if (cat.getTotal() != null) {
                granTotal += cat.getTotal();
            }
        }

        // Armar lista de categorías añadiendo el porcentaje calculado
        List<Map<String, Object>> porCategoria = new ArrayList<>();
        for (CategoriaInformeProjection cat : rawCategorias) {
            double totalCat = (cat.getTotal() != null) ? cat.getTotal() : 0.0;
            double porcentaje = (granTotal > 0) ? Math.round((totalCat / granTotal * 100.0) * 10.0) / 10.0 : 0.0;

            Map<String, Object> fila = new HashMap<>();
            fila.put("categoria", cat.getCategoria());
            fila.put("unidades", cat.getUnidades() != null ? cat.getUnidades() : 0L);
            fila.put("total", totalCat);
            fila.put("porcentaje", porcentaje);
            porCategoria.add(fila);
        }

        // 2. Empaquetar toda la respuesta JSON
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("granTotal", granTotal);
        respuesta.put("porCategoria", porCategoria);
        respuesta.put("rankingVendedores", informesRepository.obtenerRankingVendedores());
        respuesta.put("topProductos", informesRepository.obtenerTop5Productos());
        respuesta.put("clientesSinCompras", informesRepository.obtenerClientesSinCompras());

        return respuesta;
    }
}