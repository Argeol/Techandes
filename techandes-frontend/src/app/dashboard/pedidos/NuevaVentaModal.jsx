'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Loader2,
    Plus,
    Trash2,
    ShoppingCart,
    AlertCircle,
} from 'lucide-react';

export function NuevaVentaModal({ open, onOpenChange, onSuccess }) {
    const [cargandoCatalogos, setCargandoCatalogos] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    // Catálogos desde la API
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);

    // Cabecera de la venta
    const [idCliente, setIdCliente] = useState('');
    const [metodoPago, setMetodoPago] = useState('EFECTIVO');
    const [estado, setEstado] = useState('ENTREGADO');

    // Selector temporal para añadir productos
    const [productoSeleccionadoId, setProductoSeleccionadoId] = useState('');
    const [cantidadInput, setCantidadInput] = useState(1);

    // Carrito (tablita dinámica debajo de los datos)
    const [carrito, setCarrito] = useState([]);

    // Cargar clientes y productos frescos cada vez que se abre el modal
    useEffect(() => {
        if (!open) return;

        setError('');
        setIdCliente('');
        setMetodoPago('EFECTIVO');
        setEstado('ENTREGADO');
        setProductoSeleccionadoId('');
        setCantidadInput(1);
        setCarrito([]);

        const cargarDatosIniciales = async () => {
            try {
                setCargandoCatalogos(true);
                const [resClientes, resProductos] = await Promise.all([
                    api.get('/clientes'),
                    api.get('/productos'),
                ]);

                setClientes(resClientes.data || []);

                // Mostrar solo productos activos y con stock disponible
                const disponibles = (resProductos.data || []).filter(
                    (p) => p.activo !== false && p.stock > 0
                );
                setProductos(disponibles);
            } catch (err) {
                console.error('Error cargando catálogos para POS:', err);
                setError('No se pudieron cargar los clientes o productos.');
            } finally {
                setCargandoCatalogos(false);
            }
        };

        cargarDatosIniciales();
    }, [open]);

    const formatoMoneda = (valor) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(valor || 0);

    // Añadir producto del <select> a la tablita
    const handleAgregarProducto = () => {
        setError('');
        if (!productoSeleccionadoId) {
            setError('Selecciona un producto de la lista.');
            return;
        }

        const producto = productos.find(
            (p) => String(p.idProducto) === String(productoSeleccionadoId)
        );
        if (!producto) return;

        const cant = Number(cantidadInput);
        if (isNaN(cant) || cant <= 0) {
            setError('La cantidad debe ser mayor a 0.');
            return;
        }

        const existente = carrito.find((item) => item.idProducto === producto.idProducto);
        const cantidadTotal = (existente ? existente.cantidad : 0) + cant;

        if (cantidadTotal > producto.stock) {
            setError(
                `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock} und.`
            );
            return;
        }

        if (existente) {
            setCarrito((prev) =>
                prev.map((item) =>
                    item.idProducto === producto.idProducto
                        ? { ...item, cantidad: cantidadTotal }
                        : item
                )
            );
        } else {
            setCarrito((prev) => [
                ...prev,
                {
                    idProducto: producto.idProducto,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    stockMax: producto.stock,
                    cantidad: cant,
                },
            ]);
        }

        setProductoSeleccionadoId('');
        setCantidadInput(1);
    };

    // Ajustar cantidad directamente en la tablita
    const handleCambiarCantidadFila = (idProducto, nuevaCantidad) => {
        setError('');
        const item = carrito.find((i) => i.idProducto === idProducto);
        if (!item) return;

        if (nuevaCantidad <= 0) {
            handleEliminarFila(idProducto);
            return;
        }

        if (nuevaCantidad > item.stockMax) {
            setError(`Stock máximo disponible para "${item.nombre}": ${item.stockMax} und.`);
            return;
        }

        setCarrito((prev) =>
            prev.map((i) =>
                i.idProducto === idProducto ? { ...i, cantidad: nuevaCantidad } : i
            )
        );
    };

    // Eliminar producto de la tablita
    const handleEliminarFila = (idProducto) => {
        setCarrito((prev) => prev.filter((item) => item.idProducto !== idProducto));
    };

    const totalVenta = carrito.reduce(
        (acc, item) => acc + (item.precio || 0) * item.cantidad,
        0
    );

    // Enviar POST /pedidos (el idEmpleado lo extrae Spring Boot del token JWT)
    const handleRegistrarVenta = async (e) => {
        e.preventDefault();
        setError('');

        if (!idCliente) {
            setError('Debes seleccionar un cliente.');
            return;
        }

        if (carrito.length === 0) {
            setError('Agrega al menos un producto a la venta.');
            return;
        }

        const payload = {
            idCliente: Number(idCliente),
            metodoPago,
            estado,
            items: carrito.map((item) => ({
                idProducto: item.idProducto,
                cantidad: item.cantidad,
            })),
        };

        try {
            setGuardando(true);
            await api.post('/pedidos', payload);
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Ocurrió un error al registrar la venta. Verifica el stock.'
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                        Registrar Nueva Venta (POS)
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Selecciona el cliente, añade los productos del inventario y confirma el pedido.
                    </DialogDescription>
                </DialogHeader>

                {cargandoCatalogos ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-sm">Cargando clientes y productos disponibles...</span>
                    </div>
                ) : (
                    <form onSubmit={handleRegistrarVenta} className="space-y-5 mt-2">
                        {error && (
                            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Datos generales del pedido */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="space-y-1.5">
                                <Label className="text-slate-700 font-semibold text-xs">Cliente *</Label>
                                <select
                                    required
                                    value={idCliente}
                                    onChange={(e) => setIdCliente(e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                                >
                                    <option value="">-- Seleccionar cliente --</option>
                                    {clientes.map((cli) => (
                                        <option key={cli.id} value={cli.id}>
                                            {cli.nombre} {cli.apellido} ({cli.documento})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-slate-700 font-semibold text-xs">Método de Pago *</Label>
                                <select
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                                >
                                    <option value="EFECTIVO">EFECTIVO</option>
                                    <option value="PSE">PSE</option>
                                    <option value="TARJETA">TARJETA</option>
                                    <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-slate-700 font-semibold text-xs">Estado Inicial *</Label>
                                <select
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value)}
                                    className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                                >
                                    <option value="ENTREGADO">ENTREGADO</option>
                                    <option value="PENDIENTE">PENDIENTE</option>
                                    <option value="EN_PROCESO">EN PROCESO</option>
                                </select>
                            </div>
                        </div>

                        {/* Selector para agregar productos desde /api/productos */}
                        <div className="space-y-2">
                            <Label className="text-slate-800 font-bold text-sm">
                                Agregar Productos al Pedido
                            </Label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <select
                                    value={productoSeleccionadoId}
                                    onChange={(e) => setProductoSeleccionadoId(e.target.value)}
                                    className="flex-1 h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                                >
                                    <option value="">-- Selecciona un producto del inventario --</option>
                                    {productos.map((prod) => (
                                        <option key={prod.idProducto} value={prod.idProducto}>
                                            {prod.nombre} — {formatoMoneda(prod.precio)} (Stock: {prod.stock})
                                        </option>
                                    ))}
                                </select>

                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={cantidadInput}
                                        onChange={(e) => setCantidadInput(e.target.value)}
                                        placeholder="Cant."
                                        className="w-24 h-10 bg-white border-slate-300 text-slate-900 text-center font-semibold"
                                    />

                                    <Button
                                        type="button"
                                        onClick={handleAgregarProducto}
                                        className="h-10 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer gap-1.5 px-4"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Añadir
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Tablita debajo de los datos con los productos añadidos */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-700 text-xs uppercase border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-2.5 font-bold">Producto</th>
                                        <th className="px-4 py-2.5 font-bold text-right">Precio Unit.</th>
                                        <th className="px-4 py-2.5 font-bold text-center">Cantidad</th>
                                        <th className="px-4 py-2.5 font-bold text-right">Subtotal</th>
                                        <th className="px-4 py-2.5 font-bold text-center">Quitar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {carrito.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-xs text-slate-500">
                                                Aún no has agregado productos. Selecciónalos arriba y pulsa{' '}
                                                <span className="font-semibold text-slate-700">Añadir</span>.
                                            </td>
                                        </tr>
                                    ) : (
                                        carrito.map((item) => (
                                            <tr key={item.idProducto} className="hover:bg-slate-50">
                                                <td className="px-4 py-2.5">
                                                    <p className="font-semibold text-slate-900">{item.nombre}</p>
                                                    <p className="text-[11px] text-slate-400">
                                                        Disponible: {item.stockMax} und.
                                                    </p>
                                                </td>
                                                <td className="px-4 py-2.5 text-right text-slate-700">
                                                    {formatoMoneda(item.precio)}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleCambiarCantidadFila(item.idProducto, item.cantidad - 1)
                                                            }
                                                            className="w-6 h-6 rounded border border-slate-300 bg-white hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-slate-900">
                                                            {item.cantidad}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleCambiarCantidadFila(item.idProducto, item.cantidad + 1)
                                                            }
                                                            className="w-6 h-6 rounded border border-slate-300 bg-white hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                                                    {formatoMoneda(item.precio * item.cantidad)}
                                                </td>
                                                <td className="px-4 py-2.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEliminarFila(item.idProducto)}
                                                        title="Eliminar producto"
                                                        className="p-1.5 rounded-md text-red-600 hover:bg-red-50 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {carrito.length > 0 && (
                                    <tfoot className="bg-slate-50 border-t border-slate-200">
                                        <tr>
                                            <td colSpan="3" className="px-4 py-3 text-right font-bold text-slate-700">
                                                TOTAL A PAGAR:
                                            </td>
                                            <td className="px-4 py-3 text-right text-lg font-extrabold text-blue-700">
                                                {formatoMoneda(totalVenta)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="border-slate-300 text-slate-700"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={guardando || carrito.length === 0}
                                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer"
                            >
                                {guardando ? 'Procesando venta...' : 'Confirmar y Registrar Venta'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}