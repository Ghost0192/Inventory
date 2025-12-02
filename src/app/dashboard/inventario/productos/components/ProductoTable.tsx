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
import { ArrowUpDown, QrCode, Search, ChevronLeft, ChevronRight, Edit } from "lucide-react"; // Iconos modernos

import { QRCreate } from "@/components/ui/common/QRCreate";
import clsx from "clsx";

interface Props {
    productos: Producto[];
    // Propiedad para permitir la edición desde la tabla (opcional)
    onEdit?: (producto: Producto) => void;
}

export const ProductoTable: React.FC<Props> = ({ productos, onEdit }) => {
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<keyof Producto | null>("nombre_prod");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Función para formatear fechas
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    });

    // Filtrado
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return productos.filter(
            (p) =>
                (p.nombre_prod ?? "").toLowerCase().includes(q) ||
                (p.codigo_producto ?? "").toLowerCase().includes(q) ||
                (p.categoria_prod ?? "").toLowerCase().includes(q) ||
                (p.marca_prod ?? "").toLowerCase().includes(q)
        );
    }, [search, productos]);

    // Ordenamiento
    const sorted = useMemo(() => {
        if (!sortColumn) return filtered;

        return [...filtered].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            let comparison = 0;

            if (sortColumn === 'stock_min') {
                // Manejo de números
                comparison = (Number(aVal) || 0) - (Number(bVal) || 0);
            } else if (sortColumn === 'fecha_reg') {
                // Manejo de fechas
                const dateA = aVal ? new Date(aVal as string).getTime() : 0;
                const dateB = bVal ? new Date(bVal as string).getTime() : 0;
                comparison = dateA - dateB;
            } else {
                // Ordenamiento de cadenas (default)
                const aStr = String(aVal ?? "").toLowerCase();
                const bStr = String(bVal ?? "").toLowerCase();
                if (aStr < bStr) comparison = -1;
                if (aStr > bStr) comparison = 1;
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });
    }, [filtered, sortColumn, sortOrder]);

    // Paginación
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginated = sorted.slice(start, end);
    const totalPages = Math.ceil(sorted.length / rowsPerPage);

    // Función para alternar orden
    const handleSort = (column: keyof Producto) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
        setPage(1); // Resetear paginación al ordenar
    };

    // Icono de ordenamiento
    const getSortIcon = (key: keyof Producto) => {
        if (sortColumn !== key) return <ArrowUpDown size={14} className="text-gray-400" />;
        
        return (
            <ArrowUpDown 
                size={14} 
                className={clsx("text-indigo-600 transition-transform", sortOrder === "desc" && "rotate-180")}
            />
        );
    }
    
    // Definición de columnas
    const columns: { key: keyof Producto, label: string, className?: string }[] = [
        { key: "codigo_producto", label: "Código", className: "w-[120px]" },
        { key: "nombre_prod", label: "Producto" },
        { key: "categoria_prod", label: "Categoría", className: "hidden sm:table-cell" },
        { key: "marca_prod", label: "Marca", className: "hidden md:table-cell" },
        { key: "stock_min", label: "Stock Mín.", className: "w-[100px] text-center" },
        { key: "fecha_reg", label: "Fecha Reg.", className: "w-[120px] hidden lg:table-cell" },
    ];


    return (
        <div className="space-y-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                Catálogo de Productos ({productos.length})
            </h1>

            {/* 🔍 Filtros superiores (Diseño elegante) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Input de Búsqueda */}
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por código, nombre o categoría..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 bg-gray-50 border-gray-200"
                    />
                </div>

                {/* Selección de Filas por Página */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="hidden sm:inline">Mostrar</span>
                    <Select
                        value={rowsPerPage.toString()}
                        onValueChange={(val) => {
                            setRowsPerPage(Number(val));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-auto bg-gray-50 border-gray-200">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="hidden sm:inline">registros</span>
                </div>
            </div>

            {/*Tabla principal */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                    <TableHeader className="bg-gray-100 sticky top-0">
                        <TableRow className="text-gray-600 uppercase text-xs tracking-wider">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.key as string}
                                    className={`cursor-pointer select-none font-semibold transition-colors hover:bg-gray-200 ${col.className}`}
                                    onClick={() => handleSort(col.key)}
                                >
                                    <div className="flex items-center gap-1 justify-center ${col.className?.includes('text-center') ? 'justify-center' : ''}`}">
                                        {col.label}
                                        {getSortIcon(col.key)}
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="w-auto text-center">Estado</TableHead>
                            <TableHead className="w-[120px] text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginated.length > 0 ? (
                            paginated.map((p) => (
                                <TableRow key={p.id_prod} className="hover:bg-indigo-50/20 transition-colors">
                                    {/* Mapeo de datos */}
                                    <TableCell className="font-mono text-sm text-gray-700">{p.codigo_producto}</TableCell>
                                    <TableCell className="font-medium text-gray-900">{p.nombre_prod}</TableCell>
                                    <TableCell className="text-gray-600 hidden sm:table-cell">{p.categoria_prod}</TableCell>
                                    <TableCell className="text-gray-600 hidden md:table-cell">{p.marca_prod}</TableCell>
                                    <TableCell className="font-bold text-center text-indigo-600">{p.stock_min}</TableCell>
                                    <TableCell className="text-sm text-gray-500 hidden lg:table-cell">{formatDate(p.fecha_reg)}</TableCell>
                                    
                                    {/* Estatus */}
                                    <TableCell className="text-center">
                                        <span
                                            className={clsx("px-2 py-1 rounded-full text-xs font-semibold uppercase", {
                                                "bg-green-100 text-green-700": p.activo,
                                                "bg-red-100 text-red-700": !p.activo,
                                            })}
                                        >
                                            {p.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </TableCell>
                                    
                                    {/* QR y Edición */}
                                    <TableCell className="text-center space-x-2">
                                        {/* Botón de edición */}
                                        {onEdit && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => onEdit(p)}
                                                title="Editar Producto"
                                                className="hover:bg-indigo-100 p-2"
                                            >
                                                <Edit className="w-4 h-4 text-indigo-600" />
                                            </Button>
                                        )}

                                        {/* Componente QR */}
                                        <QRCreate 
                                            codigo={p.codigo_producto ?? ""} 
                                            nombre={p.nombre_prod ?? ""} 
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + 2}
                                    className="text-center py-6 text-gray-500 italic"
                                >
                                    No se encontraron productos en el catálogo.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 📄 Paginación */}
            <div className="flex justify-between items-center pt-4 text-sm text-gray-600">
                <span className="text-sm text-gray-500">
                    Mostrando **{start + 1}** - **{Math.min(end, sorted.length)}** de{" "}
                    **{sorted.length}** registros.
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="hover:bg-indigo-50 border-gray-300 text-gray-700 transition-colors flex items-center"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="hover:bg-indigo-50 border-gray-300 text-gray-700 transition-colors flex items-center"
                    >
                        Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
};