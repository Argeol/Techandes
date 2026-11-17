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

export function UpdateCliente({
  open,
  onOpenChange,
  idCliente = null,
  onSuccess,
}) {
  const [cargandoCliente, setCargandoCliente] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const [dataOriginal, setDataOriginal] = useState(null);
  const [fechaRegistroOriginal, setFechaRegistroOriginal] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    telefono: '',
    email: '',
    ciudad: '',
  });

  const esEdicion = Boolean(idCliente);

  useEffect(() => {
    if (!open) return;
    setErrorForm('');

    if (idCliente) {
      const consultarClientePorId = async () => {
        try {
          setCargandoCliente(true);
          const res = await api.get(`/clientes/${idCliente}`);
          const cli = res.data;

          setFechaRegistroOriginal(cli.fecha_registro || null);

          const estructuraInicial = {
            nombre: cli.nombre || '',
            apellido: cli.apellido || '',
            documento: cli.documento || '',
            telefono: cli.telefono || '',
            email: cli.email || '',
            ciudad: cli.ciudad || '',

          };

          setDataOriginal(estructuraInicial);
          setFormData(estructuraInicial);
        } catch (err) {
          setErrorForm('No se pudo cargar la información del cliente.');
        } finally {
          setCargandoCliente(false);
        }
      };

      consultarClientePorId();
    } else {
      setDataOriginal(null);
      setFechaRegistroOriginal(null);
      setFormData({
        nombre: '',
        apellido: '',
        documento: '',
        telefono: '',
        email: '',
      });
    }
  }, [open, idCliente]);

  const huboCambios = () => {
    if (!dataOriginal) return true;
    return (
      formData.nombre.trim() !== dataOriginal.nombre.trim() ||
      formData.apellido.trim() !== dataOriginal.apellido.trim() ||
      formData.documento.trim() !== dataOriginal.documento.trim() ||
      formData.telefono.trim() !== dataOriginal.telefono.trim() ||
      formData.email.trim() !== dataOriginal.email.trim() ||
      formData.ciudad.trim() !== dataOriginal.ciudad.trim()
    );
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorForm('');

    if (esEdicion && !huboCambios()) {
      onOpenChange(false);
      return;
    }

    setGuardando(true);

    const payload = {
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      documento: formData.documento.trim(),
      telefono: formData.telefono.trim(),
      email: formData.email.trim(),
      ciudad: formData.ciudad.trim(),
      ...(fechaRegistroOriginal ? { fecha_registro: fechaRegistroOriginal } : {}),
    };

    try {
      if (esEdicion) {
        await api.put(`/clientes/${idCliente}`, payload);
      } else {
        await api.post('/clientes', payload);
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorForm(
        err.response?.data?.message || 'Error al guardar el cliente. Verifica los datos.'
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
            {esEdicion ? `Editar Cliente #${idCliente}` : 'Registrar Nuevo Cliente'}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {esEdicion
              ? 'Actualiza los datos de contacto del cliente.'
              : 'Ingresa los datos del cliente para facturación.'}
          </DialogDescription>
        </DialogHeader>

        {cargandoCliente ? (
          <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-sm">Consultando cliente...</span>
          </div>
        ) : (
          <form onSubmit={handleGuardar} className="space-y-4 mt-2">
            {errorForm && (
              <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
                {errorForm}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold">Nombres *</Label>
                <Input
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Carolina"
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold">Apellidos *</Label>
                <Input
                  required
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  placeholder="Ej. Sánchez Prada"
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold">Cédula / NIT *</Label>
                <Input
                  required
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  placeholder="Ej. 1086741219"
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-semibold">Teléfono</Label>
                <Input
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Ej. 3213461507"
                  className="bg-white border-slate-300 text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 font-semibold">Correo Electrónico</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="cliente@correo.com"
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-semibold">Ciudad *</Label>
              <Input
                required
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                placeholder="Ej. Ibagué"
                className="bg-white border-slate-300 text-slate-900"
              />
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
                {guardando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Registrar Cliente'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}