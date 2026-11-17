'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Package, ShoppingCart, Users, UserCheck } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        // Consulta al backend enviando automáticamente la cookie HttpOnly
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (error) {
        // Si no hay cookie válida, el interceptor de api.js o este catch redirigen al login
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    verificarSesion();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 font-medium animate-pulse">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar Superior */}
      {/* Navbar Superior */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">TechAndes POS</h1>
          <p className="text-xs text-slate-500">Panel de Control</p>
        </div>

        <div className="flex items-center gap-4">
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
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            ¡Hola {user?.nombre} {user?.apellido}, iniciaste sesión correctamente!
          </h2>
          <p className="text-slate-600 mt-1">
            Tu sesión está protegida con JWT en Cookie HttpOnly. Selecciona un módulo para comenzar:
          </p>
        </div>

        {/* Tarjetas de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Módulo de Ventas / POS */}
          <Card
            className="bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer"
            onClick={() => router.push('/dashboard/pedidos')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-slate-900">Punto de Venta</CardTitle>
              <ShoppingCart className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Registrar nuevos pedidos, facturar y descontar inventario.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Módulo de Productos */}
          <Card
            className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
            onClick={() => router.push('/dashboard/productos')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-slate-900">Inventario y Productos</CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Consultar catálogo, precios y existencias en bodega.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Módulo de Empleados (Solo ADMIN) */}
          {user?.rol === 'ROLE_ADMIN' && (
            <Card
              className="bg-amber-50/70 border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push('/dashboard/empleados')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-slate-900">Gestión de Empleados</CardTitle>
                <UserCheck className="h-5 w-5 text-amber-600" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-700">
                  Administrar personal, roles y accesos al sistema (Solo Admin).
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}