package com.example.demo.repository;

public interface VendedorRankingProjection {
    Long getPuesto();
    String getVendedor();
    String getCargo();
    Long getPedidos();
    Double getTotal();
}