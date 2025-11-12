export interface Producto {
    id_prod: string;
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
    sucursal?: string;
    bodega?: string;
    activo?: boolean;
}
