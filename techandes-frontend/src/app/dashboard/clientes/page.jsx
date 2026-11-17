'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    UserPlus,
    Pencil,
    Trash2,
    Users,
    Receipt,
    Phone,
    Mail,
} from 'lucide-react';
import { UpdateCliente } from './UpdateCliente';
import { HistorialClienteModal } from './HistorialClienteModal';

export default function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [userRol, setUserRol] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal Crear / Editar
    const [modalFormOpen, setModalFormOpen] = useState(false);
    const [idSeleccionado, setIdSeleccionado] = useState(null);

    // Modal Historial
    const [modalHistorialOpen, setModalHistorialOpen] = useState(false);
    const [clienteHistorial, setClienteHistorial] = useState(null);

    const esAdmin = userRol === 'ROLE_ADMIN';

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [resUser, resCli] = await Promise.all([
                api.get('/auth/me'),
                api.get('/clientes'),
            ]);
            setUserRol(resUser.data.rol);
            setClientes(resCli.data);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Filtro por nombre, documento, teléfono o correo
    const clientesFiltrados = clientes.filter((cli) => {
        const termino = busqueda.toLowerCase();
        const nombreCompleto = `${cli.nombre || ''} ${cli.apellido || ''}`.toLowerCase();
        return (
            nombreCompleto.includes(termino) ||
            cli.documento?.toLowerCase().includes(termino) ||
            cli.telefono?.toLowerCase().includes(termino) ||
            cli.email?.toLowerCase().includes(termino)||
            cli.ciudad?.toLowerCase().includes(termino)
        );
    });

    const abrirModalCrear = () => {
        setIdSeleccionado(null);
        setModalFormOpen(true);
    };

    const abrirModalEditar = (id) => {
        setIdSeleccionado(id);
        setModalFormOpen(true);
    };

    const abrirModalHistorial = (cliente) => {
        setClienteHistorial(cliente);
        setModalHistorialOpen(true);
    };

    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`¿Estás seguro de eliminar al cliente "${nombre}"?`)) return;
        try {
            await api.delete(`/clientes/${id}`);
            setClientes((prev) => prev.filter((c) => c.idCliente !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'No se pudo eliminar el cliente.');
        }
    };

    const columnas = [
        {
            header: 'Cliente',
            accessor: 'nombre',
            render: (cli) => (
                <div>
                    <p className="font-bold text-slate-900">
                        {cli.nombre} {cli.apellido}
                    </p>
                    {cli.ciudad && (
                        <p className="text-xs text-slate-500 line-clamp-1">{cli.ciudad}</p>
                    )}
                </div>
            ),
        },
        

        {
            header: 'Documento / NIT',
            accessor: 'documento',
            render: (cli) => (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    {cli.documento || 'Sin doc.'}
                </span>
            ),
        },
        {
            header: 'Contacto',
            accessor: 'telefono',
            render: (cli) => (
                <div className="space-y-0.5 text-xs text-slate-600">
                    {cli.telefono && (
                        <p className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {cli.telefono}
                        </p>
                    )}
                    {cli.email && (
                        <p className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-slate-400" />
                            {cli.email}
                        </p>
                    )}
                    {!cli.telefono && !cli.email && <span className="text-slate-400">Sin datos</span>}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        Directorio de Clientes
                    </h1>
                    <p className="text-sm text-slate-600">
                        Gestiona clientes registrados y consulta su historial de compras.
                    </p>
                </div>

                <Button
                    onClick={abrirModalCrear}
                    className="bg-blue-700 hover:bg-blue-800 text-white gap-2 shadow-xs cursor-pointer"
                >
                    <UserPlus className="h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </div>

            {/* Buscador */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por nombre, documento, teléfono o correo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-10 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                    />
                </div>

                <div className="text-sm text-slate-500 font-medium">
                    Mostrando <span className="text-slate-900 font-bold">{clientesFiltrados.length}</span> de{' '}
                    {clientes.length} clientes
                </div>
            </div>

            {/* Tabla Reutilizable */}
            <DataTable
                data={clientesFiltrados}
                idKey="id"
                columns={columnas}
                loading={loading}
                emptyMessage="No se encontraron clientes con ese criterio de búsqueda."
                actions={(cliente) => (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            title="Historial de compras"
                            onClick={() => abrirModalHistorial(cliente)}
                            className="border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                        >
                            <Receipt className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            title="Editar cliente"
                            onClick={() => abrirModalEditar(cliente.id)}
                            className="border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        {esAdmin && (
                            <Button
                                variant="outline"
                                size="sm"
                                title="Eliminar cliente"
                                onClick={() => handleEliminar(cliente.id, `${cliente.nombre} ${cliente.apellido}`)}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </>
                )}
            />

            {/* Modales por fuera de la tabla */}
            <UpdateCliente
                open={modalFormOpen}
                onOpenChange={setModalFormOpen}
                idCliente={idSeleccionado}
                onSuccess={cargarDatos}
            />

            <HistorialClienteModal
                open={modalHistorialOpen}
                onOpenChange={setModalHistorialOpen}
                cliente={clienteHistorial}
            />
        </div>
    );
}