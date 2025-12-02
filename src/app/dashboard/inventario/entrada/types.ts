// src/app/dashboard/inventario/entrada/types.ts
// Tipos basados en a_ingresos
"use client";

export interface Ingreso {
    id_entr: string;
    fecha_ing: string;
    auth_uid: string | null;
    correo: string | null;
    sucursal: string | null;
    codigo_producto: string;
    nombre_prod: string | null;
    descripcion_prod: string | null;
    unidad_medida: string | null;
    cantidad_ingreso: number;
    fecha_cad: string | null;
    nota: string | null;
}

// Datos para insertar un ingreso
export interface IngresoInsert {
    auth_uid: string;
    correo: string;
    sucursal: string;
    codigo_producto: string;
    nombre_prod?: string;
    descripcion_prod?: string;
    unidad_medida?: string;
    cantidad_ingreso: number;
    fecha_cad?: string | null;
    nota?: string | null;
}