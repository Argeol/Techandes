package com.example.demo.repository;

public interface TopProductoProjection {
    Long getIdProducto();
    String getProducto();
    String getCategoria();
    Long getUnidades();
    Double getTotal();
}