"use client";

import React, { useState } from "react";
import { useIngresos } from "./hooks/useIngresos";
import { IngresoForm } from "./components/IngresoForm";
import { IngresoTable } from "./components/IngresoTable"; // tabla opcional
import { Ingreso } from "./types";

const EntradaPage = () => {
    const { ingresos, loading, error, fetchIngresos } = useIngresos();
    const [selectedIngreso, setSelectedIngreso] = useState<Ingreso | null>(null);

    if (loading) return <p className="text-center py-4">Cargando ingresos...</p>;
    if (error) return <p className="text-center py-4 text-red-500">Error: {error}</p>;

    return (
        <div className="p-4 space-y-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold text-center mb-4">
                Registro de Entradas al Inventario
            </h1>

            <IngresoForm
                ingreso={selectedIngreso || undefined}
                onSuccess={() => {
                    fetchIngresos();
                    setSelectedIngreso(null);
                }}
            />

            {/* Tabla solo visible en md+ */}
            <div className="hidden md:block">
                <IngresoTable ingresos={ingresos} />
            </div>
        </div>
    );
};

export default EntradaPage;
