'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api'; // Ajusta la ruta según donde tengas tu archivo axios

export default function InformesPage() {
  const [informes, setInformes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabActiva, setTabActiva] = useState('categorias');

  useEffect(() => {
    cargarInformes();
  }, []);

  const cargarInformes = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/informes');
      setInformes(data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('No tienes permisos de administrador para ver los informes.');
      } else {
        setError('Error al consultar los informes en el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 bg-slate-900 text-white">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Panel de Informes — TechAndes
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Analítica comercial y rendimiento operativo
            </p>
          </div>
          <button
            onClick={cargarInformes}
            disabled={loading}
            className="self-start sm:self-auto px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : '↻ Actualizar Datos'}
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="p-6 space-y-6">
          {loading && (
            <div className="py-20 text-center text-slate-500 animate-pulse font-medium">
              Cargando métricas y reportes...
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && informes && (
            <>
              {/* Tarjetas KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <span className="text-xs font-semibold uppercase text-blue-600">
                    Ingresos Totales (Sin Cancelados)
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {formatearMoneda(informes.granTotal)}
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-xs font-semibold uppercase text-emerald-600">
                    Categorías Activas
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {informes.porCategoria?.length || 0}
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="text-xs font-semibold uppercase text-amber-600">
                    Clientes Sin Compras
                  </span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">
                    {informes.clientesSinCompras?.length || 0}
                  </p>
                </div>
              </div>

              {/* Pestañas de Navegación */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                {[
                  { id: 'categorias', label: 'Ventas por Categoría' },
                  { id: 'vendedores', label: 'Ranking Vendedores' },
                  { id: 'top5', label: 'Top 5 Productos' },
                  { id: 'sinCompras', label: 'Clientes Sin Compras' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTabActiva(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      tabActiva === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tabla 1: Ventas por Categoría */}
              {tabActiva === 'categorias' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                      <tr>
                        <th className="px-4 py-3">Categoría</th>
                        <th className="px-4 py-3 text-right">Unidades</th>
                        <th className="px-4 py-3 text-right">Total Vendido</th>
                        <th className="px-4 py-3 text-right">Participación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {informes.porCategoria?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{item.categoria}</td>
                          <td className="px-4 py-3 text-right">{item.unidades}</td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatearMoneda(item.total)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {item.porcentaje}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tabla 2: Ranking de Vendedores */}
              {tabActiva === 'vendedores' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                      <tr>
                        <th className="px-4 py-3">Puesto</th>
                        <th className="px-4 py-3">Vendedor</th>
                        <th className="px-4 py-3">Cargo</th>
                        <th className="px-4 py-3 text-right">Pedidos</th>
                        <th className="px-4 py-3 text-right">Total Facturado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {informes.rankingVendedores?.map((v, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-blue-600">#{v.puesto}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{v.vendedor}</td>
                          <td className="px-4 py-3 text-slate-500">{v.cargo}</td>
                          <td className="px-4 py-3 text-right">{v.pedidos}</td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatearMoneda(v.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tabla 3: Top 5 Productos */}
              {tabActiva === 'top5' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3">Categoría</th>
                        <th className="px-4 py-3 text-right">Unidades</th>
                        <th className="px-4 py-3 text-right">Total Generado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {informes.topProductos?.map((prod) => (
                        <tr key={prod.idProducto} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-500">#{prod.idProducto}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{prod.producto}</td>
                          <td className="px-4 py-3 text-slate-600">{prod.categoria}</td>
                          <td className="px-4 py-3 text-right font-semibold">{prod.unidades}</td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                            {formatearMoneda(prod.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tabla 4: Clientes sin Compras */}
              {tabActiva === 'sinCompras' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                      <tr>
                        <th className="px-4 py-3">Documento</th>
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Correo</th>
                        <th className="px-4 py-3">Teléfono</th>
                        <th className="px-4 py-3">Ciudad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {informes.clientesSinCompras?.map((cli) => (
                        <tr key={cli.idCliente} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono text-xs">{cli.documento}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{cli.cliente}</td>
                          <td className="px-4 py-3 text-slate-600">{cli.email || '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{cli.telefono || '—'}</td>
                          <td className="px-4 py-3 text-slate-600">{cli.ciudad || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}