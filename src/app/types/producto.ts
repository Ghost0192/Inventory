// src/types/producto.ts
export interface Producto {
    id: number;
    nombre_prod: string;
    descripcion?: string;
    precio: number;
    categoria?: string;        // Si tienes un campo de categoría
    stock: number;             // Si tienes un campo de cantidad disponible
    fecha_creacion: string;    // Si tienes un campo de fecha de creación
}
