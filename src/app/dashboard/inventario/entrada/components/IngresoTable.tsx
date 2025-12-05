//src/app/dashboard/inventario/entrada/components/IngresoTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import { IngresoEdit } from "../types";
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

interface Props {
    ingresos: IngresoEdit[]; // Cambié ingresosE por ingresos
}

export const IngresoTable: React.FC<Props> = ({ ingresos }) => {
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<keyof IngresoEdit | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Modal de edición
    const [openModal, setOpenModal] = useState(false);
    const [selectedIngreso, setSelectedIngreso] = useState<IngresoEdit | null>(null);

    // Edit form state
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

    // Alternar orden
    const handleSort = (column: keyof IngresoEdit) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
    };

    // Abrir modal con ingreso seleccionado
    const handleEdit = (ingreso: IngresoEdit) => {
        setSelectedIngreso(ingreso);
        setEditForm({
            nombre_prod: ingreso.nombre_prod ?? "",
            descripcion_prod: ingreso.descripcion_prod ?? "",
            cantidad_ingreso: ingreso.cantidad_ingreso ?? 0,
            marca: ingreso.marca ?? "",
            origen_prod: ingreso.origen_prod ?? "",
            nombre_proveedor: ingreso.nombre_proveedor ?? "",
            fecha_cad: ingreso.fecha_cad ?? "",
        });
        setOpenModal(true);
    };

    // Guardar cambios
    const handleSave = () => {
        if (!selectedIngreso) return;
        // Aquí puedes hacer la llamada a la API o actualizar el estado local
        console.log("Guardar cambios:", { id: selectedIngreso.id_entr, ...editForm });
        setOpenModal(false);
    };

    // Formatear fecha (DD/MM/YYYY)
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
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

            {/* Tabla con scroll horizontal */}
            <div className="overflow-x-auto rounded-md border">
                <Table className="min-w-[100px]">
                    <TableHeader>
                        <TableRow>
                            {[
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
                            ].map((col) => (
                                <TableHead
                                    key={col.key}
                                    className="cursor-pointer select-none"
                                    onClick={() => col.key !== "editar" && handleSort(col.key as keyof IngresoEdit)}
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
                                        {/*Botón de editar
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(i)}>
                                            <Edit2 size={16} />
                                        </Button>*/}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={15} className="text-center py-6 text-gray-500">
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
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                        Siguiente
                    </Button>
                </div>
            </div>

            {/* Modal de edición */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar Ingreso</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Todos los campos del formulario */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Nombre Producto</label>
                            <Input
                                placeholder="Nombre producto"
                                value={editForm.nombre_prod}
                                onChange={(e) => setEditForm({ ...editForm, nombre_prod: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <Input
                                placeholder="Descripción"
                                value={editForm.descripcion_prod}
                                onChange={(e) => setEditForm({ ...editForm, descripcion_prod: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                            <Input
                                type="number"
                                placeholder="Cantidad"
                                value={editForm.cantidad_ingreso}
                                onChange={(e) => setEditForm({ ...editForm, cantidad_ingreso: Number(e.target.value) })}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Marca</label>
                            <Input
                                placeholder="Marca"
                                value={editForm.marca}
                                onChange={(e) => setEditForm({ ...editForm, marca: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Origen</label>
                            <Input
                                placeholder="Origen"
                                value={editForm.origen_prod}
                                onChange={(e) => setEditForm({ ...editForm, origen_prod: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                            <Input
                                placeholder="Proveedor"
                                value={editForm.nombre_proveedor}
                                onChange={(e) => setEditForm({ ...editForm, nombre_proveedor: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Fecha Caducidad</label>
                            <Input
                                type="date"
                                placeholder="Fecha caducidad"
                                value={editForm.fecha_cad}
                                onChange={(e) => setEditForm({ ...editForm, fecha_cad: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpenModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
