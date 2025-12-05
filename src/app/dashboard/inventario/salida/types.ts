// src/app/dashboard/inventario/salida/types.ts
"use client";

export interface Salida {
    id_salida: string;
    fecha_salida: string;
    auth_uid: string | null;
    correo: string | null;
    sucursal: string | null;
    codigo_producto: string;
    nombre_prod: string | null;
    descripcion_prod: string | null;
    area_destino: string | null;
    numero_documento: string | null;
    unidad_medida: string | null;
    cantidad_salida: number;
    nota?: string | null;
}

// Datos para insertar una salida
export interface SalidaInsert {
    id_salida: string;
    fecha_salida: string;
    auth_uid: string;
    correo: string;
    sucursal: string;
    codigo_producto: string;
    nombre_prod: string;
    descripcion_prod: string;
    area_destino: string;
    numero_documento: string;
    unidad_medida: string;
    cantidad_salida: number;
    nota: string | null;
}
