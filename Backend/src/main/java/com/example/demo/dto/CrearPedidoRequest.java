package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class CrearPedidoRequest {
    private Long idCliente;
    private String metodoPago;
    private String estado;
    private List<ItemPedidoDTO> items;

    @Data
    public static class ItemPedidoDTO {
        private Long idProducto;
        private Integer cantidad;
    }
}