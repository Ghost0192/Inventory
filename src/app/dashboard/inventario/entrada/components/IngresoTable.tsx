//src/app/dashboard/inventario/entrada/components/IngresoTable.tsx
"use client";

import React, { useState, useMemo } from "react";
// CORRECCIÓN 1: Eliminamos la importación de IngresoEdit y formatDateToInput ya que no se usan
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
import { ArrowUpDown, Edit2 } from "lucide-react";

interface Props {
    ingresos: Ingreso[];
    onEditSelect: (ingreso: Ingreso) => void; 
}

// CORRECCIÓN 2: Eliminamos la función formatDateToInput ya que no se utiliza
/* const formatDateToInput = (dateStr: string | null): string => { 
    // ...
};
*/

export const IngresoTable: React.FC<Props> = ({ ingresos, onEditSelect }) => {
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<keyof Ingreso | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Filtro
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

    // Ordenamiento
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

    // Paginación
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginated = sorted.slice(start, end);
    const totalPages = Math.ceil(sorted.length / rowsPerPage);

    // Columnas de la tabla
    const tableColumns = [
        { key: "fecha_ing", label: "Fecha registro" },
        { key: "sucursal", label: "Sucursal" },
        { key: "bodega", label: "Bodega" },
        { key: "codigo_producto", label: "Código" },
        { key: "nombre_prod", label: "Nombre" },
        { key: "descripcion_prod", label: "Descripción Producto" },
        { key: "unidad_medida", label: "Unidad" },
        { key: "cantidad_ingreso", label: "Cantidad" },
        { key: "marca", label: "Marca" },
        { key: "origen_prod", label: "Origen" },
        { key: "nombre_proveedor", label: "Nombre Proveedor" },
        { key: "fecha_cad", label: "Fecha Caducidad" },
        { key: "editar", label: "Editar" },
    ];
    const totalColumns = tableColumns.length;

    // Alternar orden
    const handleSort = (column: keyof Ingreso) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    // Función que notifica al padre para cargar el formulario de edición
    const handleEdit = (ingreso: Ingreso) => {
        onEditSelect(ingreso); 
    };

    // Formatear fecha (DD/MM/YYYY) para la visualización en la tabla
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "-";
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
    };

    return (
        <div className="space-y-4 border p-4 rounded">
            <h1 className="text-2xl font-bold text-start mb-4">Tabla de Entradas al Inventario</h1>

            {/* Barra superior */}
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Buscar entrada..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Ver</span>
                    <Select value={rowsPerPage.toString()} onValueChange={(val) => {
                        setRowsPerPage(Number(val));
                        setPage(1);
                    }}>
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

            {/* Tabla con scroll horizontal */}
            <div className="overflow-x-auto rounded-md border">
                <Table className="min-w-[1200px]"> 
                    <TableHeader>
                        <TableRow>
                            {tableColumns.map((col) => (
                                <TableHead
                                    key={col.key}
                                    className="cursor-pointer select-none"
                                    onClick={() => col.key !== "editar" && handleSort(col.key as keyof Ingreso)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.key !== "editar" && (
                                            <ArrowUpDown
                                                size={14}
                                                className={`transition-transform ${sortColumn === col.key ? "text-blue-500" : "text-gray-400"}`}
                                            />
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginated.length > 0 ? (
                            paginated.map((i) => (
                                <TableRow key={i.id_entr}>
                                    <TableCell className="w-24 truncate">{formatDate(i.fecha_ing)}</TableCell>
                                    <TableCell className="w-24 truncate">{i.sucursal}</TableCell>
                                    <TableCell className="w-24 truncate">{i.bodega}</TableCell>
                                    <TableCell className="w-24 truncate">{i.codigo_producto}</TableCell>
                                    <TableCell className="w-32 truncate">{i.nombre_prod}</TableCell>
                                    <TableCell className="w-40 truncate max-w-36">{i.descripcion_prod}</TableCell>
                                    <TableCell className="w-24 truncate">{i.unidad_medida}</TableCell>
                                    <TableCell className="w-24 truncate">{i.cantidad_ingreso}</TableCell>
                                    <TableCell className="w-32 truncate">{i.marca}</TableCell>
                                    <TableCell className="w-32 truncate">{i.origen_prod}</TableCell>
                                    <TableCell className="w-36 truncate">{i.nombre_proveedor}</TableCell>
                                    <TableCell className="w-24 truncate">{formatDate(i.fecha_cad)}</TableCell>
                                    <TableCell className="w-20">
                                        <Button size="icon" variant="outline" onClick={() => handleEdit(i)}>
                                            <Edit2 size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={totalColumns} className="text-center py-6 text-gray-500">
                                    No se encontraron ingresos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                    Mostrando {start + 1} - {Math.min(end, sorted.length)} de {sorted.length}
                </span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                        Anterior
                    </Button>
                    <Button variant="outline" size="sm" disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => p + 1)}>
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
    );
};