//src/app/dashboard/inventario/productos/types.ts
//Read Tabla Productos desde la BD
"use client";

// Definición de la interfaz Producto
export interface Producto {
    id_prod: string;
    fecha_reg: string;
    auth_uid: string | null;
    correo: string | null;
    sucursal: string | null;
    codigo_producto: string;
    nombre_prod: string;
    descripcion_prod?: string | null;
    categoria_prod?: string | null;
    unidad_medida?: string | null;
    stock_min?: number | null;
    activo?: boolean | null;
}

// Datos mínimos para INSERTAR un producto nuevo
export interface ProductoInsert {
    auth_uid: string;
    correo: string;
    sucursal: string;
    nombre_prod: string;
    descripcion_prod?: string;
    categoria_prod?: string;
    unidad_medida?: string;
    stock_min?: number;
    activo?: boolean;
}

// Editar un producto existente
export interface ProductoEditar {
    id_prod: string;
    fecha_reg: string;
    auth_uid: string | null;
    correo: string | null;
    sucursal: string | null;
    codigo_producto: string;
    nombre_prod: string;
    descripcion_prod?: string | null;
    categoria_prod?: string | null;
    unidad_medida?: string | null;
    stock_min?: number | null;
    activo?: boolean | null;
}