'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    ClipboardList,
    BarChart3,
    LogOut,
    Menu,
    X,
} from 'lucide-react';

export default function DashboardLayout({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const verificarSesion = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
            } catch (error) {
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
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-600 font-medium text-sm">Cargando Portal TechAndes...</p>
                </div>
            </div>
        );
    }

    // Definición de enlaces según los requerimientos de TechAndes
    const navItems = [
        { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard, adminOnly: false },
        { name: 'Nueva Venta', href: '/dashboard/nueva-venta', icon: ShoppingCart, adminOnly: false },
        { name: 'Pedidos', href: '/dashboard/pedidos', icon: ClipboardList, adminOnly: false },
        { name: 'Productos', href: '/dashboard/productos', icon: Package, adminOnly: false },
        { name: 'Clientes', href: '/dashboard/clientes', icon: Users, adminOnly: false },
        { name: 'Informes', href: '/dashboard/informes', icon: BarChart3, adminOnly: true },
    ];

    // Filtrar rutas exclusivas de ADMIN
    const visibleNavItems = navItems.filter(
        (item) => !item.adminOnly || user?.rol === 'ROLE_ADMIN'
    );

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Franja superior corporativa */}
            <div className="h-1.5 bg-gradient-to-r from-slate-900 via-blue-700 to-sky-500" />

            {/* Header Principal */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Izquierda: Identidad Visual banner.svg */}
                        <Link href="/dashboard" className="flex items-center shrink-0">
                            <img
                                src="/banner.svg"
                                alt="Portal TechAndes"
                                className="h-11 w-auto object-contain"
                            />
                        </Link>

                        {/* Derecha: Nombre, Cargo, Rol + Cerrar Sesión */}
                        <div className="hidden md:flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-900 leading-tight">
                                    {user?.nombre} {user?.apellido}
                                </p>
                                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                    <span className="text-xs text-slate-500 font-medium">
                                        {user?.cargo || 'Colaborador'}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span
                                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${user?.rol === 'ROLE_ADMIN'
                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}
                                    >
                                        {user?.rol === 'ROLE_ADMIN' ? 'ADMIN' : 'VENDEDOR'}
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                            >
                                <LogOut className="h-4 w-4" />
                                Cerrar sesión
                            </Button>
                        </div>

                        {/* Botón Menú Móvil */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-slate-700"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Barra de Navegación Secundaria (Desktop) */}
                <nav className="hidden md:block bg-slate-900 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center space-x-1 py-1.5">
                            {visibleNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* Menú Desplegable Móvil */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-4 space-y-3 shadow-lg">
                        {/* Info usuario en móvil */}
                        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-900">
                                    {user?.nombre} {user?.apellido}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {user?.cargo || 'Colaborador'} —{' '}
                                    <span className="font-semibold text-blue-700">
                                        {user?.rol === 'ROLE_ADMIN' ? 'ADMIN' : 'VENDEDOR'}
                                    </span>
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleLogout}
                                className="bg-red-600 text-white"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Enlaces móviles */}
                        <div className="space-y-1">
                            {visibleNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive
                                                ? 'bg-blue-50 text-blue-700 font-semibold'
                                                : 'text-slate-700 hover:bg-slate-100'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </header>

            {/* Contenido dinámico de cada página hija */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
}