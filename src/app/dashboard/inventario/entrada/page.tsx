// src/app/dashboard/inventario/entrada/page.tsx
"use client";

import React, { useState } from "react";
import { useIngresos } from "./hooks/useIngresos";
import { IngresoForm } from "./components/IngresoForm";
import { IngresoTable } from "./components/IngresoTable";
import { Ingreso } from "./types";

const EntradaPage = () => {
    // Asumimos que useIngresos devuelve Ingreso[] (que ya corregimos para ser completo)
    const { ingresos, loading, error, fetchIngresos } = useIngresos();
    const [selectedIngreso, setSelectedIngreso] = useState<Ingreso | null>(null);

    // Función para manejar la selección de un ingreso desde la tabla
    const handleEditSelection = (ingreso: Ingreso) => {
        setSelectedIngreso(ingreso);
        // Opcional: Desplazarse al formulario al seleccionar
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    if (loading) return <p className="text-center py-4">Cargando ingresos...</p>;
    if (error) return <p className="text-center py-4 text-red-500">Error: {error}</p>;

    return (
        <div className="p-4 space-y-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold text-center mb-4">
                Registro de Entradas al Inventario
            </h1>

            <IngresoForm
                // Ahora es válido porque IngresoForm aceptará esta prop
                ingreso={selectedIngreso || undefined}
                onSuccess={() => {
                    fetchIngresos();
                    setSelectedIngreso(null); // Limpiar la selección después de guardar
                }}
            />

            {/* Tabla solo visible en md+ */}
            <div className="hidden md:block">
                <IngresoTable 
                    ingresos={ingresos}
                    onEditSelect={handleEditSelection}
                />
            </div>
        </div>
    );
};

export default EntradaPage;