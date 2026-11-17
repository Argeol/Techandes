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
import { Loader2 } from 'lucide-react';

export function UpdateProducto({
    open,
    onOpenChange,
    idProducto = null,
    categorias = [],
    onSuccess,
}) {
    const [cargandoProducto, setCargandoProducto] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [errorForm, setErrorForm] = useState('');

    const [dataOriginal, setDataOriginal] = useState(null);
    const [fechaRegistroOriginal, setFechaRegistroOriginal] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        stock: '',
        idCategoria: '',
        activo: 1,
    });

    const esEdicion = Boolean(idProducto);

    // 1. Consultar producto por ID al abrir el modal
    useEffect(() => {
        if (!open) return;

        setErrorForm('');

        if (idProducto) {
            const consultarProductoPorId = async () => {
                try {
                    setCargandoProducto(true);
                    const res = await api.get(`/productos/${idProducto}`);
                    const prod = res.data;

                    setFechaRegistroOriginal(prod.fechaRegistro || null);

                    const estructuraInicial = {
                        nombre: prod.nombre || '',
                        precio: String(prod.precio ?? ''),
                        stock: String(prod.stock ?? ''),
                        idCategoria: String(prod.categoria?.idCategoria || ''),
                        activo: prod.activo ?? 1,
                    };

                    setDataOriginal(estructuraInicial);
                    setFormData(estructuraInicial);
                } catch (err) {
                    setErrorForm('No se pudo cargar la información del producto.');
                } finally {
                    setCargandoProducto(false);
                }
            };

            consultarProductoPorId();
        } else {
            // Modo Creación
            setDataOriginal(null);
            setFechaRegistroOriginal(null);
            setFormData({
                nombre: '',
                precio: '',
                stock: '',
                idCategoria: categorias.length > 0 ? String(categorias[0].idCategoria) : '',
                activo: 1,
                
            });
        }
    }, [open, idProducto, categorias]);

    // 2. Detectar si hubo cambios reales respecto al JSON original
    const huboCambios = () => {
        if (!dataOriginal) return true;
        return (
            formData.nombre.trim() !== dataOriginal.nombre.trim() ||
            Number(formData.precio) !== Number(dataOriginal.precio) ||
            Number(formData.stock) !== Number(dataOriginal.stock) ||
            String(formData.idCategoria) !== String(dataOriginal.idCategoria) ||
            Number(formData.activo) !== Number(dataOriginal.activo)
        );
    };

    // 3. Guardar (POST o PUT)
    const handleGuardar = async (e) => {
        e.preventDefault();
        setErrorForm('');

        if (esEdicion && !huboCambios()) {
            onOpenChange(false);
            return;
        }

        setGuardando(true);

        // Payload exacto según el JSON de tu entidad Productos
        const payload = {
            nombre: formData.nombre.trim(),
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock, 10),
            activo: Number(formData.activo),
            ...(fechaRegistroOriginal ? { fechaRegistro: fechaRegistroOriginal } : {}),
            ...(formData.idCategoria
                ? { categoria: { idCategoria: parseInt(formData.idCategoria, 10) } }
                : {}),
        };

        try {
            if (esEdicion) {
                await api.put(`/productos/${idProducto}`, payload);
            } else {
                await api.post('/productos', payload);
            }
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            setErrorForm(
                err.response?.data?.message || 'Error al guardar el producto. Verifica los campos.'
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900">
                        {esEdicion ? `Editar Producto #${idProducto}` : 'Registrar Nuevo Producto'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        {esEdicion
                            ? 'Actualiza los datos del artículo. Solo se enviará si realizas cambios.'
                            : 'Ingresa los datos del nuevo artículo para el inventario.'}
                    </DialogDescription>
                </DialogHeader>

                {cargandoProducto ? (
                    <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-sm">Consultando producto...</span>
                    </div>
                ) : (
                    <form onSubmit={handleGuardar} className="space-y-4 mt-2">
                        {errorForm && (
                            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
                                {errorForm}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label className="text-slate-700 font-semibold">Nombre del Producto *</Label>
                            <Input
                                required
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder='Ej. Portátil Lenovo IdeaPad 3 14"'
                                className="bg-white border-slate-300 text-slate-900"
                            />
                        </div>

                        {categorias.length > 0 && (
                            <div className="space-y-1.5">
                                <Label className="text-slate-700 font-semibold">Categoría *</Label>
                                <select
                                    required
                                    value={formData.idCategoria}
                                    onChange={(e) => setFormData({ ...formData, idCategoria: e.target.value })}
                                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categorias.map((cat) => (
                                        <option key={cat.idCategoria} value={cat.idCategoria}>
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-slate-700 font-semibold">Precio (COP) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={formData.precio}
                                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                    className="bg-white border-slate-300 text-slate-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-slate-700 font-semibold">Stock *</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    required
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="bg-white border-slate-300 text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Estado Activo / Inactivo */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 font-semibold">Estado en Catálogo</Label>
                            <select
                                value={formData.activo}
                                onChange={(e) => setFormData({ ...formData, activo: Number(e.target.value) })}
                                className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                            >
                                <option value={1}>Activo (Disponible)</option>
                                <option value={0}>Inactivo (Oculto)</option>
                            </select>
                        </div>

                        <DialogFooter className="pt-4">
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
                                disabled={guardando}
                                className="bg-blue-700 hover:bg-blue-800 text-white"
                            >
                                {guardando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Producto'}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}