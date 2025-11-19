"use client";

import React, { useState, useMemo } from "react";
import { Ingreso } from "../types";
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
import { ArrowUpDown } from "lucide-react";

import { QRCreate } from "@/components/ui/common/QRCreate";

interface Props {
    ingresos: Ingreso[];
}

export const IngresoTable: React.FC<Props> = ({ ingresos }) => {
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<keyof Ingreso | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // 🔍 Filtro
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return ingresos.filter(
            (i) =>
                (i.nombre_prod ?? "").toLowerCase().includes(q) ||
                (i.codigo_producto ?? "").toLowerCase().includes(q) ||
                (i.sucursal ?? "").toLowerCase().includes(q) ||
                (i.correo ?? "").toLowerCase().includes(q)
        );
    }, [search, ingresos]);

    // ↕️ Ordenamiento
    const sorted = useMemo(() => {
        if (!sortColumn) return filtered;

        return [...filtered].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

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

    // Alternar orden
    const handleSort = (column: keyof Ingreso) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    return (
        <div className="space-y-4 border p-4 rounded">
            {/* 🔍 Barra superior */}
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Buscar entrada..."
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

            {/* 🧾 Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[
                                { key: "id_entr", label: "ID" },
                                { key: "fecha_ing", label: "Fecha" },
                                { key: "sucursal", label: "Sucursal" },
                                { key: "codigo_producto", label: "Código" },
                                { key: "nombre_prod", label: "Nombre" },
                                { key: "unidad_medida", label: "Unidad" },
                                { key: "cantidad_ingreso", label: "Cantidad" },
                                { key: "fecha_cad", label: "Caducidad" },
                            ].map((col) => (
                                <TableHead
                                    key={col.key}
                                    className="cursor-pointer select-none"
                                    onClick={() => handleSort(col.key as keyof Ingreso)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        <ArrowUpDown
                                            size={14}
                                            className={`transition-transform ${
                                                sortColumn === col.key
                                                    ? "text-blue-500"
                                                    : "text-gray-400"
                                            }`}
                                        />
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead>QR</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginated.length > 0 ? (
                            paginated.map((i) => (
                                <TableRow key={i.id_entr}>
                                    <TableCell>{i.id_entr}</TableCell>
                                    <TableCell>{i.fecha_ing}</TableCell>
                                    <TableCell>{i.sucursal}</TableCell>
                                    <TableCell>{i.codigo_producto}</TableCell>
                                    <TableCell>{i.nombre_prod}</TableCell>
                                    <TableCell>{i.unidad_medida}</TableCell>
                                    <TableCell>{i.cantidad_ingreso}</TableCell>
                                    <TableCell>{i.fecha_cad}</TableCell>
                                    <TableCell>
                                        <QRCreate
                                            codigo={i.codigo_producto}
                                            nombre={i.nombre_prod}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={10}
                                    className="text-center py-6 text-gray-500"
                                >
                                    No se encontraron ingresos.
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
