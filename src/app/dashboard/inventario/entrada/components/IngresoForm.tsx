// src/app/dashboard/inventario/entrada/components/IngresoForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { cleanString } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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
// Importamos solo IngresoInsert
import { IngresoInsert } from "../types";

// Estado inicial limpio del formulario (sin campos de usuario)
const initialFormState: Omit<IngresoInsert, 'auth_uid' | 'correo'> = {
    sucursal: "",
    bodega: "",
    codigo_producto: "",
    nombre_prod: "",
    descripcion_prod: null,
    unidad_medida: null,
    cantidad_ingreso: 0,
    marca: null,
    origen_prod: null,
    id_proveedor: null,
    nombre_proveedor: null,
    fecha_cad: null,
    nota: null,
};

// Función auxiliar para formatear la fecha a YYYY-MM-DD (se mueve al Modal de Edición si se necesita allí)
/* const formatDateToInput = (dateStr: string | null | undefined): string => {
    // ...
}; */


interface Props {
    onSuccess: () => void;
    // CORRECCIÓN: Eliminamos la prop 'ingreso' (ya que el formulario es solo para inserción)
}

export const IngresoForm: React.FC<Props> = ({ onSuccess }) => {

    // Inicializar el estado
    const [form, setForm] = useState<IngresoInsert>({
        auth_uid: "",
        correo: "",
        ...initialFormState
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [openQr, setOpenQr] = useState(false);

    // Efecto 1: Cargar usuario autenticado
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

    // CORRECCIÓN: Eliminamos el useEffect para cargar 'ingreso' (ya que no existe)
    /* useEffect(() => {
        // ... Lógica de carga de edición eliminada
    }, [ingreso]); */


    // Buscar producto por código
    const buscarProducto = async (codigo: string) => {
        if (!codigo) return;
        const codigoUpper = codigo.toUpperCase();

        const { data } = await supabase
            .from("a_productos")
            .select("*")
            .eq("codigo_producto", codigoUpper)
            .maybeSingle();

        setForm(prev => ({
            ...prev,
            nombre_prod: data?.nombre_prod ?? "",
            descripcion_prod: data?.descripcion_prod ?? null,
            unidad_medida: data?.unidad_medida ?? null,
        }));
    };

    // Manejar cambios en inputs y textarea
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setForm(prev => {
            let newValue: string | number | null = value;

            if (name === "cantidad_ingreso") {
                newValue = value === "" ? 0 : Number(value);
            } else if (name === "fecha_cad") {
                newValue = value === "" ? null : value;
            } else {
                newValue = value.trim() === "" ? null : value.toUpperCase();
            }

            return {
                ...prev,
                [name]: newValue,
            } as IngresoInsert;
        });

        if (name === "codigo_producto") buscarProducto(value);
    };

    // Manejador para Select y RadioGroup
    const handleValueChange = (name: keyof IngresoInsert, val: string) => {
        setForm(prev => ({
            ...prev,
            [name]: val.toUpperCase(),
        }));
    };

    // Construir payload limpio
    const buildPayload = (): IngresoInsert => {
        return {
            auth_uid: form.auth_uid,
            correo: form.correo,
            sucursal: form.sucursal.toUpperCase(),
            bodega: form.bodega.toUpperCase(),
            codigo_producto: form.codigo_producto.toUpperCase(),
            nombre_prod: form.nombre_prod.toUpperCase(),
            cantidad_ingreso: Number(form.cantidad_ingreso),

            descripcion_prod: cleanString(form.descripcion_prod),
            unidad_medida: cleanString(form.unidad_medida),
            marca: cleanString(form.marca),
            origen_prod: cleanString(form.origen_prod),
            id_proveedor: cleanString(form.id_proveedor),
            nombre_proveedor: cleanString(form.nombre_proveedor),
            nota: cleanString(form.nota),
            fecha_cad: form.fecha_cad === "" ? null : form.fecha_cad,
        } as IngresoInsert;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = buildPayload();

            // Validación de campos obligatorios
            if (!payload.sucursal || !payload.bodega || !payload.codigo_producto || payload.cantidad_ingreso <= 0 || !payload.auth_uid || !payload.nombre_prod) {
                throw new Error("Por favor, complete todos los campos obligatorios (Sucursal, Bodega, Código Producto, Nombre y Cantidad).");
            }

            // LÓGICA: Solo inserción
            const { error } = await supabase.from("a_ingresos").insert(payload);
            if (error) throw error;

            setModalMessage("La entrada fue registrada correctamente.");
            setShowSuccess(true);

            // Limpiar formulario
            setForm(prev => ({ ...prev, ...initialFormState }));


        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al guardar el ingreso");
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowSuccess(false);
        onSuccess(); // Dispara la recarga de datos en el padre
    };

    // Lógica del QR separada
    const handleQrResult = async (codigo: string) => {
        setOpenQr(false); // Cerrar el modal
        const codigoUpper = codigo.toUpperCase();
        setForm(prev => ({ ...prev, codigo_producto: codigoUpper }));
        await buscarProducto(codigoUpper);
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
                <h2 className="text-xl font-semibold mb-4">
                    Registrar Nueva Entrada
                </h2>

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
                            onValueChange={(val) => handleValueChange("sucursal", val)}
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
                            onValueChange={(val) => handleValueChange("bodega", val)}
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
                                disabled={openQr} // Deshabilitar si ya está abierto
                            >
                                📷
                            </Button>
                        </div>
                        <QrScannerModal
                            open={openQr}
                            onClose={() => setOpenQr(false)}
                            onResult={handleQrResult}
                            title="Escanea un producto"
                        />
                    </div>

                    {/* Nombre Producto */}
                    <div>
                        <Label>Nombre Producto</Label>
                        <Input
                            name="nombre_prod"
                            value={form.nombre_prod}
                            required
                            disabled
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <Label>Descripción</Label>
                        <Input
                            name="descripcion_prod"
                            value={form.descripcion_prod ?? ""}
                            disabled
                        />
                    </div>

                    {/* Unidad de Medida */}
                    <div>
                        <Label>Unidad de Medida</Label>
                        <Input
                            name="unidad_medida"
                            value={form.unidad_medida ?? ""}
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
                            value={form.origen_prod ?? ""}
                            onValueChange={(val) => handleValueChange("origen_prod", val)}
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
                        <Input name="id_proveedor" value={form.id_proveedor ?? ""} onChange={handleChange} />
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
                        />
                    </div>

                    {/* Nota */}
                    <div>
                        <Label>Nota</Label>
                        <Input
                            name="nota"
                            value={form.nota ?? ""}
                            onChange={handleChange}
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