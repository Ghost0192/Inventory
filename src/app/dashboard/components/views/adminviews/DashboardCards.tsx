//src/app/dashboard/components/views/adminviews/DashboardCards.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Users, Box, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Clock } from "lucide-react";
import Link from "next/link"; // Importamos Link de Next.js para la navegación

// Definiciones de tipos para claridad
interface Stats {
    productos: number;
    ingresos: number;
    salidas: number;
    usuarios: number;
}

// Datos de simulación para las "tendencias" y el color del ícono (Nuevo)
interface CardStyle {
    key: keyof Stats;
    label: string;
    icon: React.ReactNode;
    iconColor: string; // Ejemplo: 'text-indigo-500'
    bgColor: string;   // Ejemplo: 'from-indigo-100/50 to-white'
    trendValue: string; // Simulación del porcentaje de tendencia
    trendType: 'up' | 'down';
    link: string;  // Nueva propiedad para el enlace
}

const cardStyles: CardStyle[] = [
    {
        key: "productos",
        label: "Productos Totales",
        icon: <Box className="w-6 h-6" />,
        iconColor: "text-purple-600",
        bgColor: "bg-gradient-to-br from-purple-50/70 to-white dark:from-gray-800/70 dark:to-gray-900",
        trendValue: "45%",
        trendType: 'down',
        link: "/dashboard/adminviews/productos"  // Ruta de productos
    },
    {
        key: "ingresos",
        label: "Entradas de Stock",
        icon: <ArrowUp className="w-6 h-6" />,
        iconColor: "text-cyan-600",
        bgColor: "bg-gradient-to-br from-cyan-50/70 to-white dark:from-gray-800/70 dark:to-gray-900",
        trendValue: "25%",
        trendType: 'up',
        link: "/dashboard/inventario/entrada"  // Ruta de ingresos
    },
    {
        key: "salidas",
        label: "Salidas de Stock",
        icon: <ArrowDown className="w-6 h-6" />,
        iconColor: "text-pink-600",
        bgColor: "bg-gradient-to-br from-pink-50/70 to-white dark:from-gray-800/70 dark:to-gray-900",
        trendValue: "45%",
        trendType: 'down',
        link: "/dashboard/inventario/salida"  // Ruta de salidas
    },
    {
        key: "usuarios",
        label: "Usuarios Registrados",
        icon: <Users className="w-6 h-6" />,
        iconColor: "text-green-600",
        bgColor: "bg-gradient-to-br from-green-50/70 to-white dark:from-gray-800/70 dark:to-gray-900",
        trendValue: "25%",
        trendType: 'up',
        link: "/dashboard/usuarios"  // Ruta de usuarios
    },
];

const DashboardCards = () => {
    const [stats, setStats] = useState<Stats>({
        productos: 0,
        ingresos: 0,
        salidas: 0,
        usuarios: 0,
    });

    const [dates, setDates] = useState({
        productos: "N/A",
        ingresos: "N/A",
        salidas: "N/A",
        usuarios: "N/A",
    });

    // Función para formatear la fecha en formato DD/MM/YYYY
    const formatDate = (date: string | null | undefined): string => {
        if (!date || date === "No disponible") {
            return "N/A";
        }
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) {
                return "N/A";
            }
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return "N/A"; // No necesitas usar la variable 'error'
        }
    };

    const fetchStats = async () => {
        // Optimización de llamadas con Promise.all
        const [{ count: productos }, { count: ingresos }, { count: salidas }, { count: usuarios }] = await Promise.all([
            supabase.from("a_productos").select("*", { count: "exact", head: true }),
            supabase.from("a_ingresos").select("*", { count: "exact", head: true }),
            supabase.from("a_salidas").select("*", { count: "exact", head: true }),
            supabase.from("a_usuarios").select("*", { count: "exact", head: true }),
        ]);

        const [productosData, ingresosData, salidasData, usuariosData] = await Promise.all([
            supabase.from("a_productos").select("fecha_reg").order("fecha_reg", { ascending: false }).limit(1),
            supabase.from("a_ingresos").select("fecha_ing").order("fecha_ing", { ascending: false }).limit(1),
            supabase.from("a_salidas").select("fecha_salida").order("fecha_salida", { ascending: false }).limit(1),
            supabase.from("a_usuarios").select("creado_en").order("creado_en", { ascending: false }).limit(1),
        ]);

        setDates({
            productos: formatDate(productosData.data?.[0]?.fecha_reg),
            ingresos: formatDate(ingresosData.data?.[0]?.fecha_ing),
            salidas: formatDate(salidasData.data?.[0]?.fecha_salida),
            usuarios: formatDate(usuariosData.data?.[0]?.creado_en),
        });

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

    // Componente para el círculo de color (simula el degradado circular)
    const IconCircle = ({ icon, color }: { icon: React.ReactNode, color: string }) => (
        <div className={`p-3 rounded-full shadow-lg ${color} bg-opacity-10 backdrop-blur-sm`}>
            {icon}
        </div>
    );

    // Componente para la tendencia
    const TrendPill = ({ trendType, trendValue }: { trendType: 'up' | 'down', trendValue: string }) => {
        const isUp = trendType === 'up';
        const trendClass = isUp ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600";
        const Icon = isUp ? TrendingUp : TrendingDown;

        return (
            <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trendClass} dark:bg-opacity-20`}>
                <Icon className="w-6 h-6 mr-1" />
                {trendValue}
            </div>
        );
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cardStyles.map((style) => (
                <Link key={style.key} href={style.link} passHref>
                    <Card
                        className={`p-0 overflow-hidden border-none shadow-xl ${style.bgColor} transition-transform duration-300 hover:scale-[1.02]`}
                        style={{ borderRadius: '1.25rem' }} // Bordes más redondeados
                    >
                        <div className="flex flex-col h-full justify-between">
                            <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
                                {/* Círculo con Icono */}
                                <IconCircle icon={style.icon} color={style.iconColor} />
                                {/* Píldora de Tendencia */}
                                <TrendPill trendType={style.trendType} trendValue={style.trendValue} />
                            </CardHeader>

                            <CardContent className="flex flex-col justify-center items-center p-4 pt-2">
                                <div className="text-8xl font-bold tracking-tight text-gray-800 dark:text-white">
                                    {/* Valor Principal (ej. 20K, 145K) */}
                                    {stats[style.key].toLocaleString()}
                                </div>
                                <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
                                    {style.label}
                                </CardTitle>
                            </CardContent>
                        </div>

                        {/* Simulación del Sparkline y Fecha */}
                        <CardFooter className="flex flex-col items-start p-4 pt-0">
                            {/* Simulación Gráfico de Puntos (Sparkline) */}
                            <div className="flex space-x-1 mb-2">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1 h-${Math.ceil(Math.random() * 6) + 2} rounded-full opacity-60`}
                                        // Usamos el color del ícono para los puntos
                                        style={{ backgroundColor: style.iconColor.split('-')[1] }}
                                    />
                                ))}
                            </div>
                            {/* Información de Última Actualización */}
                            <div className="flex items-center text-xs text-muted-foreground gap-3">
                                <Clock className="w-6 h-6 mr-1" />
                                <span>Última actualización:  {dates[style.key]}</span>
                            </div>
                        </CardFooter>
                    </Card>
                </Link>
            ))}
        </div>
    );
};

export default DashboardCards;
