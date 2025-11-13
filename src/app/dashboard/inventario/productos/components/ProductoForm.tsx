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
    producto?: Producto; // Si viene, será edición
    onSuccess: () => void; // Callback para refrescar la lista
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

    useEffect(() => {
        if (producto) setForm(producto);
    }, [producto]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (producto) {
                const { error } = await supabase
                    .from("a_productos")
                    .update(form)
                    .eq("id_prod", producto.id_prod);

                if (error) throw error;
            } else {
                const { error } = await supabase.from("a_productos").insert(form);
                if (error) throw error;
            }

            onSuccess();
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Error al guardar el producto";
            setError(errorMessage);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>ID Producto</Label>
                    <Input
                        name="id_prod"
                        value={form.id_prod}
                        onChange={handleChange}
                        placeholder="Ej. PROD-001"
                        required
                    />
                </div>

                <div>
                    <Label>Fecha Registro</Label>
                    <Input
                        type="date"
                        name="fecha_reg"
                        value={form.fecha_reg}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <Label>ID Usuario</Label>
                    <Input
                        name="auth_uid"
                        value={form.auth_uid}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <Label>Correo</Label>
                    <Input
                        type="email"
                        name="correo"
                        value={form.correo}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Sucursal */}
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
                            <SelectItem value="Queretaro">Queretaro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>Bodega</Label>
                    <Input
                        name="bodega"
                        value={form.bodega}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <Label>Código Producto</Label>
                    <Input
                        name="codigo_producto"
                        value={form.codigo_producto}
                        onChange={handleChange}
                        required
                    />
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

                {/* Marca */}
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

                <div>
                    <Label>ID Proveedor</Label>
                    <Input
                        name="id_proveedor"
                        value={form.id_proveedor}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label>Nombre Proveedor</Label>
                    <Input
                        name="nombre_proveedor"
                        value={form.nombre_proveedor}
                        onChange={handleChange}
                    />
                </div>

                {/* Unidad de Medida */}
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
                        onClick={() => onSuccess()}
                    >
                        Cancelar
                    </Button>
                )}
            </div>
        </form>
    );
};
