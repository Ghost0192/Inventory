"use client";

import React from "react";

// MÓDULOS DEL DASHBOARD
import DashboardHeader from "./adminviews/DashboardHeader";
import DashboardCards from "./adminviews/DashboardCards";
import DashboardCharts from "./adminviews/DashboardCharts";
import StockCards from "./adminviews/StockCards";
import TablaStockGeneral from "./adminviews/TablaStockGeneral";

const AdminView = () => {
    return (
        <div className="space-y-6 bg-white p-6 rounded-lg">

            {/* HEADER DEL PANEL */}
            <DashboardHeader />

            {/* CARDS RESUMEN */}
            <DashboardCards />

            {/* TABLA DE STOCK GENERAL */}
            <TablaStockGeneral />

            {/* TABLA DE PRODUCTOS CON STOCK BAJO */}
            <StockCards />

            {/* GRÁFICAS */}
            <DashboardCharts />

        </div>
    );
};

export default AdminView;
