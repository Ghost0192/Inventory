// src/app/dashboard/inventario/entrada/types.ts
// Tipos basados en a_ingresos

// Interfaz Ingreso (Lo que se lee de la DB)
export interface Ingreso {
    id_entr: string;
    fecha_ing: string;
    auth_uid: string | null;
    correo: string | null;
    sucursal: string | null;
    bodega: string | null; // AÑADIDO: Según esquema
    codigo_producto: string;
    nombre_prod: string | null;
    descripcion_prod: string | null;
    unidad_medida: string | null;
    cantidad_ingreso: number;
    marca: string | null; // AÑADIDO: Según esquema
    origen_prod: string | null; // AÑADIDO: Según esquema
    id_proveedor: string | null; // AÑADIDO: Según esquema
    nombre_proveedor: string | null; // AÑADIDO: Según esquema
    fecha_cad: string | null;
    nota: string | null;
}

// Datos para insertar un ingreso (payload para Supabase)
export interface IngresoInsert {
    auth_uid: string;
    correo: string;
    sucursal: string;
    bodega: string;
    codigo_producto: string;
    nombre_prod: string;
    descripcion_prod?: string | null; 
    unidad_medida?: string | null; 
    cantidad_ingreso: number;
    marca?: string | null;
    origen_prod?: string | null;
    id_proveedor?: string | null;
    nombre_proveedor?: string | null;
    fecha_cad?: string | null;
    nota?: string | null;
}

// Datos para editar un ingreso (similar a Ingreso, pero sin campos de timestamp automáticos)
export interface IngresoEdit {
    id_entr: string;
    fecha_ing: string; // Se mantiene por si se muestra
    auth_uid: string | null;
    correo: string | null;
    sucursal: string | null;
    bodega: string | null;
    codigo_producto: string;
    nombre_prod: string | null;
    descripcion_prod: string | null;
    unidad_medida: string | null;
    cantidad_ingreso: number;
    marca: string | null;
    origen_prod: string | null;
    id_proveedor: string | null;
    nombre_proveedor: string | null;
    fecha_cad: string | null;
    nota: string | null;
}