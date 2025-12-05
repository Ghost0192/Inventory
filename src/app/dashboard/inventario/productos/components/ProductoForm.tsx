// src/app/dashboard/inventario/productos/components/ProductoForm.tsx

"use client";

import React, { useState, useEffect } from "react";
import { ProductoInsert } from "../types";
import { supabase } from "@/lib/supabaseClient";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { SuccessModal } from "@/components/ui/common/SuccessModal";

interface Props {
    onSuccess: () => void;
}

export const ProductoForm: React.FC<Props> = ({ onSuccess }) => {
    const [form, setForm] = useState<ProductoInsert>({
        auth_uid: "",
        correo: "",
        sucursal: "",
        nombre_prod: "",
        descripcion_prod: "",
        categoria_prod: "",
        unidad_medida: "",
        stock_min: 0,
        activo: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    // Obtener usuario logueado
    useEffect(() => {
        const getUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setForm(prev => ({
                    ...prev,
                    auth_uid: user.id,
                    correo: user.email || "",
                }));
            }
        };
        getUserData();
    }, []);

    // Construir payload limpio y en mayúsculas
    const buildInsertPayload = () => ({
        auth_uid: form.auth_uid,            // NO CAMBIAR
        correo: form.correo,                // NO CAMBIAR
        sucursal: form.sucursal.toUpperCase(),
        nombre_prod: form.nombre_prod.toUpperCase(),
        descripcion_prod: form.descripcion_prod?.toUpperCase() || null,
        categoria_prod: form.categoria_prod?.toUpperCase() || null,
        unidad_medida: form.unidad_medida?.toUpperCase() || null,
        stock_min: form.stock_min,
        activo: form.activo
    });

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = buildInsertPayload();
            const { error } = await supabase.from("a_productos").insert(payload);

            if (error) throw error;

            setModalMessage("El producto fue creado correctamente.");
            setShowSuccess(true);

        } catch (err: unknown) {
            // Type guard para obtener el mensaje si es Error
            const msg =
                err instanceof Error
                    ? err.message
                    : "Error al guardar el producto";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Cambiar valores y convertir a mayúsculas
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        const upperValue =
            type === "number" ? Number(value) : value.toUpperCase();

        setForm(prev => ({
            ...prev,
            [name]: upperValue,
        }));
    };

    const handleModalClose = () => {
        setShowSuccess(false);
        onSuccess();
    };

    return (
        <>
            {/* Modal */}
            <SuccessModal
                open={showSuccess}
                onClose={handleModalClose}
                message={modalMessage}
            />

            <form
                onSubmit={handleSubmit}
                className="space-y-6 p-6 border rounded-md bg-white shadow-sm"
            >
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    <div>
                        <Label>ID Usuario</Label>
                        <Input value={form.auth_uid} disabled />
                    </div>

                    <div>
                        <Label>Correo</Label>
                        <Input value={form.correo} disabled />
                    </div>

                    <div>
                        <Label>Sucursal</Label>
                        <Select
                            value={form.sucursal}
                            onValueChange={(val) =>
                                setForm({ ...form, sucursal: val.toUpperCase() })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una sucursal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HIJUELAS">HIJUELAS</SelectItem>
                                <SelectItem value="OSORNO">OSORNO</SelectItem>
                                <SelectItem value="ICA">ICA</SelectItem>
                                <SelectItem value="QUERETARO">QUERÉTARO</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Nombre Producto</Label>
                        <Input
                            name="nombre_prod"
                            value={form.nombre_prod}
                            onChange={handleChange}
                            required
                            className="uppercase"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label>Descripción</Label>
                        <Textarea
                            name="descripcion_prod"
                            value={form.descripcion_prod}
                            onChange={handleChange}
                            rows={3}
                            className="uppercase"
                        />
                    </div>

                    <div>
                        <Label>Categoría</Label>
                        <Select
                            value={form.categoria_prod}
                            onValueChange={(val) =>
                                setForm({ ...form, categoria_prod: val.toUpperCase() })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CONTENEDOR">CONTENEDOR</SelectItem>
                                <SelectItem value="AGROQUIMICO">AGROQUÍMICOS</SelectItem>
                                <SelectItem value="FERTILIZANTE">FERTILIZANTE</SelectItem>
                                <SelectItem value="FUNGICIDA">FUNGICIDA</SelectItem>
                                <SelectItem value="INSUMO">INSUMO</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Unidad de Medida</Label>
                        <Select
                            value={form.unidad_medida}
                            onValueChange={(val) =>
                                setForm({ ...form, unidad_medida: val.toUpperCase() })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona unidad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UNIDAD">UNIDAD</SelectItem>
                                <SelectItem value="KILOGRAMOS">KILOGRAMOS</SelectItem>
                                <SelectItem value="LITROS">LITROS</SelectItem>
                                <SelectItem value="GRAMOS">GRAMOS</SelectItem>
                                <SelectItem value="MILILITROS">MILILITROS</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Stock Mínimo</Label>
                        <Input
                            type="number"
                            name="stock_min"
                            value={form.stock_min}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Botón de Guardar */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Guardando..." : "Crear Producto"}
                    </Button>
                </div>

            </form>
        </>
    );
};
