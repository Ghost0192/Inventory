// types.ts
"use client";

export interface Salida {
    id_salida: string;
    fecha_salida: string;
    auth_uid: string | null;
    correo: string | null;
    sucursal: string | null;
    codigo_producto: string;
    nombre_prod: string | null;
    unidad_medida: string | null;
    cantidad_salida: number;
    nota?: string | null;
}

// Datos para insertar una salida
export interface SalidaInsert {
    auth_uid: string;
    correo: string;
    sucursal: string;
    codigo_producto: string;
    nombre_prod?: string;
    unidad_medida?: string;
    cantidad_salida: number;
    nota?: string | null;
}
