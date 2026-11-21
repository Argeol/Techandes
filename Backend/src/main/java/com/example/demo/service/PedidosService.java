package com.example.demo.service;

import com.example.demo.Models.Cliente;
import com.example.demo.Models.DetallePedido;
import com.example.demo.Models.DetallePedidoId;
import com.example.demo.Models.Empleados;
import com.example.demo.Models.Pedidos;
import com.example.demo.Models.Productos;
import com.example.demo.dto.CrearPedidoRequest;
import com.example.demo.repository.ClienteRepository;
import com.example.demo.repository.DetallePedidoRepository;
import com.example.demo.repository.EmpleadosRepository;
import com.example.demo.repository.PedidosRepository;
import com.example.demo.repository.ProductosRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.demo.Models.Usuarios;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    @Transactional(readOnly = true)
    public List<DetallePedido> buscarPorIdPedido(long id) {
        return detallePedidoRepository.findByPedidoIdPedido(id);
    }

    @Transactional // Si falla un producto o el stock, revierte todo automatico
    public Pedidos registrarVenta(CrearPedidoRequest request, Long idEmpleado) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("El carrito no puede estar vacío.");
        }
        Empleados empleado = empleadosRepository.findById(idEmpleado)
                .orElseThrow(() -> new IllegalArgumentException("Empleado no encontrado."));
        // 1. Buscar Cliente y Empleado
        Cliente cliente = clienteRepository.findById(request.getIdCliente())
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado."));

        // 2. Crear y guardar primero la cabecera del Pedido
        Pedidos nuevoPedido = new Pedidos();
        nuevoPedido.setCliente(cliente);
        nuevoPedido.setEmpleado(empleado);
        nuevoPedido.setFechaPedido(LocalDateTime.now());
        nuevoPedido.setMetodoPago(request.getMetodoPago() != null ? request.getMetodoPago() : "EFECTIVO");
        nuevoPedido.setEstado(request.getEstado() != null ? request.getEstado() : "ENTREGADO");

        Pedidos pedidoGuardado = pedidosRepository.save(nuevoPedido);

        // 3. Recorrer ítems, validar/descontar stock y guardar en detalle_pedido
        for (CrearPedidoRequest.ItemPedidoDTO item : request.getItems()) {
            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad debe ser mayor a 0.");
            }

            Productos producto = productosRepository.findById(item.getIdProducto())
                    .orElseThrow(
                            () -> new IllegalArgumentException("Producto no encontrado ID: " + item.getIdProducto()));

            if (Boolean.FALSE.equals(producto.getActivo())) {
                throw new IllegalArgumentException("El producto '" + producto.getNombre() + "' está inactivo.");
            }

            if (producto.getStock() < item.getCantidad()) {
                throw new IllegalArgumentException(
                        "Stock insuficiente para '" + producto.getNombre() + "'. Disponible: " + producto.getStock());
            }

            // Descontar stock y actualizar producto
            producto.setStock(producto.getStock() - item.getCantidad());
            productosRepository.save(producto);

            // Crear llave compuesta con el idPedido recién generado + idProducto
            DetallePedidoId detalleId = new DetallePedidoId(
                    pedidoGuardado.getIdPedido(),
                    producto.getIdProducto());

            DetallePedido detalle = new DetallePedido();
            detalle.setId(detalleId);
            detalle.setPedido(pedidoGuardado);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio()); // Precio real desde BD

            detallePedidoRepository.save(detalle);
        }

        return pedidoGuardado;
    }
}