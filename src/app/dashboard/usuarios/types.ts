// app/dashboard/usuarios/types.ts

export interface Usuario {
    id?: number;
    auth_uid?: string;
    correo: string;
    password?: string;
    nombre_completo: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    telefono?: string;
    rol: "admin" | "gerente" | "almacenista" | "solicitante";
    sucursal?: string;
    activo?: boolean;
    creado_en?: string;
}
