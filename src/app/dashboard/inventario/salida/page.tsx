"use client";

import { useSalidas } from "./hooks/useSalidas";
import { SalidaForm } from "./components/SalidaForm";
import { SalidaTable } from "./components/SalidaTable"; // opcional

const SalidaPage = () => {
    const { salidas, loading, error, fetchSalidas } = useSalidas();

    if (loading) return <p className="text-center py-4">Cargando salidas...</p>;
    if (error) return <p className="text-center py-4 text-red-500">Error: {error}</p>;

    return (
        <div className="p-4 space-y-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold text-center mb-4">
                Registro de Salidas de Inventario
            </h1>

            <SalidaForm
                onSuccess={() => {
                    fetchSalidas();
                }}
            />

            {/* Tabla solo visible en md+ */}
            <div className="hidden md:block">
                <SalidaTable salidas={salidas} />
            </div>
        </div>
    );
};

export default SalidaPage;
