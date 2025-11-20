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
                className="space-y-6 p-4 sm:p-6 border rounded-md bg-white shadow-sm max-w-md mx-auto"
            >
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="space-y-4">

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
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2">
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

                        <div className="mt-2 sm:mt-0">
                            <Button
                                type="button"
                                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
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

                    {/* Unidad de medida */}
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
                    <div>
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
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        {loading ? "Guardando..." : "Registrar Entrada"}
                    </Button>
                </div>
            </form>
        </>
    );
};
