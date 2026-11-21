
package com.example.demo.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class InicioRepository {

    private final JdbcTemplate jdbcTemplate;

    public InicioRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // 1. Indicadores generales
    public Map<String, Object> obtenerIndicadores() {

        String sql = """
            SELECT
                (SELECT COALESCE(SUM(d.cantidad * d.precio_unitario), 0)
                 FROM detalle_pedido d
                 JOIN pedidos p ON p.id_pedido = d.id_pedido
                 WHERE p.estado <> 'CANCELADO') AS ventas_totales,

                (SELECT COUNT(*)
                 FROM pedidos
                 WHERE estado = 'PENDIENTE') AS pendientes,

                (SELECT COUNT(*)
                 FROM clientes) AS clientes,

                (SELECT COUNT(*)
                 FROM productos
                 WHERE activo = 1 AND stock < 10) AS stock_bajo
            """;

        return jdbcTemplate.queryForMap(sql);
    }

    // 2. Ventas del empleado autenticado
    public Map<String, Object> obtenerMisVentas(Integer idEmpleado) {

        String sql = """
            SELECT
                COUNT(DISTINCT p.id_pedido) AS pedidos,
                COALESCE(SUM(d.cantidad * d.precio_unitario), 0) AS total
            FROM pedidos p
            JOIN detalle_pedido d ON d.id_pedido = p.id_pedido
            WHERE p.id_empleado = ?
              AND p.estado <> 'CANCELADO'
            """;

        return jdbcTemplate.queryForMap(sql, idEmpleado);
    }

    // 3. Últimos cinco pedidos
    public List<Map<String, Object>> obtenerUltimosPedidos() {

        String sql = """
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.estado,
                CONCAT(c.nombre, ' ', c.apellido) AS cliente,
                COALESCE(SUM(d.cantidad * d.precio_unitario), 0) AS total
            FROM pedidos p
            JOIN clientes c ON c.id_cliente = p.id_cliente
            LEFT JOIN detalle_pedido d ON d.id_pedido = p.id_pedido
            GROUP BY
                p.id_pedido,
                p.fecha_pedido,
                p.estado,
                c.nombre,
                c.apellido
            ORDER BY p.fecha_pedido DESC, p.id_pedido DESC
            LIMIT 5
            """;

        return jdbcTemplate.queryForList(sql);
    }

    // 4. Productos con stock bajo
    public List<Map<String, Object>> obtenerProductosStockBajo() {

        String sql = """
            SELECT
                id_producto,
                nombre,
                stock
            FROM productos
            WHERE activo = 1 AND stock < 10
            ORDER BY stock ASC, nombre ASC
            """;

        return jdbcTemplate.queryForList(sql);
    }
}
