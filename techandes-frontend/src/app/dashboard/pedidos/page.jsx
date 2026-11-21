'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    Eye,
    Plus,
    ShoppingBag,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { DetallePedidoModal } from './DetallePedidoModal';
import { NuevaVentaModal } from './NuevaVentaModal';

export default function PedidosPage() {
    const router = useRouter();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalNuevaVentaOpen, setModalNuevaVentaOpen] = useState(false);

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');

    // Estado del Modal independiente (solo guarda el idPedido de la fila seleccionada)
    const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
    const [idPedidoSeleccionado, setIdPedidoSeleccionado] = useState(null);

    const cargarPedidos = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await api.get('/pedidos');
            // Ordenar del pedido más reciente al más antiguo
            const ordenados = (res.data || []).sort((a, b) => b.idPedido - a.idPedido);
            setPedidos(ordenados);
        } catch (err) {
            console.error('Error al cargar pedidos:', err);
            setError('No se pudo cargar el historial de pedidos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarPedidos();
    }, []);

    const abrirModalDetalle = (idPedido) => {
        setIdPedidoSeleccionado(idPedido);
        setModalDetalleOpen(true);
    };

    // Filtrado por texto y estado
    const pedidosFiltrados = pedidos.filter((ped) => {
        const cumpleEstado =
            filtroEstado === 'TODOS' || ped.estado?.toUpperCase() === filtroEstado;

        const termino = busqueda.toLowerCase().trim();
        if (!termino) return cumpleEstado;

        const nombreCliente = `${ped.cliente?.nombre || ''} ${ped.cliente?.apellido || ''}`.toLowerCase();
        const nombreVendedor = `${ped.empleado?.nombres || ''} ${ped.empleado?.apellidos || ''}`.toLowerCase();

        const cumpleTexto =
            String(ped.idPedido).includes(termino) ||
            nombreCliente.includes(termino) ||
            ped.cliente?.documento?.toLowerCase().includes(termino) ||
            ped.cliente?.ciudad?.toLowerCase().includes(termino) ||
            nombreVendedor.includes(termino) ||
            ped.metodoPago?.toLowerCase().includes(termino);

        return cumpleEstado && cumpleTexto;
    });

    // Contadores rápidos para los KPIs
    const totalPedidos = pedidos.length;
    const totalEntregados = pedidos.filter((p) => p.estado === 'ENTREGADO').length;
    const totalPendientes = pedidos.filter(
        (p) => p.estado === 'PENDIENTE' || p.estado === 'EN_PROCESO'
    ).length;
    const totalCancelados = pedidos.filter((p) => p.estado === 'CANCELADO').length;

    const badgeEstado = (estado) => {
        switch (estado?.toUpperCase()) {
            case 'ENTREGADO':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'EN_PROCESO':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CANCELADO':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    // Definición de columnas para <DataTable />
    const columnas = [
        {
            header: 'Pedido',
            accessor: 'idPedido',
            render: (ped) => (
                <div>
                    <span className="font-extrabold text-slate-900">#{ped.idPedido}</span>
                    <p className="text-xs text-slate-500">
                        {ped.fechaPedido
                            ? new Date(ped.fechaPedido).toLocaleString('es-CO', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })
                            : 'Sin fecha'}
                    </p>
                </div>
            ),
        },
        {
            header: 'Cliente',
            accessor: 'cliente',
            render: (ped) => (
                <div>
                    <p className="font-bold text-slate-900">
                        {ped.cliente?.nombre} {ped.cliente?.apellido}
                    </p>
                    <p className="text-xs text-slate-500">
                        CC: {ped.cliente?.documento || 'N/A'}
                        {ped.cliente?.ciudad ? ` · ${ped.cliente.ciudad}` : ''}
                    </p>
                </div>
            ),
        },
        {
            header: 'Vendedor',
            accessor: 'empleado',
            render: (ped) => (
                <div>
                    <p className="font-medium text-slate-800">
                        {ped.empleado?.nombres} {ped.empleado?.apellidos}
                    </p>
                    <p className="text-xs text-slate-500">{ped.empleado?.cargo || 'Asesor'}</p>
                </div>
            ),
        },
        {
            header: 'Método Pago',
            accessor: 'metodoPago',
            render: (ped) => (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">
                    <CreditCard className="h-3.5 w-3.5 text-slate-500" />
                    {ped.metodoPago || 'N/A'}
                </div>
            ),
        },
        {
            header: 'Estado',
            accessor: 'estado',
            render: (ped) => (
                <span
                    className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${badgeEstado(
                        ped.estado
                    )}`}
                >
                    {ped.estado || 'PENDIENTE'}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <ShoppingBag className="h-6 w-6 text-blue-600" />
                        Gestión de Pedidos
                    </h1>
                    <p className="text-sm text-slate-600">
                        Consulta facturas emitidas, productos vendidos y estado de entrega.
                    </p>
                </div>

                <Button
                    onClick={() => setModalNuevaVentaOpen(true)}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Venta (POS)
                </Button>
            </div>

            {/* Tarjetas resumen */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <p className="text-xs font-medium text-slate-500">Total Pedidos</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalPedidos}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-500">Entregados</p>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-700 mt-1">{totalEntregados}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-500">Pendientes / Proceso</p>
                        <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-amber-700 mt-1">{totalPendientes}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-500">Cancelados</p>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="text-2xl font-extrabold text-red-700 mt-1">{totalCancelados}</p>
                </div>
            </div>

            {/* Barra de búsqueda y filtro por estado */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por # pedido, cliente, cédula, ciudad o asesor..."
                        className="pl-9 bg-white border-slate-300 text-slate-900"
                    />
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {['TODOS', 'PENDIENTE', 'EN_PROCESO', 'ENTREGADO', 'CANCELADO'].map((estado) => (
                        <button
                            key={estado}
                            type="button"
                            onClick={() => setFiltroEstado(estado)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${filtroEstado === estado
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {estado.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                    {error}
                </div>
            )}

            {/* Tabla reutilizable */}
            <DataTable
                data={pedidosFiltrados}
                idKey="idPedido"
                columns={columnas}
                loading={loading}
                emptyMessage="No se encontraron pedidos con los filtros seleccionados."
                actions={(pedido) => (
                    <Button
                        variant="outline"
                        size="sm"
                        title="Ver detalle del pedido"
                        onClick={() => abrirModalDetalle(pedido.idPedido)}
                        className="border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer gap-1.5"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        Detalle
                    </Button>
                )}
            />

            {/* Modal independiente fuera de la tabla */}
            <DetallePedidoModal
                open={modalDetalleOpen}
                onOpenChange={setModalDetalleOpen}
                idPedido={idPedidoSeleccionado}
                onSuccess={cargarPedidos}
            />
            <NuevaVentaModal
                open={modalNuevaVentaOpen}
                onOpenChange={setModalNuevaVentaOpen}
                onSuccess={cargarPedidos}
            />
        </div>
    );
}