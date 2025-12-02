//src/app/dashboard/components/views/adminviews/DashboardCharts.tsx
"use client";

import React from "react";

const DashboardCharts = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg shadow-sm">
                <h2 className="font-semibold mb-2">Ingresos vs Salidas</h2>
                {/* AQUÍ VA TU GRÁFICA */}
            </div>

            <div className="p-4 border rounded-lg shadow-sm">
                <h2 className="font-semibold mb-2">Stock por Categorías</h2>
                {/* OTRA GRÁFICA */}
            </div>
        </div>
    );
};

export default DashboardCharts;
