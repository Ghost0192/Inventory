"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function StockCards() {
    const [totales, setTotales] = useState({
        productos: 0,
        sinStock: 0,
        bajoStock: 0,
        suficiente: 0,
    });
    
    const [fechaUltimoRegistro, setFechaUltimoRegistro] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("v_stock_disponible")
                .select("*");

            if (error) return;

            const productos = data.length;
            const sinStock = data.filter(p => p.stock_disponible <= 0).length;
            const bajoStock = data.filter(p => p.stock_disponible > 0 && p.stock_disponible <= p.stock_min).length;
            const suficiente = data.filter(p => p.stock_disponible > p.stock_min).length;

            setTotales({ productos, sinStock, bajoStock, suficiente });

            // Obtener la fecha del último registro
            const ultimoRegistro = data[data.length - 1]?.fecha_registro || ""; // Asegúrate de que 'fecha_registro' sea el nombre de la columna correcta
            setFechaUltimoRegistro(ultimoRegistro);
        };

        fetchData();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
                <CardHeader>
                    <CardTitle>Total Productos</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{totales.productos}</p>
                    <p className="text-sm text-gray-500">Última actualización: {fechaUltimoRegistro}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sin Stock</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-red-600">{totales.sinStock}</p>
                    <p className="text-sm text-gray-500">Última actualización: {fechaUltimoRegistro}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bajo Stock</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-yellow-600">{totales.bajoStock}</p>
                    <p className="text-sm text-gray-500">Última actualización: {fechaUltimoRegistro}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Stock Suficiente</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold text-green-600">{totales.suficiente}</p>
                    <p className="text-sm text-gray-500">Última actualización: {fechaUltimoRegistro}</p>
                </CardContent>
            </Card>
        </div>
    );
}
