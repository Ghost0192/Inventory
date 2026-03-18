// src/app/dashboard/inventario/entrada/components/IngresoTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Ingreso } from "../types";
import { formatDateToInput, formatDateForDisplay } from "@/lib/utils";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

interface Props {
    ingresos: Ingreso[];
}

export const IngresoTable: React.FC<Props> = ({ ingresos }) => {
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<keyof Ingreso | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [loadingSave, setLoadingSave] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [openModal, setOpenModal] = useState(false);
    const [selectedIngreso, setSelectedIngreso] = useState<Ingreso | null>(null);

    const [editForm, setEditForm] = useState({
        nombre_prod: "",
        descripcion_prod: "",
        cantidad_ingreso: 0,
        marca: "",
        origen_prod: "",
        nombre_proveedor: "",
        fecha_cad: "",
    });

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

    // Columnas de la tabla con el encabezado de "Descripción de producto"
    const tableColumns = [
        { key: "fecha_ing", label: "Fecha registro"},
        { key: "sucursal", label: "Sucursal" },
        { key: "bodega", label: "Bodega" },
        { key: "codigo_producto", label: "Código" },
        { key: "nombre_prod", label: "Nombre" },
        { key: "descripcion_prod", label: "Descripción Producto" }, // Encabezado corregido
        { key: "unidad_medida", label: "Unidad" },
        { key: "cantidad_ingreso", label: "Cantidad" },
        { key: "marca", label: "Marca" },
        { key: "origen_prod", label: "Origen" },
        { key: "nombre_proveedor", label: "Proveedor" },
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

    // CORRECCIÓN: Abrir Modal de edición
    const handleEdit = (ingreso: Ingreso) => {
        setSelectedIngreso(ingreso);
        setSaveError(null); // Clear error from previous attempt

        // Inicializar editForm con los datos del ingreso
        setEditForm({
            nombre_prod: ingreso.nombre_prod ?? "",
            descripcion_prod: ingreso.descripcion_prod ?? "",
            cantidad_ingreso: ingreso.cantidad_ingreso ?? 0,
            marca: ingreso.marca ?? "",
            origen_prod: ingreso.origen_prod ?? "",
            nombre_proveedor: ingreso.nombre_proveedor ?? "",
            fecha_cad: formatDateToInput(ingreso.fecha_cad),
        });
        setOpenModal(true);
    };

    // CORRECCIÓN: Lógica para Guardar cambios (Update a Supabase)
    const handleSave = async () => {
        if (!selectedIngreso) {
            setSaveError("No hay un ingreso seleccionado.");
            return;
        }

        // Validación: nombre_prod es requerido
        if (!editForm.nombre_prod?.trim()) {
            setSaveError("El nombre del producto es requerido.");
            return;
        }

        // Validación: cantidad_ingreso debe ser válida y > 0
        const quantity = Number(editForm.cantidad_ingreso);
        if (isNaN(quantity) || quantity < 0.01) {
            setSaveError("La cantidad debe ser un número mayor a 0.");
            return;
        }

        setLoadingSave(true);
        setSaveError(null);

        // Crear payload solo con los campos editables
        const payload = {
            nombre_prod: editForm.nombre_prod?.toUpperCase() || null,
            descripcion_prod: editForm.descripcion_prod?.toUpperCase() || null,
            cantidad_ingreso: Number(editForm.cantidad_ingreso),
            marca: editForm.marca?.toUpperCase() || null,
            origen_prod: editForm.origen_prod?.toUpperCase() || null,
            nombre_proveedor: editForm.nombre_proveedor?.toUpperCase() || null,
            fecha_cad: editForm.fecha_cad || null,
        };

        try {
            const { error } = await supabase.from("a_ingresos")
                .update(payload)
                .eq('id_entr', selectedIngreso.id_entr);

            if (error) throw error;
            // Cerrar modal al guardar exitosamente
            setOpenModal(false);
            setSaveError(null);

        } catch (error) {
            const message = error instanceof Error ? error.message : "Error al guardar los cambios.";
            console.error("Error al actualizar el ingreso:", message);
            setSaveError(message);
        } finally {
            setLoadingSave(false);
        }
    };

    // Formatear fecha (DD/MM/YYYY) para la visualización en la tabla
    const formatDate = (dateStr: string | null) => formatDateForDisplay(dateStr);

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
                <Table className="min-w-4xl"> 
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

                    <TableBody className="text-xs">
                        {paginated.length > 0 ? (
                            paginated.map((i) => (
                                <TableRow key={i.id_entr}>
                                    <TableCell className="w-24 truncate">{formatDate(i.fecha_ing)}</TableCell>
                                    <TableCell className="w-24 truncate">{i.sucursal}</TableCell>
                                    <TableCell className="w-24 truncate">{i.bodega}</TableCell>
                                    <TableCell className="w-24 truncate">{i.codigo_producto}</TableCell>
                                    <TableCell className="w-40 truncate max-w-48">{i.nombre_prod}</TableCell>
                                    <TableCell className="w-40 truncate max-w-48">{i.descripcion_prod}</TableCell>
                                    <TableCell className="w-24 truncate">{i.unidad_medida}</TableCell>
                                    <TableCell className="w-24 truncate">{i.cantidad_ingreso}</TableCell>
                                    <TableCell className="w-32 truncate">{i.marca}</TableCell>
                                    <TableCell className="w-32 truncate">{i.origen_prod}</TableCell>
                                    <TableCell className="w-36 truncate">{i.nombre_proveedor}</TableCell>
                                    <TableCell className="w-24 truncate">{formatDate(i.fecha_cad)}</TableCell>
                                    <TableCell className="w-20">
                                        {/* Botón de editar (activa el modal local) */}
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

            {/* Modal de edición (Reincorporado) */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar Ingreso: {selectedIngreso?.codigo_producto}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        {/* Campo Nombre Producto */}
                        <div className="flex flex-col">
                            <Label className="text-sm font-medium text-gray-700 mb-1">Nombre Producto</Label>
                            <Input
                                placeholder="Nombre producto"
                                value={editForm.nombre_prod}
                                onChange={(e) => setEditForm({ ...editForm, nombre_prod: e.target.value })}
                            />
                        </div>

                        {/* Campo Descripción */}
                        <div className="flex flex-col">
                            <Label className="text-sm font-medium text-gray-700 mb-1">Descripción</Label>
                            <Input
                                placeholder="Descripción"
                                value={editForm.descripcion_prod}
                                onChange={(e) => setEditForm({ ...editForm, descripcion_prod: e.target.value })}
                            />
                        </div>

                        {/* Campo Cantidad */}
                        <div className="flex flex-col">
                            <Label className="text-sm font-medium text-gray-700 mb-1">Cantidad</Label>
                            <Input
                                type="number"
                                placeholder="Cantidad"
                                min="0.01"
                                step="0.01"
                                value={editForm.cantidad_ingreso}
                                onChange={(e) => setEditForm({ ...editForm, cantidad_ingreso: Number(e.target.value) || 0 })}
                            />
                        </div>

                        {/* Campo Marca */}
                        <div className="flex flex-col">
                            <Label className="text-sm font-medium text-gray-700 mb-1">Marca</Label>
                            <Input
                                placeholder="Marca"
                                value={editForm.marca}
                                onChange={(e) => setEditForm({ ...editForm, marca: e.target.value })}
                            />
                        </div>

                        {/* Campo Origen */}
                        <div className="flex flex-col">
                            <Label className="text-sm font-medium text-gray-700 mb-1">Origen</Label>
                            <Input
                                placeholder="Origen"
                                value={editForm.origen_prod}
                                onChange={(e) => setEditForm({ ...editForm, origen_prod: e.target.value })}
                            />
                        </div>

                        {/* Campo Proveedor */}
                        <div className="flex flex-col">
                            <Label className="text-sm font-medium text-gray-700 mb-1">Nombre Proveedor</Label>
                            <Input
                                placeholder="Proveedor"
                                value={editForm.nombre_proveedor}
                                onChange={(e) => setEditForm({ ...editForm, nombre_proveedor: e.target.value })}
                            />
                        </div>

                        {/* Campo Fecha Caducidad */}
                        <div className="flex flex-col">
                            <Label className="text-sm font-medium text-gray-700 mb-1">Fecha Caducidad</Label>
                            <Input
                                type="date"
                                placeholder="Fecha caducidad"
                                value={editForm.fecha_cad}
                                onChange={(e) => setEditForm({ ...editForm, fecha_cad: e.target.value })}
                            />
                        </div>
                    </div>

                    {saveError && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                            {saveError}
                        </div>
                    )}

                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpenModal(false)} disabled={loadingSave}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={loadingSave}>
                            {loadingSave ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};