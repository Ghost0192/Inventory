// src/app/dashboard/inventario/entrada/components/IngresoForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SuccessModal } from "@/components/ui/common/SuccessModal";
import { QrScannerModal } from "@/components/ui/common/QrScannerModal";
import { IngresoInsert } from "../types";

interface Props {
    onSuccess: () => void;
}

export const IngresoForm: React.FC<Props> = ({ onSuccess }) => {
    const [form, setForm] = useState<IngresoInsert>({
        auth_uid: "",
        correo: "",
        sucursal: "",
        bodega: "",
        codigo_producto: "",
        nombre_prod: "",
        descripcion_prod: "",
        unidad_medida: "",
        cantidad_ingreso: 0,
        marca: "",
        origen_prod: "",
        id_proveedor: "",
        nombre_proveedor: "",
        fecha_cad: null,
        nota: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [openQr, setOpenQr] = useState(false);

    // Obtener usuario autenticado
    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setForm(prev => ({
                    ...prev,
                    auth_uid: user.id,
                    correo: user.email ?? "",
                }));
            }
        };
        loadUser();
    }, []);

    // Buscar producto por código
    const buscarProducto = async (codigo: string) => {
        if (!codigo) return;
        const { data } = await supabase
            .from("a_productos")
            .select("*")
            .eq("codigo_producto", codigo)
            .maybeSingle();

        setForm(prev => ({
            ...prev,
            nombre_prod: data?.nombre_prod ?? "",
            descripcion_prod: data?.descripcion_prod ?? "",
            unidad_medida: data?.unidad_medida ?? "",
        }));
    };

    // Manejar cambios en inputs y textarea
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: ["cantidad_ingreso", "fecha_cad"].includes(name)
                ? type === "number"
                    ? Number(value)
                    : value
                : value.toUpperCase(),
        }));

        if (name === "codigo_producto") buscarProducto(value);
    };

    // Construir payload limpio
    const buildPayload = () => ({
        ...form,
        sucursal: form.sucursal.toUpperCase(),
        bodega: form.bodega.toUpperCase(),
        codigo_producto: form.codigo_producto.toUpperCase(),
        nombre_prod: form.nombre_prod.toUpperCase(),
        descripcion_prod: form.descripcion_prod?.toUpperCase() || null,
        unidad_medida: form.unidad_medida?.toUpperCase() || null,
        marca: form.marca?.toUpperCase() || null,
        origen_prod: form.origen_prod?.toUpperCase() || null,
        nombre_proveedor: form.nombre_proveedor?.toUpperCase() || null,
        nota: form.nota?.toUpperCase() || null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = buildPayload();
            const { error } = await supabase.from("a_ingresos").insert(payload);
            if (error) throw error;

            setModalMessage("La entrada fue registrada correctamente.");
            setShowSuccess(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al guardar el ingreso");
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowSuccess(false);
        onSuccess();
    };

    return (
        <>
            <SuccessModal
                open={showSuccess}
                onClose={handleModalClose}
                message={modalMessage}
            />

            <form
                onSubmit={handleSubmit}
                className="space-y-6 p-4 md:p-6 border rounded-md bg-white shadow-sm"
            >
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Usuario */}
                    <div>
                        <Label>ID Usuario</Label>
                        <Input value={form.auth_uid} disabled />
                    </div>

                    <div>
                        <Label>Correo</Label>
                        <Input value={form.correo} disabled />
                    </div>

                    {/* Sucursal */}
                    <div>
                        <Label>Sucursal</Label>
                        <Select
                            value={form.sucursal}
                            onValueChange={(val) => setForm({ ...form, sucursal: val.toUpperCase() })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una sucursal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HIJUELAS">HIJUELAS</SelectItem>
                                <SelectItem value="OSORNO">OSORNO</SelectItem>
                                <SelectItem value="ICA">ICA</SelectItem>
                                <SelectItem value="QUERÉTARO">QUERÉTARO</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Bodega */}
                    <div>
                        <Label>Bodega</Label>
                        <Select
                            value={form.bodega}
                            onValueChange={(val) => setForm({ ...form, bodega: val.toUpperCase() })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una bodega" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INVITRO LAB">INVITRO LAB</SelectItem>
                                <SelectItem value="HARDENING">HARDENING</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Código Producto + QR */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                        <Label>Código Producto</Label>
                        <div className="flex flex-col sm:flex-row gap-2 mt-1">
                            <Input
                                name="codigo_producto"
                                value={form.codigo_producto}
                                onChange={handleChange}
                                placeholder="Escribe o escanea"
                                required
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                onClick={() => setOpenQr(true)}
                            >
                                📷
                            </Button>
                        </div>
                        <QrScannerModal
                            open={openQr}
                            onClose={() => setOpenQr(false)}
                            onResult={async (codigo) => {
                                setForm(prev => ({ ...prev, codigo_producto: codigo }));
                                await buscarProducto(codigo);
                            }}
                            title="Escanea un producto"
                        />
                    </div>

                    {/* Nombre Producto */}
                    <div>
                        <Label>Nombre Producto</Label>
                        <Input value={form.nombre_prod} disabled />
                    </div>

                    {/* Descripción */}
                    <div>
                        <Label>Descripción</Label>
                        <Input value={form.descripcion_prod} disabled />
                    </div>

                    {/* Unidad de Medida */}
                    <div>
                        <Label>Unidad de Medida</Label>
                        <Input value={form.unidad_medida} disabled />
                    </div>

                    {/* Cantidad */}
                    <div>
                        <Label>Cantidad</Label>
                        <Input
                            type="number"
                            step="0.01"
                            name="cantidad_ingreso"
                            value={form.cantidad_ingreso}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Marca */}
                    <div>
                        <Label>Marca</Label>
                        <Input
                            name="marca"
                            value={form.marca ?? ""}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Origen */}
                    <div>
                        <Label>Origen</Label>
                        <RadioGroup
                            value={form.origen_prod}
                            onValueChange={(val) => setForm({ ...form, origen_prod: val.toUpperCase() })}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="NACIONAL" id="NACIONAL" />
                                    <Label htmlFor="NACIONAL">NACIONAL</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="INTERNACIONAL" id="INTERNACIONAL" />
                                    <Label htmlFor="INTERNACIONAL">INTERNACIONAL</Label>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Proveedor */}
                    <div>
                        <Label>ID Proveedor</Label>
                        <Input name="id_proveedor" value={form.id_proveedor ?? ""} onChange={handleChange} disabled />
                    </div>
                    <div>
                        <Label>Nombre Proveedor</Label>
                        <Input name="nombre_proveedor" value={form.nombre_proveedor ?? ""} onChange={handleChange} />
                    </div>

                    {/* Fecha caducidad */}
                    <div>
                        <Label>Fecha de Caducidad</Label>
                        <Input
                            type="date"
                            name="fecha_cad"
                            value={form.fecha_cad ?? ""}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Nota */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <Label>Nota</Label>
                        <Textarea
                            name="nota"
                            rows={3}
                            value={form.nota ?? ""}
                            onChange={handleChange}
                            placeholder="Observaciones opcionales"
                        />
                    </div>

                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Guardando..." : "Registrar Entrada"}
                    </Button>
                </div>
            </form>
        </>
    );
};
