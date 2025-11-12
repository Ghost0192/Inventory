'use client';

import React, { useState, useEffect } from 'react';
import { Producto } from '../types';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';

// 🧠 Shadcn UI Components (ya los tienes en components/ui)
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// ⚙️ Carga dinámica del escáner
const BarcodeScanner = dynamic(() => import('react-qr-barcode-scanner'), { ssr: false });

interface Props {
    producto?: Producto;
    onSuccess: () => void;
}

export const ProductoForm: React.FC<Props> = ({ producto, onSuccess }) => {
    const [form, setForm] = useState<Producto>({
        id_prod: '',
        codigo_producto: '',
        nombre_prod: '',
        descripcion_prod: '',
        marca_prod: '',
        origen_prod: '',
        categoria_prod: '',
        id_proveedor: '',
        nombre_proveedor: '',
        unidad_medida: '',
        stock_min: 0,
        sucursal: '',
        bodega: '',
        activo: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openScanner, setOpenScanner] = useState(false);

    // Cargar datos si es edición
    useEffect(() => {
        if (producto) setForm(producto);
    }, [producto]);

    // Traer nombre automáticamente al escribir código
    useEffect(() => {
        const fetchNombre = async () => {
            if (!form.codigo_producto) return;

            try {
                const { data, error } = await supabase
                    .from('a_productos')
                    .select('nombre_prod')
                    .eq('codigo_producto', form.codigo_producto)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                if (data) {
                    setForm(prev => ({ ...prev, nombre_prod: data.nombre_prod }));
                }
            } catch (err: any) {
                console.error('Error al traer nombre del producto:', err.message);
            }
        };

        fetchNombre();
    }, [form.codigo_producto]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleScan = (result: any) => {
        if (result?.text) {
            setForm(prev => ({ ...prev, codigo_producto: result.text }));
            setOpenScanner(false);
        }
    };

    const handleError = (err: any) => {
        console.error('Error en escáner:', err);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (producto) {
                const { error } = await supabase
                    .from('a_productos')
                    .update(form)
                    .eq('id_prod', producto.id_prod);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('a_productos')
                    .insert(form);

                if (error) throw error;
            }

            onSuccess();
            setForm({
                id_prod: '',
                codigo_producto: '',
                nombre_prod: '',
                descripcion_prod: '',
                marca_prod: '',
                origen_prod: '',
                categoria_prod: '',
                id_proveedor: '',
                nombre_proveedor: '',
                unidad_medida: '',
                stock_min: 0,
                sucursal: '',
                bodega: '',
                activo: true,
            });
        } catch (err: any) {
            setError(err.message || 'Error al guardar el producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
            {error && <p className="text-red-500">{error}</p>}

            {/* 🧾 Código con botón escanear */}
            <div>
                <label className="block font-medium">Código del Producto</label>
                <div className="flex items-center gap-2">
                    <Dialog open={openScanner} onOpenChange={setOpenScanner}>
                        <DialogTrigger asChild>
                            <Button type="button" className="bg-green-500 hover:bg-green-600 text-white">
                                📷 Escanear
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>Escanear código del producto</DialogTitle>
                            </DialogHeader>

                            <div className="flex flex-col items-center">
                                <BarcodeScanner
                                    width={350}
                                    height={250}
                                    onUpdate={(err, result) => {
                                        if (result) handleScan(result);
                                        if (err) handleError(err);
                                    }}
                                />
                                <Button
                                    type="button"
                                    className="mt-3 bg-gray-400 hover:bg-gray-500 text-white"
                                    onClick={() => setOpenScanner(false)}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <input
                        type="text"
                        name="codigo_producto"
                        value={form.codigo_producto}
                        onChange={handleChange}
                        required
                        className="border p-2 flex-1 rounded"
                        placeholder="Escanear o escribir código"
                    />
                </div>
            </div>

            {/* 🏷️ Resto del formulario */}
            <div>
                <label className="block font-medium">Nombre</label>
                <input
                    type="text"
                    name="nombre_prod"
                    value={form.nombre_prod}
                    onChange={handleChange}
                    required
                    className="border p-2 w-full rounded"
                />
            </div>

            <div>
                <label className="block font-medium">Categoría</label>
                <input
                    type="text"
                    name="categoria_prod"
                    value={form.categoria_prod}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                />
            </div>

            <div>
                <label className="block font-medium">Unidad de Medida</label>
                <input
                    type="text"
                    name="unidad_medida"
                    value={form.unidad_medida}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                />
            </div>

            <div>
                <label className="block font-medium">Stock Mínimo</label>
                <input
                    type="number"
                    name="stock_min"
                    value={form.stock_min}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                    min={0}
                />
            </div>

            <div className="flex space-x-2">
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                    {producto ? 'Actualizar' : 'Crear'}
                </Button>

                {producto && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onSuccess()}
                    >
                        Cancelar
                    </Button>
                )}
            </div>
        </form>
    );
};
