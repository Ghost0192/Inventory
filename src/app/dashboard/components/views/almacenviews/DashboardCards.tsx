//src/app/dashboard/components/views/adminviews/DashboardCards.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Users, Box, ArrowUp, ArrowDown } from "lucide-react"; // Lucide Icons

const DashboardCards = () => {
    const [stats, setStats] = useState({
        productos: 0,
        ingresos: 0,
        salidas: 0,
        usuarios: 0,
    });

    const fetchStats = async () => {
        const { count: productos } = await supabase
            .from("a_productos")
            .select("*", { count: "exact", head: true });

        const { count: ingresos } = await supabase
            .from("a_ingresos")
            .select("*", { count: "exact", head: true });

        const { count: salidas } = await supabase
            .from("a_salidas")
            .select("*", { count: "exact", head: true });

        const { count: usuarios } = await supabase
            .from("a_usuarios")
            .select("*", { count: "exact", head: true });

        setStats({
            productos: productos ?? 0,
            ingresos: ingresos ?? 0,
            salidas: salidas ?? 0,
            usuarios: usuarios ?? 0,
        });
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const cardData: { key: string; label: string; value: number; icon: React.ReactNode; color: string }[] = [
        { key: "productos", label: "Productos", value: stats.productos, icon: <Box className="w-8 h-8 text-white" />, color: "bg-blue-500" },
        { key: "ingresos", label: "Ingresos", value: stats.ingresos, icon: <ArrowUp className="w-8 h-8 text-white" />, color: "bg-green-500" },
        { key: "salidas", label: "Salidas", value: stats.salidas, icon: <ArrowDown className="w-8 h-8 text-white" />, color: "bg-red-500" },
        { key: "usuarios", label: "Usuarios", value: stats.usuarios, icon: <Users className="w-8 h-8 text-white" />, color: "bg-yellow-500" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cardData.map((card) => (
                <Card key={card.key} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${card.color}`}>{card.icon}</div>
                        <CardTitle className="text-lg font-semibold">{card.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold mt-2">{card.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default DashboardCards;
