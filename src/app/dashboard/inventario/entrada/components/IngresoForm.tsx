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
import { QrScannerModal } from "@/components/ui/common/QrScannerModal";
import { IngresoInsert, Ingreso } from "../types";

interface Props {
    ingreso?: Ingreso;
    onSuccess: () => void;
}

export const IngresoForm: React.FC<Props> = ({ onSuccess }) => {
    const [form, setForm] = useState<IngresoInsert>({
        auth_uid: "",
        correo: "",
        sucursal: "",
        codigo_producto: "",
        nombre_prod: "",
        descripcion_prod: "",  
        unidad_medida: "",
        cantidad_ingreso: 0,
        fecha_cad: null,
        nota: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [open, setOpen] = useState(false);

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
            descripcion_prod: data?.descripcion_prod ?? "",  // <── AGREGADO
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.from("a_ingresos").insert(form);
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

                {/* GRID RESPONSIVA */}
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
                                onClick={() => setOpen(true)}
                            >
                                📷
                            </Button>
                        </div>

                        <QrScannerModal
                            open={open}
                            onClose={() => setOpen(false)}
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

                    {/* Descripción Producto */}
                    <div>
                        <Label>Descripción Producto</Label>
                        <Input value={form.descripcion_prod} disabled />
                    </div>

                    {/* Unidad de Medida */}
                    <div>
                        <Label>Unidad de Medida</Label>
                        <Input
                            name="unidad_medida"
                            value={form.unidad_medida}
                            disabled
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
                            required
                        />
                    </div>

                    {/* Nota */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3">
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
