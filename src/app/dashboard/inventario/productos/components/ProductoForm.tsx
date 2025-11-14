"use client";

import React, { useState, useEffect } from "react";
import { Producto } from "../types";
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
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Props {
    producto?: Producto; 
    onSuccess: () => void; 
}

export const ProductoForm: React.FC<Props> = ({ producto, onSuccess }) => {
    const [form, setForm] = useState<Producto>({
        id_prod: "",
        fecha_reg: "",
        auth_uid: "",
        correo: "",
        sucursal: "",
        bodega: "",
        codigo_producto: "",
        nombre_prod: "",
        descripcion_prod: "",
        marca_prod: "",
        origen_prod: "",
        categoria_prod: "",
        id_proveedor: "",
        nombre_proveedor: "",
        unidad_medida: "",
        stock_min: 0,
        activo: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🔥 Obtener usuario logueado
    useEffect(() => {
        const getUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setForm(prev => ({
                    ...prev,
                    auth_uid: user.id,
                    correo: user.email ?? "",
                }));
            }
        };
        getUserData();
    }, []);

    // Si es edición
    useEffect(() => {
        if (producto) setForm(producto);
    }, [producto]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (producto) {
                // 🔵 UPDATE
                const { error } = await supabase
                    .from("a_productos")
                    .update({
                        sucursal: form.sucursal,
                        bodega: form.bodega,
                        codigo_producto: null,
                        nombre_prod: form.nombre_prod,
                        descripcion_prod: form.descripcion_prod,
                        marca_prod: form.marca_prod,
                        origen_prod: form.origen_prod,
                        categoria_prod: form.categoria_prod,
                        id_proveedor: null,
                        nombre_proveedor: form.nombre_proveedor,
                        unidad_medida: form.unidad_medida,
                        stock_min: form.stock_min,
                        activo: form.activo,
                    })
                    .eq("id_prod", producto.id_prod);

                if (error) throw error;

            } else {
                // 🟢 INSERT
                const { error } = await supabase
                    .from("a_productos")
                    .insert({
                        auth_uid: form.auth_uid,
                        correo: form.correo,
                        sucursal: form.sucursal,
                        bodega: form.bodega,
                        nombre_prod: form.nombre_prod,
                        descripcion_prod: form.descripcion_prod,
                        marca_prod: form.marca_prod,
                        origen_prod: form.origen_prod,
                        categoria_prod: form.categoria_prod,
                        id_proveedor: null,
                        nombre_proveedor: form.nombre_proveedor,
                        unidad_medida: form.unidad_medida,
                        stock_min: form.stock_min,
                        activo: form.activo,
                    });

                if (error) throw error;
            }

            // show success notification
            alert(`Producto ${producto ? "actualizado" : "creado"} exitosamente`);
            onSuccess();

        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 border rounded-md bg-white shadow-sm"
        >
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                {/* Sucursal */}
                <div>
                    <Label>Sucursal</Label>
                    <Select
                        value={form.sucursal}
                        onValueChange={(val) =>
                            setForm({ ...form, sucursal: val })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona una sucursal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Hijuelas">Hijuelas</SelectItem>
                            <SelectItem value="Osorno">Osorno</SelectItem>
                            <SelectItem value="Ica">Ica</SelectItem>
                            <SelectItem value="Queretaro">Queretaro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* bodega */}
                <div>
                    <Label>Bodega</Label>
                    <Input
                        name="bodega"
                        value={form.bodega}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* nombre */}
                <div>
                    <Label>Nombre Producto</Label>
                    <Input
                        name="nombre_prod"
                        value={form.nombre_prod}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* descripción */}
                <div className="md:col-span-2">
                    <Label>Descripción</Label>
                    <Textarea
                        name="descripcion_prod"
                        value={form.descripcion_prod}
                        onChange={handleChange}
                    />
                </div>

                {/* Marca */}
                <div>
                    <Label>Marca</Label>
                    <Select
                        value={form.marca_prod}
                        onValueChange={(val) =>
                            setForm({ ...form, marca_prod: val })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona una marca" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Generico">Genérico</SelectItem>
                            <SelectItem value="Lider">Líder</SelectItem>
                            <SelectItem value="Protec">Protec</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Origen */}
                <div>
                    <Label>Origen</Label>
                    <RadioGroup
                        value={form.origen_prod}
                        onValueChange={(val) =>
                            setForm({ ...form, origen_prod: val })
                        }
                    >
                        <div className="flex space-x-4">
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

                {/* Categoría */}
                <div>
                    <Label>Categoría</Label>
                    <Select
                        value={form.categoria_prod}
                        onValueChange={(val) =>
                            setForm({ ...form, categoria_prod: val })
                        }
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

                {/* Nombre proveedor */}
                <div>
                    <Label>Nombre Proveedor</Label>
                    <Input
                        name="nombre_proveedor"
                        value={form.nombre_proveedor}
                        onChange={handleChange}
                    />
                </div>

                {/* Unidad de medida */}
                <div>
                    <Label>Unidad de Medida</Label>
                    <Select
                        value={form.unidad_medida}
                        onValueChange={(val) =>
                            setForm({ ...form, unidad_medida: val })
                        }
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

                {/* Stock mínimo */}
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

            {/* Botones */}
            <div className="flex justify-end space-x-3">
                <Button type="submit" disabled={loading}>
                    {producto ? "Actualizar" : "Crear"}
                </Button>

                {producto && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onSuccess}
                    >
                        Cancelar
                    </Button>
                )}
            </div>
        </form>
    );
};
