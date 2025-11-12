import React from 'react';
import { Producto } from '../types';

interface Props {
    productos: Producto[];
}

export const ProductoTable: React.FC<Props> = ({ productos }) => {
    return (
        <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
                <tr>
                    <th className="p-2 border">Código</th>
                    <th className="p-2 border">Nombre</th>
                    <th className="p-2 border">Categoría</th>
                    <th className="p-2 border">Unidad</th>
                    <th className="p-2 border">Stock Mínimo</th>
                </tr>
            </thead>
            <tbody>
                {productos.map((p) => (
                    <tr key={p.id_prod} className="hover:bg-gray-50">
                        <td className="p-2 border">{p.codigo_producto}</td>
                        <td className="p-2 border">{p.nombre_prod}</td>
                        <td className="p-2 border">{p.categoria_prod}</td>
                        <td className="p-2 border">{p.unidad_medida}</td>
                        <td className="p-2 border">{p.stock_min}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
