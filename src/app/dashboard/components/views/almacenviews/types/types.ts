//src/app/dashboard/components/views/almacenviews/types/types.ts
// Tipo de dato para stock general
export interface StockGeneral {
    codigo_producto: string;
    nombre_prod: string;
    total_ingresos: number;
    total_salidas: number;
    stock_disponible: number;
    estado_stock: string;
}

// Tipo de dato para productos próximos a caducar
export interface ProductoProximoCaducar {
    codigo_producto: string;
    nombre_prod: string;
    fecha_cad: string; // o Date si tu RPC retorna Date
    dias_restantes: number;
}