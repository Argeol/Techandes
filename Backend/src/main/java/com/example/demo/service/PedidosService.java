package com.example.demo.service;

import com.example.demo.Models.Cliente;
import com.example.demo.Models.DetallePedido;
import com.example.demo.Models.DetallePedidoId;
import com.example.demo.Models.Empleados;
import com.example.demo.Models.Pedidos;
import com.example.demo.Models.Productos;
import com.example.demo.repository.ClienteRepository;
import com.example.demo.repository.DetallePedidoRepository;
import com.example.demo.repository.EmpleadosRepository;
import com.example.demo.repository.PedidosRepository;
import com.example.demo.repository.ProductosRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PedidosService {

    @Autowired
    private PedidosRepository pedidosRepository;

    @Autowired
    private DetallePedidoRepository detallePedidoRepository;
    @Autowired
    private ProductosRepository productosRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EmpleadosRepository empleadosRepository;

    @Transactional(readOnly = true)
    public List<Pedidos> obtenerTodos() {
        return pedidosRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Pedidos> buscarPorId(Long id) {
        return pedidosRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Pedidos> obtenerPorCliente(Long idCliente) {
        return pedidosRepository.findByClienteId(idCliente);
    }

    @Transactional(readOnly = true)
    public List<Pedidos> obtenerPorEstado(String estado) {
        return pedidosRepository.findByEstado(estado);
    }

    @Transactional
    public Pedidos crearPedido(Pedidos pedido) {
        // Validar que el cliente exista
        Long idCli = pedido.getCliente().getId();
        Cliente cliente = clienteRepository.findById(idCli)
                .orElseThrow(() -> new IllegalArgumentException("El cliente con ID " + idCli + " no existe."));

        // Validar que el empleado exista
        Long idEmp = pedido.getEmpleado().getIdEmpleado();
        Empleados empleado = empleadosRepository.findById(idEmp)
                .orElseThrow(() -> new IllegalArgumentException("El empleado con ID " + idEmp + " no existe."));

        pedido.setCliente(cliente);
        pedido.setEmpleado(empleado);

        return pedidosRepository.save(pedido);
    }

    @Transactional
    public Pedidos cambiarEstado(Long id, String nuevoEstado) {
        Pedidos pedido = pedidosRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado con ID: " + id));

        pedido.setEstado(nuevoEstado);
        return pedidosRepository.save(pedido);
    }

    @Transactional
    public Pedidos registrarVentaCompleta(Pedidos pedido, List<DetallePedido> detalles) {
        // 1. Validar Cliente y Empleado
        Cliente cliente = clienteRepository.findById(pedido.getCliente().getId())
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado"));
        Empleados empleado = empleadosRepository.findById(pedido.getEmpleado().getIdEmpleado())
                .orElseThrow(() -> new IllegalArgumentException("Empleado no encontrado"));

        pedido.setCliente(cliente);
        pedido.setEmpleado(empleado);

        // 2. Guardar la cabecera del Pedido
        Pedidos pedidoGuardado = pedidosRepository.save(pedido);

        // 3. Procesar cada producto del detalle
        for (DetallePedido detalle : detalles) {
            Productos producto = productosRepository.findById(detalle.getProducto().getIdProducto())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Producto no encontrado ID: " + detalle.getProducto().getIdProducto()));

            // Validar stock disponible
            if (producto.getStock() < detalle.getCantidad()) {
                throw new IllegalStateException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            // Descuento de stock en MySQL
            producto.setStock(producto.getStock() - detalle.getCantidad());
            productosRepository.save(producto);

            // Crear el ID compuesto y asociar entidades
            DetallePedidoId detalleId = new DetallePedidoId(pedidoGuardado.getIdPedido(), producto.getIdProducto());
            detalle.setId(detalleId);
            detalle.setPedido(pedidoGuardado);
            detalle.setProducto(producto);
            detalle.setPrecioUnitario(producto.getPrecio());

            // Guardar en detalle_pedido
            detallePedidoRepository.save(detalle);
        }

        return pedidoGuardado;
    }
}