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
import { Label } from "@/components/ui/label";

import { SuccessModal } from "@/components/ui/common/SuccessModal";

import { QrScannerModal } from '@/components/ui/common/QrScannerModal';

import { IngresoInsert } from "../types";

interface Props {
    ingreso?: any;          // reservado si luego agregas edición
    onSuccess: () => void;
}

export const IngresoForm: React.FC<Props> = ({ onSuccess }) => {
    const [form, setForm] = useState<IngresoInsert>({
        auth_uid: "",
        correo: "",
        sucursal: "",
        codigo_producto: "",
        nombre_prod: "",
        unidad_medida: "",
        cantidad_ingreso: 0,
        fecha_cad: null,
        nota: "",
    });


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal
    const [showSuccess, setShowSuccess] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    // =========== 🔵 Obtener usuario autenticado ===========
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

    // =========== 🟣 Buscar producto por código ===========
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
            unidad_medida: data?.unidad_medida ?? "",
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));

        if (name === "codigo_producto") buscarProducto(value);
    };

    const buildInsertPayload = () => ({
        auth_uid: form.auth_uid,
        correo: form.correo,
        sucursal: form.sucursal,
        codigo_producto: form.codigo_producto,
        nombre_prod: form.nombre_prod,
        unidad_medida: form.unidad_medida,
        cantidad_ingreso: form.cantidad_ingreso,
        fecha_cad: form.fecha_cad,
        nota: form.nota,
    });

    // =========== 🟢 Guardar ingreso ===========
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = buildInsertPayload();
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

    const [open, setOpen] = useState(false);

    return (
        <>
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
                    <div className="col-span-1">
                        <Label>Sucursal</Label>
                        <Select
                            value={form.sucursal}
                            onValueChange={(val) => setForm({ ...form, sucursal: val })}
                        >
                            <SelectTrigger className="w-full">
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

                    {/* Código Producto + QR */}
                    <div className="col-span-4 md:col-span-1 flex flex-col md:flex-row md:items-end gap-2">
                        <div className="flex-1">
                            <Label>Código Producto</Label>
                            <Input
                                name="codigo_producto"
                                value={form.codigo_producto}
                                onChange={handleChange}
                                placeholder="Escribe o escanea"
                                required
                            />
                        </div>

                        <div className="mt-2 md:mt-0">
                            <Button
                                type="button"
                                className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                                onClick={() => setOpen(true)}
                            >
                                📷 Escanear código
                            </Button>
                        </div>

                        <QrScannerModal
                            open={open}
                            onClose={() => setOpen(false)}
                            onResult={async (codigo) => {
                                setForm(prev => ({ ...prev, codigo_producto: codigo }));
                                await buscarProducto(codigo); // actualiza nombre_prod y unidad_medida
                            }}
                            title="Escanea un producto"
                        />
                    </div>


                    {/* Nombre (autocompletado) */}
                    <div>
                        <Label>Nombre Producto</Label>
                        <Input value={form.nombre_prod} disabled />
                    </div>

                    {/* Unidad medida */}
                    <div>
                        <Label>Unidad de Medida</Label>
                        <Input
                            name="unidad_medida"
                            value={form.unidad_medida}
                            onChange={handleChange}
                        />
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

                    {/* Fecha caducidad */}
                    <div>
                        <Label>Fecha de Caducidad</Label>
                        <Input
                            type="date"
                            name="fecha_cad"
                            value={form.fecha_cad ?? ""}
                            onChange={(e) =>
                                setForm({ ...form, fecha_cad: e.target.value })
                            }
                        />
                    </div>

                    {/* Nota */}
                    <div className="md:col-span-4">
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

                {/* Botón */}
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Guardando..." : "Registrar Entrada"}
                    </Button>
                </div>
            </form>
        </>
    );
};
