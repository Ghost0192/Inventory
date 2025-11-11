export interface Usuario {
    id: string;
    auth_uid: string;
    correo: string;
    nombre_completo: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    telefono?: string;
    rol: "admin" | "gerente" | "almacenista" | "solicitante";
    sucursal?: string;
    activo: boolean;
    creado_en: string;
}

export interface UsuarioFormData {
    correo: string;
    password: string;
    nombre_completo: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    telefono?: string;
    rol: "admin" | "gerente" | "almacenista" | "solicitante";
    sucursal?: string;
}
