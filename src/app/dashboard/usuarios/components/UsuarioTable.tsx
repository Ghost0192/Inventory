//src/app/dashboard/usuarios/components/UsuarioTable.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    Label,
    Input,
    Button,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

interface Usuario {
    id: string;
    correo: string;
    nombre_completo: string;
    telefono: string;
    rol: string;
    sucursal: string;
    activo: boolean;
    creado_en: string;
}

interface UsuarioTableProps {
    usuarios: Usuario[];
    onEdit: (usuario: Usuario) => void;
    onDelete: (usuario: Usuario) => void;
}

export default function UsuarioTable({ usuarios, onEdit, onDelete }: UsuarioTableProps) {
    const [filtro, setFiltro] = useState("nombre_completo");
    const [busqueda, setBusqueda] = useState("");
    const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>(usuarios);

    useEffect(() => {
        setUsuariosFiltrados(
            usuarios.filter((u) => {
                const valor = busqueda.toLowerCase();
                switch (filtro) {
                    case "nombre_completo":
                        return u.nombre_completo.toLowerCase().includes(valor);
                    case "correo":
                        return u.correo.toLowerCase().includes(valor);
                    case "telefono":
                        return u.telefono.toLowerCase().includes(valor);
                    default:
                        return true;
                }
            })
        );
    }, [busqueda, filtro, usuarios]);

    return (
        <Card className="mt-4 shadow-sm">
            <CardContent>
                {/* 🔍 Buscador */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
                    <div className="w-full sm:w-40">
                        <Label>Buscar por</Label>
                        <Select onValueChange={setFiltro} value={filtro}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nombre_completo">Nombre</SelectItem>
                                <SelectItem value="correo">Correo</SelectItem>
                                <SelectItem value="telefono">Teléfono</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <Label>Valor</Label>
                        <Input
                            placeholder="Ingrese valor..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                {/* 🧾 Tabla */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-[800px] text-sm text-gray-700">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-4 py-2">Nombre</th>
                                <th className="px-4 py-2">Correo</th>
                                <th className="px-4 py-2">Teléfono</th>
                                <th className="px-4 py-2">Rol</th>
                                <th className="px-4 py-2">Sucursal</th>
                                <th className="px-4 py-2">Activo</th>
                                <th className="px-4 py-2 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosFiltrados.map((u) => (
                                <tr key={u.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">{u.nombre_completo}</td>
                                    <td className="px-4 py-2">{u.correo}</td>
                                    <td className="px-4 py-2">{u.telefono}</td>
                                    <td className="px-4 py-2">{u.rol}</td>
                                    <td className="px-4 py-2">{u.sucursal}</td>
                                    <td className="px-4 py-2">
                                        {u.activo ? (
                                            <span className="text-green-600 font-medium">Activo</span>
                                        ) : (
                                            <span className="text-red-600 font-medium">Inactivo</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 flex gap-2 justify-center">
                                        <Button variant="outline" size="sm" onClick={() => onEdit(u)}>
                                            Editar
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => onDelete(u)}>
                                            Eliminar
                                        </Button>

                                    </td>
                                </tr>
                            ))}
                            {usuariosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-gray-500">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
