import React, { useState, useEffect } from 'react';
import { Producto } from '../types';
import { supabase } from '@/lib/supabaseClient';

interface Props {
    producto?: Producto; // Si viene, será edición
    onSuccess: () => void; // Callback para refrescar la lista
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

    // Si viene un producto, llenar el form
    useEffect(() => {
        if (producto) setForm(producto);
    }, [producto]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (producto) {
                // Editar producto
                const { error } = await supabase
                    .from('a_productos')
                    .update(form)
                    .eq('id_prod', producto.id_prod);

                if (error) throw error;
            } else {
                // Crear producto
                const { error } = await supabase
                    .from('a_productos')
                    .insert(form);

                if (error) throw error;
            }

            onSuccess(); // refrescar la lista
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

            <div>
                <label className="block font-medium">Código</label>
                <input
                    type="text"
                    name="codigo_producto"
                    value={form.codigo_producto}
                    onChange={handleChange}
                    required
                    className="border p-2 w-full"
                />
            </div>

            <div>
                <label className="block font-medium">Nombre</label>
                <input
                    type="text"
                    name="nombre_prod"
                    value={form.nombre_prod}
                    onChange={handleChange}
                    required
                    className="border p-2 w-full"
                />
            </div>

            <div>
                <label className="block font-medium">Categoría</label>
                <input
                    type="text"
                    name="categoria_prod"
                    value={form.categoria_prod}
                    onChange={handleChange}
                    className="border p-2 w-full"
                />
            </div>

            <div>
                <label className="block font-medium">Unidad de Medida</label>
                <input
                    type="text"
                    name="unidad_medida"
                    value={form.unidad_medida}
                    onChange={handleChange}
                    className="border p-2 w-full"
                />
            </div>

            <div>
                <label className="block font-medium">Stock Mínimo</label>
                <input
                    type="number"
                    name="stock_min"
                    value={form.stock_min}
                    onChange={handleChange}
                    className="border p-2 w-full"
                    min={0}
                />
            </div>

            <div className="flex space-x-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    {producto ? 'Actualizar' : 'Crear'}
                </button>
                {producto && (
                    <button
                        type="button"
                        onClick={() => onSuccess()}
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
};
