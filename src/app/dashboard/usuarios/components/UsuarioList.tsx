"use client"

import { Button } from "@/components/ui/button"
import type { Usuario } from "../types"

export default function UsuarioList({
    usuarios,
    onEdit,
    onDelete,
}: {
    usuarios: Usuario[]
    onEdit: (u: Usuario) => void
    onDelete: (u: Usuario) => void
}) {
    return (
        <div>
            {/* 🖥️ Vista de escritorio */}
            <div className="hidden md:block overflow-x-auto rounded-lg border">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2">Nombre</th>
                            <th className="px-4 py-2">Correo</th>
                            <th className="px-4 py-2">Rol</th>
                            <th className="px-4 py-2">Sucursal</th>
                            <th className="px-4 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(u => (
                            <tr key={u.id} className="border-b">
                                <td className="px-4 py-2">{u.nombre_completo}</td>
                                <td className="px-4 py-2">{u.correo}</td>
                                <td className="px-4 py-2">{u.rol}</td>
                                <td className="px-4 py-2">{u.sucursal}</td>
                                <td className="px-4 py-2">
                                    <Button size="sm" variant="outline" onClick={() => onEdit(u)}>Editar</Button>
                                    <Button size="sm" variant="destructive" onClick={() => onDelete(u)} className="ml-2">Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 📱 Vista móvil */}
            <div className="grid md:hidden gap-3">
                {usuarios.map(u => (
                    <div key={u.id} className="p-4 border rounded-lg bg-white shadow-sm">
                        <h3 className="font-semibold">{u.nombre_completo}</h3>
                        <p className="text-sm text-gray-600">{u.correo}</p>
                        <p className="text-sm">Rol: {u.rol}</p>
                        <p className="text-sm">Sucursal: {u.sucursal}</p>
                        <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => onEdit(u)}>Editar</Button>
                            <Button size="sm" variant="destructive" onClick={() => onDelete(u)}>Eliminar</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
