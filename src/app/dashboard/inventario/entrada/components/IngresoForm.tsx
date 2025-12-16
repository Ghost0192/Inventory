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
// CORRECCIÓN: Importar Ingreso para la prop de edición
import { IngresoInsert, Ingreso } from "../types"; 

// Estado inicial limpio del formulario (sin campos de usuario)
const initialFormState: Omit<IngresoInsert, 'auth_uid' | 'correo'> = {
    sucursal: "",
    bodega: "",
    codigo_producto: "",
    nombre_prod: "",
    descripcion_prod: null, // Tipo null para campos opcionales de la DB
    unidad_medida: null, // Tipo null para campos opcionales de la DB
    cantidad_ingreso: 0,
    marca: null,
    origen_prod: null,
    id_proveedor: null,
    nombre_proveedor: null,
    fecha_cad: null,
    nota: null,
};

// Función auxiliar para formatear una fecha a YYYY-MM-DD para el input[type="date"]
const formatDateToInput = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch {
        return "";
    }
};


interface Props {
    onSuccess: () => void;
    // CORRECCIÓN 1: Agregar la prop 'ingreso' para el modo edición
    ingreso?: Ingreso; 
}

export const IngresoForm: React.FC<Props> = ({ onSuccess, ingreso }) => { // Recibir 'ingreso'
    
    // Inicializar el estado (será sobreescrito por useEffect si 'ingreso' existe)
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

    // Efecto 2: Cargar datos si estamos en modo edición (al cambiar 'ingreso')
    useEffect(() => {
        if (ingreso) {
            // Mapear el Ingreso (que puede tener nulls) al formulario
            setForm(prev => ({
                ...prev,
                auth_uid: ingreso.auth_uid ?? prev.auth_uid,
                correo: ingreso.correo ?? prev.correo,
                sucursal: ingreso.sucursal ?? "",
                bodega: ingreso.bodega ?? "",
                codigo_producto: ingreso.codigo_producto,
                nombre_prod: ingreso.nombre_prod ?? "",
                descripcion_prod: ingreso.descripcion_prod ?? null,
                unidad_medida: ingreso.unidad_medida ?? null,
                cantidad_ingreso: ingreso.cantidad_ingreso,
                marca: ingreso.marca ?? null,
                origen_prod: ingreso.origen_prod ?? null,
                id_proveedor: ingreso.id_proveedor ?? null,
                nombre_proveedor: ingreso.nombre_proveedor ?? null,
                // CORRECCIÓN: Formatear la fecha para input type="date"
                fecha_cad: formatDateToInput(ingreso.fecha_cad) || null,
                nota: ingreso.nota ?? null,
            }));
        } else {
            // Limpiar formulario para nueva inserción, manteniendo datos de usuario
            setForm(prev => ({
                ...prev,
                ...initialFormState,
            }));
        }
    }, [ingreso]);

    // Buscar producto por código
    const buscarProducto = async (codigo: string) => {
        if (!codigo) return;
        // CORRECCIÓN 4: Asegurar que la búsqueda se haga en mayúsculas
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
        const { name, value } = e.target; // Eliminamos 'type' de la desestructuración

        setForm(prev => {
            let newValue: string | number | null = value;

            if (name === "cantidad_ingreso") {
                newValue = value === "" ? 0 : Number(value);
            } else if (name === "fecha_cad") {
                // CORRECCIÓN 3: Si la fecha está vacía, se guarda como null
                newValue = value === "" ? null : value;
            } else {
                // Convertir a mayúsculas y guardar null si está vacío
                newValue = value.trim() === "" ? null : value.toUpperCase();
            }

            return {
                ...prev,
                [name]: newValue,
            } as IngresoInsert; // Forzar el tipo aquí ayuda con la coherencia
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
        
        // Función auxiliar para asegurar que las cadenas vacías se conviertan a null
        const cleanString = (val: string | null | undefined): string | null => 
            (val && val.trim() !== "") ? val.trim().toUpperCase() : null;

        // Utilizamos los campos obligatorios del form y limpiamos los opcionales
        return {
            auth_uid: form.auth_uid,
            correo: form.correo,
            sucursal: form.sucursal.toUpperCase(),
            bodega: form.bodega.toUpperCase(),
            codigo_producto: form.codigo_producto.toUpperCase(),
            nombre_prod: form.nombre_prod.toUpperCase(),
            cantidad_ingreso: Number(form.cantidad_ingreso),
            
            // Campos opcionales: Usamos la función auxiliar y el tipo corregido permite el resultado (string | null)
            descripcion_prod: cleanString(form.descripcion_prod),
            unidad_medida: cleanString(form.unidad_medida),
            marca: cleanString(form.marca),
            origen_prod: cleanString(form.origen_prod),
            id_proveedor: cleanString(form.id_proveedor),
            nombre_proveedor: cleanString(form.nombre_proveedor),
            nota: cleanString(form.nota),
            fecha_cad: form.fecha_cad === "" ? null : form.fecha_cad, // Ya manejado en handleChange
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

            // LÓGICA DE INSERCIÓN/ACTUALIZACIÓN
            if (ingreso) {
                // Modo Edición: Usar update
                const { error } = await supabase.from("a_ingresos")
                    .update(payload)
                    .eq('id_entr', ingreso.id_entr);
                
                if (error) throw error;
                setModalMessage("La entrada fue actualizada correctamente.");

            } else {
                // Modo Inserción: Usar insert
                const { error } = await supabase.from("a_ingresos").insert(payload);
                if (error) throw error;

                setModalMessage("La entrada fue registrada correctamente.");
            }
            
            setShowSuccess(true);
            
            // Limpiar solo si fue inserción
            if (!ingreso) {
                setForm(prev => ({ ...prev, ...initialFormState }));
            }

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
    
    // CORRECCIÓN 2: Lógica del QR separada
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
                    {ingreso ? `Editar Entrada ${ingreso.id_entr}` : "Registrar Nueva Entrada"}
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
                            disabled={!!ingreso} // Deshabilitar edición en modo edición
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
                            disabled={!!ingreso} // Deshabilitar edición en modo edición
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
                                disabled={!!ingreso} // Deshabilitar edición en modo edición
                            />
                            <Button
                                type="button"
                                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                onClick={() => setOpenQr(true)}
                                disabled={!!ingreso || openQr} // Deshabilitar si ya está abierto
                            >
                                📷
                            </Button>
                        </div>
                        <QrScannerModal
                            open={openQr}
                            onClose={() => setOpenQr(false)}
                            onResult={handleQrResult} // Usamos la función corregida
                            title="Escanea un producto"
                        />
                    </div>

                    {/* Nombre Producto */}
                    <div>
                        <Label>Nombre Producto</Label>
                        <Input 
                            name="nombre_prod" 
                            value={form.nombre_prod} 
                            onChange={handleChange}
                            disabled={true} // Asumimos que no se debe cambiar el producto en un ingreso hecho
                            required
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <Label>Descripción</Label>
                        <Input 
                            name="descripcion_prod" 
                            value={form.descripcion_prod ?? ""} // Usar ?? "" para el input
                            onChange={handleChange} 
                            disabled={true}
                            
                        />
                    </div>

                    {/* Unidad de Medida */}
                    <div>
                        <Label>Unidad de Medida</Label>
                        <Input 
                            name="unidad_medida" 
                            value={form.unidad_medida ?? ""} 
                            onChange={handleChange} 
                            disabled={true}
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
                            // CORRECCIÓN: Usamos ?? "" para que el input type="date" funcione si es null
                            value={form.fecha_cad ?? ""} 
                            onChange={handleChange}
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
                        {loading 
                            ? (ingreso ? "Actualizando..." : "Guardando...") 
                            : (ingreso ? "Actualizar Entrada" : "Registrar Entrada")
                        }
                    </Button>
                </div>
            </form>
        </>
    );
};