package com.example.demo.repository;

import com.example.demo.Models.Pedidos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InformesRepository extends JpaRepository<Pedidos, Long> {

    // 1. Ventas por categoría (sin cancelados)
    @Query(value = "SELECT c.nombre AS categoria, " +
                   "COALESCE(SUM(d.cantidad), 0) AS unidades, " +
                   "COALESCE(SUM(d.cantidad * d.precio_unitario), 0) AS total " +
                   "FROM categorias c " +
                   "LEFT JOIN productos pr ON pr.id_categoria = c.id_categoria " +
                   "LEFT JOIN detalle_pedido d ON d.id_producto = pr.id_producto " +
                   "LEFT JOIN pedidos p ON p.id_pedido = d.id_pedido AND p.estado <> 'CANCELADO' " +
                   "GROUP BY c.id_categoria, c.nombre " +
                   "ORDER BY total DESC, c.nombre ASC", nativeQuery = true)
    List<CategoriaInformeProjection> obtenerVentasPorCategoria();

    // 2. Ranking de vendedores con RANK() OVER
    @Query(value = "SELECT RANK() OVER (ORDER BY COALESCE(SUM(d.cantidad * d.precio_unitario), 0) DESC) AS puesto, " +
                   "CONCAT(e.nombres, ' ', e.apellidos) AS vendedor, " +
                   "e.cargo AS cargo, " +
                   "COUNT(DISTINCT p.id_pedido) AS pedidos, " +
                   "COALESCE(SUM(d.cantidad * d.precio_unitario), 0) AS total " +
                   "FROM empleados e " +
                   "LEFT JOIN pedidos p ON p.id_empleado = e.id_empleado AND p.estado <> 'CANCELADO' " +
                   "LEFT JOIN detalle_pedido d ON d.id_pedido = p.id_pedido " +
                   "GROUP BY e.id_empleado, e.nombres, e.apellidos, e.cargo " +
                   "ORDER BY puesto ASC, vendedor ASC", nativeQuery = true)
    List<VendedorRankingProjection> obtenerRankingVendedores();

    // 3. Top 5 productos por unidades vendidas
    @Query(value = "SELECT pr.id_producto AS idProducto, " +
                   "pr.nombre AS producto, " +
                   "c.nombre AS categoria, " +
                   "SUM(d.cantidad) AS unidades, " +
                   "SUM(d.cantidad * d.precio_unitario) AS total " +
                   "FROM detalle_pedido d " +
                   "JOIN pedidos p ON p.id_pedido = d.id_pedido " +
                   "JOIN productos pr ON pr.id_producto = d.id_producto " +
                   "JOIN categorias c ON c.id_categoria = pr.id_categoria " +
                   "WHERE p.estado <> 'CANCELADO' " +
                   "GROUP BY pr.id_producto, pr.nombre, c.nombre " +
                   "ORDER BY unidades DESC, total DESC " +
                   "LIMIT 5", nativeQuery = true)
    List<TopProductoProjection> obtenerTop5Productos();

    // 4. Clientes sin compras con NOT EXISTS
    @Query(value = "SELECT c.id_cliente AS idCliente, " +
                   "c.documento AS documento, " +
                   "CONCAT(c.nombre, ' ', c.apellido) AS cliente, " +
                   "c.email AS email, " +
                   "c.telefono AS telefono, " +
                   "c.ciudad AS ciudad " +
                   "FROM clientes c " +
                   "WHERE NOT EXISTS ( " +
                   "    SELECT 1 " +
                   "    FROM pedidos p " +
                   "    WHERE p.id_cliente = c.id_cliente " +
                   "      AND p.estado <> 'CANCELADO' " +
                   ") " +
                   "ORDER BY c.nombre, c.apellido", nativeQuery = true)
    List<ClienteSinCompraProjection> obtenerClientesSinCompras();
}