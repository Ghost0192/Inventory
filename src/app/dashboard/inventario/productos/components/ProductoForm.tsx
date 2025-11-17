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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
        bodega: "",
        nombre_prod: "",
        descripcion_prod: "",
        marca_prod: "",
        origen_prod: "",
        categoria_prod: "",
        nombre_proveedor: "",
        unidad_medida: "",
        stock_min: 0,
        activo: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal
    const [showSuccess, setShowSuccess] = useState(false);

    // Guardar mensaje dinámico
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

    // Construir payload limpio
    const buildInsertPayload = () => ({
        auth_uid: form.auth_uid,
        correo: form.correo,
        sucursal: form.sucursal,
        bodega: form.bodega,
        nombre_prod: form.nombre_prod,
        descripcion_prod: form.descripcion_prod,
        marca_prod: form.marca_prod,
        origen_prod: form.origen_prod,
        categoria_prod: form.categoria_prod,
        nombre_proveedor: form.nombre_proveedor,
        unidad_medida: form.unidad_medida,
        stock_min: form.stock_min,
        activo: form.activo,
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

            // Guardamos mensaje y mostramos modal
            setModalMessage("El producto fue creado correctamente.");
            setShowSuccess(true);

        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Error al guardar el producto";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    // Función que cierra modal y llama al padre
    const handleModalClose = () => {
        setShowSuccess(false);
        onSuccess();
    };

    return (
        <>
            {/* Modal de confirmación */}
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
                            onValueChange={(val) => setForm({ ...form, sucursal: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una sucursal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Hijuelas">Hijuelas</SelectItem>
                                <SelectItem value="Osorno">Osorno</SelectItem>
                                <SelectItem value="Ica">Ica</SelectItem>
                                <SelectItem value="Queretaro">Querétaro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Bodega</Label>
                        <Select
                            value={form.bodega}
                            onValueChange={(val) => setForm({ ...form, bodega: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una bodega" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Invitro Lab">Invitro Lab</SelectItem>
                                <SelectItem value="Bodega 1">Bodega 1</SelectItem>
                                <SelectItem value="Bodega 2">Bodega 2</SelectItem>
                                <SelectItem value="Bodega 3">Bodega 3</SelectItem>
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
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label>Descripción</Label>
                        <Textarea
                            name="descripcion_prod"
                            value={form.descripcion_prod}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label>Marca</Label>
                        <Select
                            value={form.marca_prod}
                            onValueChange={(val) => setForm({ ...form, marca_prod: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una marca" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Genérico">Genérico</SelectItem>
                                <SelectItem value="Líder">Líder</SelectItem>
                                <SelectItem value="Protec">Protec</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Origen</Label>
                        <RadioGroup
                            value={form.origen_prod}
                            onValueChange={(val) => setForm({ ...form, origen_prod: val })}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Nacional" id="nacional" />
                                    <Label htmlFor="nacional">Nacional</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Internacional" id="internacional" />
                                    <Label htmlFor="internacional">Internacional</Label>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    <div>
                        <Label>Categoría</Label>
                        <Select
                            value={form.categoria_prod}
                            onValueChange={(val) => setForm({ ...form, categoria_prod: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Contenedor">Contenedor</SelectItem>
                                <SelectItem value="Agroquimico">Agroquímico</SelectItem>
                                <SelectItem value="Fertilizante">Fertilizante</SelectItem>
                                <SelectItem value="Fungicida">Fungicida</SelectItem>
                                <SelectItem value="Insumo">Insumo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Nombre Proveedor</Label>
                        <Input
                            name="nombre_proveedor"
                            value={form.nombre_proveedor}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Label>Unidad de Medida</Label>
                        <Select
                            value={form.unidad_medida}
                            onValueChange={(val) => setForm({ ...form, unidad_medida: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona unidad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Unidad">Unidad</SelectItem>
                                <SelectItem value="Kilogramos">Kilogramos</SelectItem>
                                <SelectItem value="Litros">Litros</SelectItem>
                                <SelectItem value="Gramos">Gramos</SelectItem>
                                <SelectItem value="Mililitros">Mililitros</SelectItem>
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

                {/* Botón de crear */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                Guardando...
                            </span>
                        ) : (
                            "Crear Producto"
                        )}
                    </Button>
                </div>

            </form>
        </>
    );
};
