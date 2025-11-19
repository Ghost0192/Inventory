"use client";

import React, { useState } from "react";
import { useIngresos } from "./hooks/useIngresos";
import { IngresoForm } from "./components/IngresoForm";
import { IngresoTable } from "./components/IngresoTable"; // opcional
import { Ingreso } from "./types";

const EntradaPage = () => {
    const { ingresos, loading, error, fetchIngresos } = useIngresos();
    const [selectedIngreso, setSelectedIngreso] = useState<Ingreso | null>(null);

    if (loading) return <p>Cargando ingresos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="p-4 space-y-6 bg-white rounded-lg shadow">

            <h1 className="text-2xl font-bold mb-4">
                Registro de Entradas al Inventario
            </h1>

            <IngresoForm
                ingreso={selectedIngreso || undefined}
                onSuccess={() => {
                    fetchIngresos();
                    setSelectedIngreso(null);
                }}
            />

            <div className="hidden md:block">
                <IngresoTable ingresos={ingresos} />
            </div>

        </div>
    );
};

export default EntradaPage;
