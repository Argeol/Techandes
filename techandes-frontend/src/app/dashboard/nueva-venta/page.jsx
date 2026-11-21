'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Loader2,
    Plus,
    Trash2,
    ShoppingCart,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
} from 'lucide-react';

export default function NuevaVentaPage() {
    const router = useRouter();
    const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');

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

    // Carrito
    const [carrito, setCarrito] = useState([]);

    const cargarDatosIniciales = async () => {
        try {
            setCargandoCatalogos(true);
            setError('');
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

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const formatoMoneda = (valor) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(valor || 0);

    // Añadir producto del <select> a la tablita
    const handleAgregarProducto = () => {
        setError('');
        setMensajeExito('');
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

    // Enviar POST /pedidos
    const handleRegistrarVenta = async (e) => {
        e.preventDefault();
        setError('');
        setMensajeExito('');

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

            // Limpiar formulario y recargar stocks actualizados desde el backend
            setIdCliente('');
            setMetodoPago('EFECTIVO');
            setEstado('ENTREGADO');
            setCarrito([]);
            setMensajeExito('¡Venta registrada con éxito y stock actualizado!');
            await cargarDatosIniciales();
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
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                
                {/* Encabezado de Página */}
                <div className="bg-slate-900 text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                            <ShoppingCart className="h-6 w-6 text-blue-400" />
                            Registrar Nueva Venta (POS)
                        </h1>
                        <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                            Selecciona el cliente, añade los productos del inventario y confirma el pedido.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard')}
                        className="self-start sm:self-auto bg-slate-800 hover:bg-slate-700 text-white border-slate-700 gap-1.5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver al Panel
                    </Button>
                </div>

                {/* Cuerpo de la Página */}
                <div className="p-6">
                    {cargandoCatalogos ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-500">
                            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                            <span className="text-sm font-medium">
                                Cargando clientes y productos disponibles...
                            </span>
                        </div>
                    ) : (
                        <form onSubmit={handleRegistrarVenta} className="space-y-6">
                            {error && (
                                <div className="p-3.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {mensajeExito && (
                                <div className="p-3.5 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                    <span>{mensajeExito}</span>
                                </div>
                            )}

                            {/* Datos generales del pedido */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">
                                        Cliente *
                                    </Label>
                                    <select
                                        required
                                        value={idCliente}
                                        onChange={(e) => setIdCliente(e.target.value)}
                                        className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="">-- Seleccionar cliente --</option>
                                        {clientes.map((cli) => (
                                            <option key={cli.id || cli.idCliente} value={cli.id || cli.idCliente}>
                                                {cli.nombre} {cli.apellido} ({cli.documento})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">
                                        Método de Pago *
                                    </Label>
                                    <select
                                        value={metodoPago}
                                        onChange={(e) => setMetodoPago(e.target.value)}
                                        className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                                    >
                                        <option value="EFECTIVO">EFECTIVO</option>
                                        <option value="PSE">PSE</option>
                                        <option value="TARJETA">TARJETA</option>
                                        <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-slate-700 font-semibold text-xs">
                                        Estado Inicial *
                                    </Label>
                                    <select
                                        value={estado}
                                        onChange={(e) => setEstado(e.target.value)}
                                        className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-600"
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
                                        <option value="">
                                            -- Selecciona un producto del inventario --
                                        </option>
                                        {productos.map((prod) => (
                                            <option key={prod.idProducto} value={prod.idProducto}>
                                                {prod.nombre} — {formatoMoneda(prod.precio)} (Stock:{' '}
                                                {prod.stock})
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

                            {/* Tablita con los productos añadidos */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-700 text-xs uppercase border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 font-bold">Producto</th>
                                            <th className="px-4 py-3 font-bold text-right">
                                                Precio Unit.
                                            </th>
                                            <th className="px-4 py-3 font-bold text-center">
                                                Cantidad
                                            </th>
                                            <th className="px-4 py-3 font-bold text-right">
                                                Subtotal
                                            </th>
                                            <th className="px-4 py-3 font-bold text-center">
                                                Quitar
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {carrito.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="px-4 py-10 text-center text-xs text-slate-500"
                                                >
                                                    Aún no has agregado productos. Selecciónalos arriba y pulsa{' '}
                                                    <span className="font-semibold text-slate-700">
                                                        Añadir
                                                    </span>
                                                    .
                                                </td>
                                            </tr>
                                        ) : (
                                            carrito.map((item) => (
                                                <tr
                                                    key={item.idProducto}
                                                    className="hover:bg-slate-50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold text-slate-900">
                                                            {item.nombre}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400">
                                                            Disponible: {item.stockMax} und.
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-slate-700">
                                                        {formatoMoneda(item.precio)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleCambiarCantidadFila(
                                                                        item.idProducto,
                                                                        item.cantidad - 1
                                                                    )
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
                                                                    handleCambiarCantidadFila(
                                                                        item.idProducto,
                                                                        item.cantidad + 1
                                                                    )
                                                                }
                                                                className="w-6 h-6 rounded border border-slate-300 bg-white hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                                                        {formatoMoneda(
                                                            item.precio * item.cantidad
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEliminarFila(item.idProducto)
                                                            }
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
                                                <td
                                                    colSpan="3"
                                                    className="px-4 py-3.5 text-right font-bold text-slate-700"
                                                >
                                                    TOTAL A PAGAR:
                                                </td>
                                                <td className="px-4 py-3.5 text-right text-lg font-extrabold text-blue-700">
                                                    {formatoMoneda(totalVenta)}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/dashboard')}
                                    className="border-slate-300 text-slate-700"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={guardando || carrito.length === 0}
                                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer px-6"
                                >
                                    {guardando
                                        ? 'Procesando venta...'
                                        : 'Confirmar y Registrar Venta'}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}