"use client";

import React, { useState, useMemo } from "react";
import { Salida } from "../types"; // Define el tipo Salida similar a Ingreso
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { QRCreate } from "@/components/ui/common/QRCreate";

interface Props {
    salidas: Salida[];
}

export const SalidaTable: React.FC<Props> = ({ salidas }) => {
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<keyof Salida | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return salidas.filter(
            (s) =>
                (s.nombre_prod ?? "").toLowerCase().includes(q) ||
                (s.codigo_producto ?? "").toLowerCase().includes(q) ||
                (s.sucursal ?? "").toLowerCase().includes(q) ||
                (s.correo ?? "").toLowerCase().includes(q)
        );
    }, [search, salidas]);

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

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginated = sorted.slice(start, end);
    const totalPages = Math.ceil(sorted.length / rowsPerPage);

    const handleSort = (column: keyof Salida) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    return (
        <div className="space-y-4 border p-4 rounded">
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Buscar salida..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Ver</span>
                    <Select value={rowsPerPage.toString()} onValueChange={(val) => setRowsPerPage(Number(val))}>
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

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[
                                { key: "id_salida", label: "ID" },
                                { key: "fecha_salida", label: "Fecha" },
                                { key: "sucursal", label: "Sucursal" },
                                { key: "codigo_producto", label: "Código" },
                                { key: "nombre_prod", label: "Nombre" },
                                { key: "unidad_medida", label: "Unidad" },
                                { key: "cantidad_salida", label: "Cantidad" },
                                { key: "nota", label: "Nota" },
                            ].map((col) => (
                                <TableHead key={col.key} className="cursor-pointer select-none" onClick={() => handleSort(col.key as keyof Salida)}>
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        <ArrowUpDown size={14} className={`transition-transform ${sortColumn === col.key ? "text-blue-500" : "text-gray-400"}`} />
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead>QR</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginated.length > 0 ? (
                            paginated.map((s) => (
                                <TableRow key={s.id_salida}>
                                    <TableCell>{s.id_salida}</TableCell>
                                    <TableCell>{s.fecha_salida}</TableCell>
                                    <TableCell>{s.sucursal}</TableCell>
                                    <TableCell>{s.codigo_producto}</TableCell>
                                    <TableCell>{s.nombre_prod}</TableCell>
                                    <TableCell>{s.unidad_medida}</TableCell>
                                    <TableCell>{s.cantidad_salida}</TableCell>
                                    <TableCell>{s.nota}</TableCell>
                                    <TableCell>
                                        <QRCreate codigo={s.codigo_producto ?? ""} nombre={s.nombre_prod ?? ""} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center py-6 text-gray-500">
                                    No se encontraron salidas.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                    Mostrando {start + 1} - {Math.min(end, sorted.length)} de {sorted.length}
                </span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
                </div>
            </div>
        </div>
    );
};
