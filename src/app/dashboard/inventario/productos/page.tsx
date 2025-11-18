"use client";

import React, { useState } from 'react';
import { useProductos } from './hooks/useProductos';
import { ProductoTable } from './components/ProductoTable';
import { ProductoForm } from './components/ProductoForm';
import { Producto } from './types';

const ProductosPage = () => {
    const { productos, loading, error, fetchProductos } = useProductos();
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

    if (loading) return <p>Cargando productos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="p-4 space-y-6 bg-white rounded-lg shadow">

            <h1 className="text-2xl font-bold mb-4">
                Administrar Productos
            </h1>

            {/* 🟢 Siempre visible (móvil y desktop) */}
            <ProductoForm
                producto={selectedProducto || undefined}
                onSuccess={() => {
                    fetchProductos();
                    setSelectedProducto(null);
                }}
            />

            {/* 🔵 Ocultar tabla en móvil
                (hidden en móviles, aparece desde md hacia arriba)
            */}
            <div className="hidden md:block">
                <ProductoTable productos={productos} />
            </div>

        </div>
    );
};

export default ProductosPage;
