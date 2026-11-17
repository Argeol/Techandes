'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DataTable } from '@/components/DataTable';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Package,
    AlertTriangle,
} from 'lucide-react';
import { UpdateProducto } from './UpdateProducto';

export default function ProductosPage() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [userRol, setUserRol] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);

    // Estados para controlar el Modal separado (solo guardamos el ID)
    const [modalOpen, setModalOpen] = useState(false);
    const [idSeleccionado, setIdSeleccionado] = useState(null);

    const esAdmin = userRol === 'ROLE_ADMIN';

    // Cargar datos iniciales (Rol, Productos y Categorías)
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [resUser, resProd] = await Promise.all([
                api.get('/auth/me'),
                api.get('/productos'),
            ]);
            setUserRol(resUser.data.rol);
            setProductos(resProd.data);

            try {
                const resCat = await api.get('/categorias');
                setCategorias(resCat.data);
            } catch {
                // Si aún no existe /api/categorias, no bloquea la vista
            }
        } catch (error) {
            console.error('Error al cargar catálogo:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // Filtrado en tiempo real
    const productosFiltrados = productos.filter((prod) => {
        const termino = busqueda.toLowerCase();
        const nombreMatch = prod.nombre?.toLowerCase().includes(termino);
        const descMatch = prod.descripcion?.toLowerCase().includes(termino);
        const catMatch = prod.categoria?.nombre?.toLowerCase().includes(termino);
        return nombreMatch || descMatch || catMatch;
    });

    // Abrir modal en modo CREAR (ID nulo)
    const abrirModalCrear = () => {
        setIdSeleccionado(null);
        setModalOpen(true);
    };

    // Abrir modal en modo EDITAR (pasando solo el ID de la fila)
    const abrirModalEditar = (id) => {
        setIdSeleccionado(id);
        setModalOpen(true);
    };

    // Eliminar producto (DELETE)
    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) return;

        try {
            await api.delete(`/productos/${id}`);
            setProductos((prev) => prev.filter((p) => p.idProducto !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'No se pudo eliminar el producto.');
        }
    };

    // Formateador de moneda COP
    const formatoMoneda = (valor) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(valor || 0);

    // Definición única de columnas para <DataTable />
    const columnas = [
        {
            header: 'Producto',
            accessor: 'nombre',
            render: (prod) => (
                <p className="font-bold text-slate-900">{prod.nombre}</p>
            ),
        },
        {
            header: 'Categoría',
            accessor: 'categoria',
            render: (prod) => (
                <div>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {prod.categoria?.nombre || 'General'}
                    </span>
                    {prod.categoria?.descripcion && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            {prod.categoria.descripcion}
                        </p>
                    )}
                </div>
            ),
        },
        {
            header: 'Precio',
            accessor: 'precio',
            headerClassName: 'text-right',
            cellClassName: 'text-right font-semibold text-slate-900',
            render: (prod) => formatoMoneda(prod.precio),
        },
        {
            header: 'Stock',
            accessor: 'stock',
            headerClassName: 'text-center',
            cellClassName: 'text-center',
            render: (prod) => {
                const stockBajo = prod.stock <= 5;
                return (
                    <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${prod.stock === 0
                                ? 'bg-red-100 text-red-700'
                                : stockBajo
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                            }`}
                    >
                        {stockBajo && <AlertTriangle className="h-3 w-3" />}
                        {prod.stock} uds
                    </span>
                );
            },
        },
        {
            header: 'Estado',
            accessor: 'activo',
            headerClassName: 'text-center',
            cellClassName: 'text-center',
            render: (prod) => (
                <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${prod.activo === 1
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                >
                    {prod.activo === 1 ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Cabecera y botón Nuevo Producto (Solo ADMIN) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Package className="h-6 w-6 text-blue-600" />
                        Catálogo de Productos
                    </h1>
                    <p className="text-sm text-slate-600">
                        Consulta existencias y precios en tiempo real.
                    </p>
                </div>

                {esAdmin && (
                    <Button
                        onClick={abrirModalCrear}
                        className="bg-blue-700 hover:bg-blue-800 text-white gap-2 shadow-xs cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Producto
                    </Button>
                )}
            </div>  

            {/* Barra de Búsqueda */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por nombre, descripción o categoría..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-10 bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                    />
                </div>

                <div className="text-sm text-slate-500 font-medium">
                    Mostrando <span className="text-slate-900 font-bold">{productosFiltrados.length}</span> de{' '}
                    {productos.length} productos
                </div>
            </div>

            {/* Tabla Dinámica */}
            <DataTable
                data={productosFiltrados}
                idKey="idProducto"
                columns={columnas}
                loading={loading}
                emptyMessage="No se encontraron productos que coincidan con tu búsqueda."
                actions={
                    esAdmin
                        ? (producto) => (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => abrirModalEditar(producto.idProducto)}
                                    className="border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEliminar(producto.idProducto, producto.nombre)}
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </>
                        )
                        : null
                }
            />

            {/* Modal Independiente que consulta por ID y detecta cambios */}
            <UpdateProducto
                open={modalOpen}
                onOpenChange={setModalOpen}
                idProducto={idSeleccionado}
                categorias={categorias}
                onSuccess={cargarDatos}
            />
        </div>
    );
}