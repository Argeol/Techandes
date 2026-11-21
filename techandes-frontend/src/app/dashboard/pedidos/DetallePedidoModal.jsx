'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
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
    Receipt,
    User,
    Briefcase,
    CreditCard,
    Calendar,
    PackageCheck,
} from 'lucide-react';

export function DetallePedidoModal({
    open,
    onOpenChange,
    idPedido = null,
    onSuccess,
}) {
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const [pedido, setPedido] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('');

    // 1. Consultar pedido y detalles por ID cada vez que se abre el modal
    useEffect(() => {
        if (!open || !idPedido) return;

        const cargarDetallePedido = async () => {
            try {
                setCargando(true);
                setError('');

                // AQUÍ VAN LAS RUTAS: consulta el pedido y sus detalles al mismo tiempo
                const [resPedido, resDetalles] = await Promise.all([
                    api.get(`/pedidos/${idPedido}`),
                    api.get(`/pedidos/${idPedido}/detalles`), // <-- Cambia esta ruta por la de tu @GetMapping en Spring Boot
                ]);

                setPedido(resPedido.data);
                setDetalles(resDetalles.data || []);
                setEstadoSeleccionado(resPedido.data.estado || 'PENDIENTE');
            } catch (err) {
                console.error('Error al cargar detalle del pedido:', err);
                setError('No se pudo cargar la información del pedido.');
            } finally {
                setCargando(false);
            }
        };

        cargarDetallePedido();
    }, [open, idPedido]);

    // 2. Actualizar estado solo si hubo cambios
    const handleActualizarEstado = async () => {
        if (!pedido || estadoSeleccionado === pedido.estado) {
            onOpenChange(false);
            return;
        }

        try {
            setGuardando(true);
            setError('');
            await api.patch(`/pedidos/${idPedido}/estado`, { estado: estadoSeleccionado });
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar el estado del pedido.');
        } finally {
            setGuardando(false);
        }
    };

    const formatoMoneda = (valor) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(valor || 0);

    // Calcular total sumando los ítems (o usando pedido.total si viene calculado desde BD)
    const totalCalculado = detalles.reduce((acc, item) => {
        const precio = item.precioUnitario ?? item.precio ?? item.producto?.precio ?? 0;
        const subtotal = item.subtotal ?? precio * (item.cantidad || 1);
        return acc + subtotal;
    }, 0);

    const totalFinal = pedido?.total ?? totalCalculado;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-blue-600" />
                        Detalle del Pedido #{idPedido}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Consulta los productos facturados y gestiona el estado de entrega.
                    </DialogDescription>
                </DialogHeader>

                {cargando ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-sm">Consultando factura y productos...</span>
                    </div>
                ) : error ? (
                    <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        {error}
                    </div>
                ) : (
                    pedido && (
                        <div className="space-y-5 mt-2">
                            {/* Tarjeta resumen de cabecera */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                                <div className="flex items-start gap-2.5">
                                    <User className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-slate-500">Cliente</p>
                                        <p className="font-bold text-slate-900">
                                            {pedido.cliente?.nombre} {pedido.cliente?.apellido}
                                        </p>
                                        <p className="text-xs text-slate-600">
                                            Doc: {pedido.cliente?.documento || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5">
                                    <Briefcase className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-slate-500">Vendedor</p>
                                        <p className="font-bold text-slate-900">
                                            {pedido.empleado?.nombres} {pedido.empleado?.apellidos}
                                        </p>
                                        <p className="text-xs text-slate-600">
                                            {pedido.empleado?.cargo || 'Asesor'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 pt-1">
                                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span className="text-xs text-slate-700">
                                        {pedido.fechaPedido
                                            ? new Date(pedido.fechaPedido).toLocaleString('es-CO')
                                            : 'Sin fecha'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 pt-1">
                                    <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
                                    <span className="text-xs font-semibold text-slate-800">
                                        Pago: {pedido.metodoPago || 'Efectivo'}
                                    </span>
                                </div>
                            </div>

                            {/* Lista de Productos del Pedido */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-900 text-slate-200 text-xs uppercase px-4 py-2.5 flex justify-between font-semibold">
                                    <span>Producto</span>
                                    <span>Cant. x Precio = Subtotal</span>
                                </div>

                                {detalles.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-500">
                                        No hay ítems registrados para este pedido.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-200 max-h-56 overflow-y-auto">
                                        {detalles.map((item, idx) => {
                                            const precioUnit =
                                                item.precioUnitario ?? item.precio ?? item.producto?.precio ?? 0;
                                            const subtotal = item.subtotal ?? precioUnit * (item.cantidad || 1);

                                            return (
                                                <div
                                                    key={`${item.id?.idPedido}-${item.id?.idProducto}` || idx}
                                                    className="px-4 py-3 flex items-center justify-between text-sm hover:bg-slate-50"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {item.producto?.nombre || `Producto #${item.id?.idProducto}`}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'} ×{' '}
                                                            {formatoMoneda(item.precioUnitario)}
                                                        </p>
                                                    </div>
                                                    <span className="font-bold text-slate-900">
                                                        {formatoMoneda((item.precioUnitario || 0) * (item.cantidad || 1))}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Total */}
                                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-700">Total Pedido</span>
                                    <span className="text-lg font-extrabold text-blue-700">
                                        {formatoMoneda(totalFinal)}
                                    </span>
                                </div>
                            </div>

                            {/* Selector de Estado */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white">
                                <div className="flex items-center gap-2">
                                    <PackageCheck className="h-5 w-5 text-blue-600" />
                                    <Label className="text-sm font-semibold text-slate-800">
                                        Estado del Pedido:
                                    </Label>
                                </div>

                                <select
                                    value={estadoSeleccionado}
                                    onChange={(e) => setEstadoSeleccionado(e.target.value)}
                                    className="h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-blue-600"
                                >
                                    <option value="PENDIENTE">PENDIENTE</option>
                                    <option value="ENVIADO">EN PROCESO</option>
                                    <option value="ENTREGADO">ENTREGADO</option>
                                    <option value="CANCELADO">CANCELADO</option>
                                </select>
                            </div>
                        </div>
                    )
                )}

                <DialogFooter className="pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-slate-300 text-slate-700"
                    >
                        Cerrar
                    </Button>
                    {!cargando && pedido && (
                        <Button
                            type="button"
                            disabled={guardando}
                            onClick={handleActualizarEstado}
                            className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
                        >
                            {guardando ? 'Guardando...' : 'Actualizar Estado'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}