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
import { Salida, SalidaInsert } from "../types";

interface Props {
    salida?: Salida;
    onSuccess: () => void;
}


export const SalidaForm: React.FC<Props> = ({ onSuccess }) => {
    const [form, setForm] = useState<SalidaInsert>({
        auth_uid: "",
        correo: "",
        sucursal: "",
        codigo_producto: "",
        nombre_prod: "",
        descripcion_prod: "",
        area_destino: "",
        numero_documento: "",
        unidad_medida: "",
        cantidad_salida: 0,
        nota: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [open, setOpen] = useState(false);

    // Nuevo estado para stock disponible
    const [stockDisponible, setStockDisponible] = useState<number>(0);

    // Cargar usuario autenticado
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

    // Buscar producto y traer nombre y unidad
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

    // Consultar stock disponible
    const consultarStock = async (codigo: string): Promise<number> => {
        if (!codigo) return 0;

        const { data: ingresos } = await supabase
            .from("a_ingresos")
            .select("cantidad_ingreso")
            .eq("codigo_producto", codigo);

        const { data: salidas } = await supabase
            .from("a_salidas")
            .select("cantidad_salida")
            .eq("codigo_producto", codigo);

        const totalIngresos =
            ingresos?.reduce((acc, x) => acc + Number(x.cantidad_ingreso), 0) || 0;

        const totalSalidas =
            salidas?.reduce((acc, x) => acc + Number(x.cantidad_salida), 0) || 0;

        return totalIngresos - totalSalidas;
    };

    // Cada vez que cambie el código → consultar stock y producto
    useEffect(() => {
        const fetchStock = async () => {
            if (!form.codigo_producto) {
                setStockDisponible(0);
                return;
            }

            const stock = await consultarStock(form.codigo_producto);
            setStockDisponible(stock);
        };

        fetchStock();
        buscarProducto(form.codigo_producto);
    }, [form.codigo_producto]);

    // Cambios en inputs
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    // Submit del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validaciones manuales
        if (!form.sucursal) {
            setError("Debes seleccionar una sucursal");
            setLoading(false);
            return;
        }

        if (!form.codigo_producto) {
            setError("Debes ingresar un código de producto");
            setLoading(false);
            return;
        }

        if (!form.cantidad_salida || form.cantidad_salida <= 0) {
            setError("Debes ingresar una cantidad válida");
            setLoading(false);
            return;
        }

        if (form.cantidad_salida > stockDisponible) {
            setError(`No hay suficiente stock. Disponible: ${stockDisponible}`);
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.from("a_salidas").insert(form);
            if (error) throw error;

            setModalMessage("La salida fue registrada correctamente.");
            setShowSuccess(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error al guardar la salida");
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
                            required
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona sucursal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Hijuelas">Hijuelas</SelectItem>
                                <SelectItem value="Osorno">Osorno</SelectItem>
                                <SelectItem value="Ica">Ica</SelectItem>
                                <SelectItem value="Queretaro">Querétaro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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
                            }}
                            title="Escanea un producto"
                        />
                    </div>

                    <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                        <Label>Nombre Producto</Label>
                        <Input value={form.nombre_prod} disabled />
                    </div>

                    <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                        <Label>Descripción</Label>
                        <Input value={form.descripcion_prod} disabled />
                    </div>

                    {/* Area destino */}
                    <div>
                        <Label>Area destino</Label>
                        <Select
                            value={form.area_destino}
                            onValueChange={(val) => setForm({ ...form, area_destino: val })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un destino" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Oficinas">Oficinas</SelectItem>
                                <SelectItem value="Medios">Medios</SelectItem>
                                <SelectItem value="Trasfer 1">Trasfer 1</SelectItem>
                                <SelectItem value="Trasfer 2">Trasfer 2</SelectItem>
                                <SelectItem value="Trasfer 3">Trasfer 3</SelectItem>
                                <SelectItem value="Trasfer 4">Trasfer 4</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                        <Label># de documento</Label>
                        <Input value={form.numero_documento}
                            name="numero_documento"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Label>Unidad de Medida</Label>
                        <Input
                            name="unidad_medida"
                            value={form.unidad_medida}
                            disabled
                        />
                    </div>

                    <div>
                        <Label>Stock Disponible</Label>
                        <Input
                            name="stock_disponible"
                            value={stockDisponible}
                            disabled
                        />
                    </div>

                    <div>
                        <Label>Cantidad</Label>
                        <Input
                            type="number"
                            step="0.01"
                            name="cantidad_salida"
                            value={form.cantidad_salida}
                            onChange={handleChange}
                            required
                        />
                    </div>

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
                        {loading ? "Guardando..." : "Registrar Salida"}
                    </Button>
                </div>
            </form>
        </>
    );
};
