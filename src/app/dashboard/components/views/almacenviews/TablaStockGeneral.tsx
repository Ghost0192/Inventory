//src/app/dashboard/components/views/almacenviews/TablaStockGeneral.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StockGeneral } from "../adminviews/types/types";

import * as XLSX from "xlsx";
import clsx from "clsx";

export default function TablaStockGeneral() {
    const [items, setItems] = useState<StockGeneral[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    // PAGINACIÓN
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const loadStock = async () => {
            const { data, error } = await supabase
                .from("v_stock_disponible")
                .select("*");

            if (error) {
                console.error("Error al cargar datos:", error);
                setLoading(false);
                return;
            }

            setItems(data ?? []);
            setLoading(false);
        };

        loadStock();
    }, []);

    // BUSCADOR
    const filtered = useMemo(() => {
        return items.filter((item) => {
            const q = query.toLowerCase();
            return (
                item.codigo_producto.toLowerCase().includes(q) ||
                item.nombre_prod.toLowerCase().includes(q)
            );
        });
    }, [items, query]);

    // PAGINACIÓN FINAL
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // COLORES SEGÚN ESTADO
    const getRowColor = (estado: string) =>
        clsx({
            "bg-red-100 text-red-700": estado === "CRITICO",
            "bg-yellow-100 text-yellow-700": estado === "BAJO",
            "bg-green-100 text-green-700": estado === "NORMAL",
        });

    // EXPORTAR A EXCEL
    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(items);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventario");
        XLSX.writeFile(wb, "inventario_general.xlsx");
    };

    return (
        <div className="p-4 space-y-6 bg-white rounded-lg border-2">

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Inventario General</h2>

                <Button onClick={exportToExcel}>
                    Exportar Excel
                </Button>
            </div>

            {/* BUSCADOR */}
            <Input
                placeholder="Buscar por código o producto..."
                value={query}
                onChange={(e) => {
                    setPage(1);
                    setQuery(e.target.value);
                }}
                className="max-w-xs"
            />

            {/* TABLA */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Ingresos</TableHead>
                        <TableHead>Salidas</TableHead>
                        <TableHead>Disponible</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {loading && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-3">
                                Cargando inventario...
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading && paginated.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-3 text-gray-500">
                                No se encontraron resultados.
                            </TableCell>
                        </TableRow>
                    )}

                    {!loading &&
                        paginated.map((item) => (
                            <TableRow key={item.codigo_producto} className={getRowColor(item.estado_stock)}>
                                <TableCell>{item.codigo_producto}</TableCell>
                                <TableCell>{item.nombre_prod}</TableCell>
                                <TableCell>{item.total_ingresos}</TableCell>
                                <TableCell>{item.total_salidas}</TableCell>
                                <TableCell>{item.stock_disponible}</TableCell>
                                <TableCell className="font-bold">{item.estado_stock}</TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>

            {/* PAGINACIÓN */}
            <div className="flex justify-between items-center pt-2">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    Anterior
                </Button>

                <p>
                    Página {page} de {totalPages}
                </p>

                <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
