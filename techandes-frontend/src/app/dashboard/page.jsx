'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LogOut,
  Package,
  ShoppingCart,
  Users,
  UserCheck,
  BarChart3,
  DollarSign,
  Clock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [inicioData, setInicioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const router = useRouter();

  const cargarTodo = async (esRecarga = false) => {
    if (esRecarga) setActualizando(true);
    try {
      const [resUser, resInicio] = await Promise.all([
        api.get('/auth/me'),
        api.get('/inicio'),
      ]);
      setUser(resUser.data);
      setInicioData(resInicio.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/login');
      } else {
        console.error('Error cargando datos del dashboard:', error);
      }
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor || 0);
  };

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return '—';
    return new Date(fechaIso).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const badgeEstado = (estado) => {
    switch (estado) {
      case 'ENTREGADO':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ENVIADO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDIENTE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 font-medium animate-pulse">Cargando panel de control...</p>
      </div>
    );
  }

  const esAdmin = user?.rol === 'ROLE_ADMIN' || user?.rol === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Superior */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">TechAndes POS</h1>
          <p className="text-xs text-slate-500">Panel de Control</p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => cargarTodo(true)}
            disabled={actualizando}
            className="gap-2 text-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${actualizando ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.username}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
              {user?.rol}
            </span>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Banner de Bienvenida + Mis Ventas */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              ¡Hola {user?.nombre} {user?.apellido}!
            </h2>
            <p className="text-slate-600 mt-1 text-sm">
              Bienvenido al sistema POS de TechAndes. Aquí tienes el resumen operativo del día.
            </p>
          </div>

          {/* Resumen Personal del Empleado */}
          {inicioData?.misVentas && (
            <div className="flex items-center gap-6 bg-indigo-50 border border-indigo-100 px-5 py-3.5 rounded-xl shrink-0">
              <div>
                <span className="block text-xs font-semibold uppercase text-indigo-600">
                  Mis Pedidos
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {inicioData.misVentas.pedidos ?? 0}
                </span>
              </div>
              <div className="h-9 w-px bg-indigo-200" />
              <div>
                <span className="block text-xs font-semibold uppercase text-indigo-600">
                  Mis Ventas Totales
                </span>
                <span className="text-xl font-extrabold text-indigo-700">
                  {formatearMoneda(inicioData.misVentas.total)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Fila de 4 KPIs Generales */}
        {inicioData?.indicadores && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-slate-500">
                  Ventas Totales
                </CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-slate-900">
                  {formatearMoneda(inicioData.indicadores.ventas_totales)}
                </div>
                <p className="text-xs text-emerald-600 mt-1">Pedidos efectivos</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-slate-500">
                  Pedidos Pendientes
                </CardTitle>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-amber-600">
                  {inicioData.indicadores.pendientes ?? 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">Por gestionar</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-slate-500">
                  Clientes Activos
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-blue-600">
                  {inicioData.indicadores.clientes ?? 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">Base registrada</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-slate-500">
                  Stock Bajo
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-red-600">
                  {inicioData.indicadores.stock_bajo ?? 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">Menos de 10 unidades</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Accesos Directos a Módulos */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Módulos del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Punto de Venta */}
            <Card
              className="bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push('/dashboard/pedidos')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-bold text-slate-900">Punto de Venta</CardTitle>
                <ShoppingCart className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600 text-xs">
                  Registrar nuevos pedidos, facturar y descontar inventario.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Productos */}
            <Card
              className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push('/dashboard/productos')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-bold text-slate-900">Inventario</CardTitle>
                <Package className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600 text-xs">
                  Consultar catálogo, precios y existencias en bodega.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Empleados (Solo ADMIN) */}
            {esAdmin && (
              <Card
                className="bg-amber-50/60 border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer"
                onClick={() => router.push('/dashboard/empleados')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-bold text-slate-900">Empleados</CardTitle>
                  <UserCheck className="h-5 w-5 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-700 text-xs">
                    Administrar personal, roles y accesos al sistema.
                  </CardDescription>
                </CardContent>
              </Card>
            )}

            {/* Informes y Reportes (Solo ADMIN) */}
            {esAdmin && (
              <Card
                className="bg-indigo-50/60 border border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
                onClick={() => router.push('/dashboard/informes')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-bold text-slate-900">Informes</CardTitle>
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-700 text-xs">
                    Analítica por categoría, ranking de vendedores y top productos.
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Tablas Operativas: Últimos Pedidos + Alertas de Stock */}
        {inicioData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Últimos 5 Pedidos */}
            <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Últimos 5 Pedidos
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Movimientos más recientes registrados
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-600"
                  onClick={() => router.push('/dashboard/pedidos')}
                >
                  Ver todos &rarr;
                </Button>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b text-xs">
                    <tr>
                      <th className="px-4 py-3"># Pedido</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inicioData.ultimos?.map((ped) => (
                      <tr key={ped.id_pedido} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-semibold text-slate-700">
                          #{ped.id_pedido}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{ped.cliente}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {formatearFecha(ped.fecha_pedido)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeEstado(
                              ped.estado
                            )}`}
                          >
                            {ped.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatearMoneda(ped.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Alertas de Bajo Stock */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Alertas de Inventario
                  </CardTitle>
                  <CardDescription className="text-xs">Productos con stock menor a 10</CardDescription>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">
                  {inicioData.bajoStock?.length || 0}
                </span>
              </CardHeader>
              <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
                {inicioData.bajoStock?.map((prod) => (
                  <div
                    key={prod.id_producto}
                    className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{prod.nombre}</p>
                      <span className="text-xs text-slate-400">ID #{prod.id_producto}</span>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold ${prod.stock === 0
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      {prod.stock === 0 ? 'Agotado (0)' : `${prod.stock} und.`}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}