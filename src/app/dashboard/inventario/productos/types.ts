// Read Tabla Productos desde la BD
"use client";

// Definición de la interfaz Producto
export interface Producto {
    id_prod: string;
    fecha_reg: string;
    auth_uid: string;
    correo: string;
    sucursal: string;
    bodega: string;
    codigo_producto: string;
    nombre_prod: string;
    descripcion_prod?: string;
    marca_prod?: string;
    origen_prod?: string;
    categoria_prod?: string;
    id_proveedor?: string;
    nombre_proveedor?: string;
    unidad_medida?: string;
    stock_min?: number;
    activo?: boolean;
}

// Datos mínimos para INSERTAR un producto nuevo
export interface ProductoInsert {
    auth_uid: string;
    correo: string;
    sucursal: string;
    bodega: string;
    nombre_prod: string;
    descripcion_prod?: string;
    marca_prod?: string;
    origen_prod?: string;
    categoria_prod?: string;
    nombre_proveedor?: string;
    unidad_medida?: string;
    stock_min?: number;
    activo?: boolean;
}
