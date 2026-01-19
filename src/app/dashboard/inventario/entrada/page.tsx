// src/app/dashboard/inventario/entrada/page.tsx
"use client";

import React from "react"; // Ya no se necesita useState
import { useIngresos } from "./hooks/useIngresos";
import { IngresoForm } from "./components/IngresoForm";
import { IngresoTable } from "./components/IngresoTable";

const EntradaPage = () => {
    const { ingresos, loading, error, fetchIngresos } = useIngresos();
    
    if (loading) return <p className="text-center py-4">Cargando ingresos...</p>;
    if (error) return <p className="text-center py-4 text-red-500">Error: {error}</p>;

    return (
        <div className="p-4 space-y-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold text-center mb-4">
                Registro de Entradas al Inventario
            </h1>

            <IngresoForm
                onSuccess={() => {
                    fetchIngresos();
                }}
            />

            {/* Tabla solo visible en md+ */}
            <div className="hidden md:block">
                <IngresoTable 
                    ingresos={ingresos}
                />
            </div>
        </div>
    );
};

export default EntradaPage;