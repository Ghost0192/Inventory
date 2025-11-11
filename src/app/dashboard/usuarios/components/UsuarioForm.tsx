"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { UsuarioFormData } from "../types"

export default function UsuarioForm({ onSubmit }: { onSubmit: (data: UsuarioFormData) => Promise<void> | void }) {
    const [form, setForm] = useState<UsuarioFormData>({
        correo: "",
        password: "",
        nombre_completo: "",
        apellido_paterno: "",
        apellido_materno: "",
        telefono: "",
        rol: "solicitante",
        sucursal: "",
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        await onSubmit(form)
        setForm({ correo: "", password: "", nombre_completo: "", apellido_paterno: "", apellido_materno: "", telefono: "", rol: "solicitante", sucursal: "" })
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <Label>Correo</Label>
                <Input value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} required />
            </div>
            <div>
                <Label>Contraseña</Label>
                <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
                <Label>Nombre completo</Label>
                <Input value={form.nombre_completo} onChange={e => setForm({ ...form, nombre_completo: e.target.value })} required />
            </div>
            <div>
                <Label>Apellido paterno</Label>
                <Input value={form.apellido_paterno} onChange={e => setForm({ ...form, apellido_paterno: e.target.value })} />
            </div>
            <div>
                <Label>Apellido materno</Label>
                <Input value={form.apellido_materno} onChange={e => setForm({ ...form, apellido_materno: e.target.value })} />
            </div>
            <div>
                <Label>Teléfono</Label>
                <Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
                <Label>Rol</Label>
                <Select onValueChange={v => setForm({ ...form, rol: v as any })} defaultValue={form.rol}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="gerente">Gerente</SelectItem>
                        <SelectItem value="almacenista">Almacenista</SelectItem>
                        <SelectItem value="solicitante">Solicitante</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Sucursal</Label>
                <Input value={form.sucursal} onChange={e => setForm({ ...form, sucursal: e.target.value })} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end mt-4">
                <Button type="submit" className="w-full sm:w-auto">Guardar usuario</Button>
            </div>
        </form>
    )
}
