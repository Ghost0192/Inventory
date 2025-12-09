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
import { ArrowUpDown, Search, ChevronLeft, ChevronRight, Edit } from "lucide-react"; // Iconos modernos

import { QRCreate } from "@/components/ui/common/QRCreate";
import clsx from "clsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; // Importa el componente del modal

import { supabase } from "@/lib/supabaseClient";

interface Props {
    productos: Producto[];
    onEdit?: (producto: Producto) => void;
}

export const ProductoTable: React.FC<Props> = ({ productos, onEdit }) => {
    const [search, setSearch] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<keyof Producto | null>("nombre_prod");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Producto | null>(null);

    const [openModal, setOpenModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
    const [formData, setFormData] = useState({
        nombre_prod: "",
        descripcion_prod: "",
        categoria_prod: "",
        unidad_medida: "",
        stock_min: 0,
        activo: true,
    });
    const [message, setMessage] = useState<string | null>(null); // Estado para mensajes de éxito/error

    const handleDeleteRequest = (producto: Producto) => {
        setProductToDelete(producto);
        setOpenDeleteModal(true);
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return productos.filter(
            (p) =>
                (p.nombre_prod ?? "").toLowerCase().includes(q) ||
                (p.descripcion_prod ?? "").toLowerCase().includes(q) ||
                (p.codigo_producto ?? "").toLowerCase().includes(q) ||
                (p.categoria_prod ?? "").toLowerCase().includes(q)
        );
    }, [search, productos]);

    const sorted = useMemo(() => {
        if (!sortColumn) return filtered;

        return [...filtered].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            let comparison = 0;

            if (sortColumn === 'stock_min') {
                comparison = (Number(aVal) || 0) - (Number(bVal) || 0);
            } else if (sortColumn === 'fecha_reg') {
                const dateA = aVal ? new Date(aVal as string).getTime() : 0;
                const dateB = bVal ? new Date(bVal as string).getTime() : 0;
                comparison = dateA - dateB;
            } else {
                const aStr = String(aVal ?? "").toLowerCase();
                const bStr = String(bVal ?? "").toLowerCase();
                if (aStr < bStr) comparison = -1;
                if (aStr > bStr) comparison = 1;
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });
    }, [filtered, sortColumn, sortOrder]);

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginated = sorted.slice(start, end);
    const totalPages = Math.ceil(sorted.length / rowsPerPage);

    const handleSort = (column: keyof Producto) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortOrder("asc");
        }
        setPage(1); // Resetear paginación al ordenar
    };

    const getSortIcon = (key: keyof Producto) => {
        if (sortColumn !== key) return <ArrowUpDown size={14} className="text-gray-400" />;

        return (
            <ArrowUpDown
                size={14}
                className={clsx("text-indigo-600 transition-transform", sortOrder === "desc" && "rotate-180")}
            />
        );
    };

    const columns: { key: keyof Producto, label: string, className?: string }[] = [
        { key: "fecha_reg", label: "Fecha Reg.", className: "w-[120px] hidden lg:table-cell" },
        { key: "codigo_producto", label: "Código", className: "w-[120px]" },
        { key: "nombre_prod", label: "Producto" },
        { key: "descripcion_prod", label: "Descripción" },
        { key: "categoria_prod", label: "Categoría", className: "hidden sm:table-cell" },
        { key: "stock_min", label: "Stock Mín.", className: "w-[100px] text-center" },
    ];

    const handleEdit = (producto: Producto) => {
        setSelectedProduct(producto);
        setFormData({
            nombre_prod: producto.nombre_prod,
            descripcion_prod: producto.descripcion_prod || "",
            categoria_prod: producto.categoria_prod || "",
            unidad_medida: producto.unidad_medida || "",
            stock_min: producto.stock_min || 0,
            activo: producto.activo ?? true,
        });
        setOpenModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;

        const { error } = await supabase
            .from("a_productos")
            .delete()
            .eq("id_prod", productToDelete.id_prod);

        if (error) {
            console.error("Error eliminando:", error);
            return;
        }

        const index = productos.findIndex(p => p.id_prod === productToDelete.id_prod);
        if (index !== -1) {
            productos.splice(index, 1); // mutación controlada
        }

        setOpenDeleteModal(false);
        setProductToDelete(null);
    };

    const handleSave = async () => {
        if (selectedProduct) {
            const updatedProduct = {
                ...selectedProduct,
                ...formData,
                nombre_prod: formData.nombre_prod.toUpperCase(),
                descripcion_prod: formData.descripcion_prod.toUpperCase(),
                categoria_prod: formData.categoria_prod.toUpperCase(),
                unidad_medida: formData.unidad_medida.toUpperCase(),
            };

            const { error } = await supabase
                .from("a_productos")
                .update(updatedProduct)
                .eq("id_prod", selectedProduct.id_prod);

            if (error) {
                setMessage("Error al editar el producto. Intente nuevamente.");
                console.error("Error al editar:", error);
            } else {
                setMessage("Producto editado con éxito.");
                setOpenModal(false);
            }
        }
    };

    return (
        <div className="space-y-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Mensaje de éxito o error */}
            {message && (
                <div className="p-4 bg-blue-100 text-blue-700 rounded-md">
                    {message}
                </div>
            )}

            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                Catálogo de Productos ({productos.length})
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por código, nombre o categoría..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 bg-gray-50 border-gray-200"
                    />
                </div>
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
                                    <div className="flex items-center gap-1 justify-center">
                                        {col.label}
                                        {getSortIcon(col.key)}
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="w-auto text-center">Estado</TableHead>
                            <TableHead className="w-[120px] text-center">Acciones</TableHead>
                            <TableHead className="w-[120px] text-center">Edición</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginated.length > 0 ? (
                            paginated.map((p) => (
                                <TableRow key={p.id_prod} className="hover:bg-indigo-50/20 transition-colors scroll-auto">
                                    <TableCell className="text-sm text-gray-500 hidden lg:table-cell">{formatDate(p.fecha_reg)}</TableCell>
                                    <TableCell className="font-mono text-sm text-gray-700">{p.codigo_producto}</TableCell>
                                    <TableCell className="font-medium text-gray-900">{p.nombre_prod}</TableCell>
                                    <TableCell className="text-gray-600 hidden sm:table-cell">{p.descripcion_prod}</TableCell>
                                    <TableCell className="text-gray-600 hidden sm:table-cell">{p.categoria_prod}</TableCell>
                                    <TableCell className="font-bold text-center text-indigo-600">{p.stock_min}</TableCell>

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

                                    <TableCell className="text-center space-x-2">
                                        <QRCreate
                                            codigo={p.codigo_producto ?? ""}
                                            nombre={p.nombre_prod ?? ""}
                                        />
                                    </TableCell>

                                    <TableCell className="text-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(p)}
                                        >
                                            <Edit className="h-4 w-4 mr-1" /> Editar
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteRequest(p)}
                                        >
                                            Eliminar
                                        </Button>
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

            {/* Paginación */}
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
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Modal de edición */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar Producto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Nombre Producto</label>
                            <Input
                                value={formData.nombre_prod}
                                onChange={(e) => setFormData({ ...formData, nombre_prod: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <Input
                                value={formData.descripcion_prod}
                                onChange={(e) => setFormData({ ...formData, descripcion_prod: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <Input
                                value={formData.categoria_prod}
                                onChange={(e) => setFormData({ ...formData, categoria_prod: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Unidad Medida</label>
                            <Input
                                value={formData.unidad_medida}
                                onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                            <Input
                                type="number"
                                value={formData.stock_min}
                                onChange={(e) => setFormData({ ...formData, stock_min: +e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpenModal(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>

                {/* Modal de eliminación */}
                <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">
                                Confirmar eliminación
                            </DialogTitle>
                        </DialogHeader>

                        <p className="text-gray-700 text-sm">
                            ¿Seguro que deseas eliminar el producto{" "}
                            <span className="font-bold">{productToDelete?.nombre_prod}</span>?
                            Esta acción no se puede deshacer.
                        </p>

                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>
                                Eliminar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </Dialog>
        </div>
    );
};
