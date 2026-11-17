'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Receipt, CreditCard } from 'lucide-react';

export function HistorialClienteModal({ open, onOpenChange, cliente }) {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // OJO: La llave en tu JSON es cliente.id
        if (!open || !cliente?.id) return;

        const cargarHistorial = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/clientes/${cliente.id}/pedidos`);
                setPedidos(res.data || []);
            } catch (err) {
                console.error('Error al cargar historial:', err);
                setPedidos([]);
            } finally {
                setLoading(false);
            }
        };

        cargarHistorial();
    }, [open, cliente]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-blue-600" />
                        Historial de Compras
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Cliente:{' '}
                        <span className="font-semibold text-slate-900">
                            {cliente?.nombre} {cliente?.apellido}
                        </span>{' '}
                        (Doc: {cliente?.documento})
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-10 flex flex-col items-center gap-2 text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-sm">Consultando compras...</span>
                    </div>
                ) : pedidos.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                        Este cliente aún no registra compras en TechAndes.
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-lg">
                        {pedidos.map((ped) => (
                            <div
                                key={ped.idPedido}
                                className="p-3.5 flex items-center justify-between hover:bg-slate-50"
                            >
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">Pedido #{ped.idPedido}</p>
                                    <p className="text-xs text-slate-500">
                                        {ped.fechaPedido
                                            ? new Date(ped.fechaPedido).toLocaleString('es-CO')
                                            : 'Sin fecha'}
                                    </p>
                                    {ped.empleado && (
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Atendido por: {ped.empleado.nombres} {ped.empleado.apellidos}
                                        </p>
                                    )}
                                </div>

                                <div className="text-right space-y-1">
                                    <div className="flex items-center justify-end gap-1 text-xs font-semibold text-slate-700">
                                        <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                                        {ped.metodoPago || 'N/A'}
                                    </div>
                                    <span
                                        className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full ${ped.estado === 'ENTREGADO'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-amber-100 text-amber-800'
                                            }`}
                                    >
                                        {ped.estado}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}