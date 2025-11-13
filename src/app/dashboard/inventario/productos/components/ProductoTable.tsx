"use client";

import React, { useState, useMemo } from "react";
import { Producto } from "../types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react"; // ícono de orden (shadcn usa lucide)

interface Props {
    productos: Producto[];
}

export const ProductoTable: React.FC<Props> = ({ productos }) => {
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<keyof Producto | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // 🔍 Filtrado
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return productos.filter(
            (p) =>
                (p.nombre_prod ?? "").toLowerCase().includes(q) ||
                (p.codigo_producto ?? "").toLowerCase().includes(q) ||
                (p.categoria_prod ?? "").toLowerCase().includes(q)
        );
    }, [search, productos]);

    // ↕️ Ordenamiento
    const sorted = useMemo(() => {
        if (!sortColumn) return filtered;

        return [...filtered].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            // Convertimos valores a string para evitar errores
            const aStr = String(aVal ?? "").toLowerCase();
            const bStr = String(bVal ?? "").toLowerCase();

            if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
            if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }, [filtered, sortColumn, sortOrder]);

    // 📄 Paginación
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginated = sorted.slice(start, end);
    const totalPages = Math.ceil(sorted.length / rowsPerPage);

    // ⚙️ Función para alternar orden
    const handleSort = (column: keyof Producto) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    return (
        <div className="space-y-4 border p-4 rounded">
            {/* 🔍 Filtros superiores */}
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Buscar producto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Ver</span>
                    <Select
                        value={rowsPerPage.toString()}
                        onValueChange={(val) => setRowsPerPage(Number(val))}
                    >
                        <SelectTrigger className="w-auto">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500">por página</span>
                </div>
            </div>

            {/* 🧾 Tabla principal */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[
                                { key: "id_prod", label: "ID" },
                                { key: "fecha_reg", label: "Fecha" },
                                { key: "codigo_producto", label: "Código" },
                                { key: "nombre_prod", label: "Nombre" },
                                { key: "marca_prod", label: "Marca" },
                                { key: "categoria_prod", label: "Categoría" },
                                { key: "nombre_proveedor", label: "Proveedor" },
                                { key: "stock_min", label: "Stock Mínimo" },
                            ].map((col) => (
                                <TableHead
                                    key={col.key}
                                    className="cursor-pointer select-none"
                                    onClick={() => handleSort(col.key as keyof Producto)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        <ArrowUpDown
                                            size={14}
                                            className={`transition-transform ${sortColumn === col.key
                                                    ? sortOrder === "asc"
                                                        ? "rotate-180 text-blue-500"
                                                        : "text-blue-500"
                                                    : "text-gray-400"
                                                }`}
                                        />
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead>Estatus</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginated.length > 0 ? (
                            paginated.map((p) => (
                                <TableRow key={p.id_prod}>
                                    <TableCell>{p.id_prod}</TableCell>
                                    <TableCell>{p.fecha_reg}</TableCell>
                                    <TableCell>{p.codigo_producto}</TableCell>
                                    <TableCell>{p.nombre_prod}</TableCell>
                                    <TableCell>{p.marca_prod}</TableCell>
                                    <TableCell>{p.categoria_prod}</TableCell>
                                    <TableCell>{p.nombre_proveedor}</TableCell>
                                    <TableCell>{p.stock_min}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${p.activo
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {p.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="text-center py-6 text-gray-500"
                                >
                                    No se encontraron productos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 📄 Paginación */}
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                    Mostrando {start + 1} - {Math.min(end, sorted.length)} de{" "}
                    {sorted.length}
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
    );
};
