"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<any[]>([])
    const [busqueda, setBusqueda] = useState("")
    const [filtro, setFiltro] = useState("nombre_completo")
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        correo: "",
        password: "",
        nombre_completo: "",
        apellido_paterno: "",
        apellido_materno: "",
        telefono: "",
        rol: "solicitante",
        sucursal: "",
    })

    const [editUser, setEditUser] = useState<any | null>(null)
    const [deleteUser, setDeleteUser] = useState<any | null>(null)

    // 🔹 Cargar usuarios
    async function fetchUsuarios() {
        const { data, error } = await supabase
            .from("a_usuarios")
            .select("id, correo, nombre_completo, telefono, rol, sucursal, activo, creado_en")

        if (!error && data) setUsuarios(data)
    }

    useEffect(() => {
        fetchUsuarios()
    }, [])

    // 🔍 Buscar usuarios
    async function handleBuscar() {
        const { data, error } = await supabase
            .from("a_usuarios")
            .select("id, correo, nombre_completo, telefono, rol, sucursal, activo, creado_en")
            .ilike(filtro, `%${busqueda}%`)

        if (!error && data) setUsuarios(data)
    }

    // 🧾 Registrar usuario nuevo
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            if (!form.correo || !form.password || !form.nombre_completo) {
                alert("Por favor, completa todos los campos requeridos.")
                setLoading(false)
                return
            }

            // 1️⃣ Crear usuario en Auth
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: form.correo,
                password: form.password,
                options: {
                    data: { full_name: form.nombre_completo },
                },
            })
            if (signUpError) throw signUpError

            const auth_uid = data.user?.id
            if (!auth_uid) throw new Error("No se pudo crear el usuario en auth.")

            // 2️⃣ Insertar usuario en tu tabla personalizada (sin contraseña)
            const { error: insertError } = await supabase.from("a_usuarios").insert({
                auth_uid,
                correo: form.correo,
                nombre_completo: form.nombre_completo,
                apellido_paterno: form.apellido_paterno,
                apellido_materno: form.apellido_materno,
                telefono: form.telefono,
                rol: form.rol,
                sucursal: form.sucursal,
            })
            if (insertError) throw insertError

            // 3️⃣ Resetear formulario y recargar usuarios
            setForm({
                correo: "",
                password: "",
                nombre_completo: "",
                apellido_paterno: "",
                apellido_materno: "",
                telefono: "",
                rol: "solicitante",
                sucursal: "",
            })
            fetchUsuarios()
            alert("✅ Usuario creado exitosamente.")
        } catch (err) {
            console.error(err)
            alert("❌ Error al crear usuario: " + (err as any).message)
        } finally {
            setLoading(false)
        }
    }


    // ✏️ Actualizar usuario
    async function handleUpdate() {
        if (!editUser) return
        const { error } = await supabase
            .from("a_usuarios")
            .update({
                nombre_completo: editUser.nombre_completo,
                telefono: editUser.telefono,
                rol: editUser.rol,
                sucursal: editUser.sucursal,
                activo: editUser.activo,
            })
            .eq("id", editUser.id)

        if (error) {
            alert("Error al actualizar usuario.")
        } else {
            setEditUser(null)
            fetchUsuarios()
        }
    }

    // ❌ Eliminar usuario
    async function handleDelete() {
        if (!deleteUser) return
        const { error } = await supabase.from("a_usuarios").delete().eq("id", deleteUser.id)
        if (error) alert("Error al eliminar usuario.")
        else {
            setDeleteUser(null)
            fetchUsuarios()
        }
    }

    return (
        <div className="space-y-8 p-2 sm:p-4">
            {/* ======================= FORMULARIO ======================= */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Registrar nuevo usuario</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        <div>
                            <Label>Correo electrónico*</Label>
                            <Input
                                type="email"
                                value={form.correo}
                                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label>Contraseña*</Label>
                            <Input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label>Nombre completo*</Label>
                            <Input
                                value={form.nombre_completo}
                                onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label>Apellido paterno</Label>
                            <Input
                                value={form.apellido_paterno}
                                onChange={(e) => setForm({ ...form, apellido_paterno: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Apellido materno</Label>
                            <Input
                                value={form.apellido_materno}
                                onChange={(e) => setForm({ ...form, apellido_materno: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Teléfono</Label>
                            <Input
                                type="tel"
                                placeholder="10 dígitos"
                                value={form.telefono}
                                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Rol</Label>
                            <Select onValueChange={(v) => setForm({ ...form, rol: v })} value={form.rol}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
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
                            <Select onValueChange={(v) => setForm({ ...form, sucursal: v })} value={form.sucursal}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una sucursal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hijuelas">Hijuelas</SelectItem>
                                    <SelectItem value="Osorno">Osorno</SelectItem>
                                    <SelectItem value="Queretaro">Queretaro</SelectItem>
                                    <SelectItem value="ICA">ICA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3 flex justify-end mt-4">
                            <Button
                                type="submit"
                                className="w-full sm:w-auto"
                                disabled={loading}
                            >
                                {loading ? "Guardando..." : "Guardar usuario"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* ======================= TABLA ======================= */}
            <CardContent>
                {/* 🔍 Buscador */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
                    <div className="w-full sm:w-40">
                        <Label>Buscar por</Label>
                        <Select onValueChange={setFiltro} value={filtro}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Button className="mt-2 sm:mt-6 w-full sm:w-auto" onClick={handleBuscar}>
                        Buscar
                    </Button>
                </div>

                {/* 🧾 Vista responsive */}
                <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
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
                            {usuarios.map((u) => (
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
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditUser(u)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setDeleteUser(u)}
                                        >
                                            Eliminar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 📱 Vista en tarjetas (móvil) */}
                <div className="sm:hidden space-y-3">
                    {usuarios.map((u) => (
                        <div
                            key={u.id}
                            className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-2"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800">{u.nombre_completo}</h3>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${u.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {u.activo ? "Activo" : "Inactivo"}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600">
                                <strong>Correo:</strong> {u.correo}
                            </p>
                            {u.telefono && (
                                <p className="text-sm text-gray-600">
                                    <strong>Tel:</strong> {u.telefono}
                                </p>
                            )}
                            <p className="text-sm text-gray-600">
                                <strong>Rol:</strong> {u.rol}
                            </p>
                            {u.sucursal && (
                                <p className="text-sm text-gray-600">
                                    <strong>Sucursal:</strong> {u.sucursal}
                                </p>
                            )}

                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditUser(u)}
                                >
                                    Editar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setDeleteUser(u)}
                                >
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            {/* ======================= MODAL EDITAR ======================= */}
            <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                    </DialogHeader>
                    {editUser && (
                        <div className="space-y-3">
                            <Label>Nombre completo</Label>
                            <Input
                                value={editUser.nombre_completo}
                                onChange={(e) => setEditUser({ ...editUser, nombre_completo: e.target.value })}
                            />
                            <Label>Teléfono</Label>
                            <Input
                                value={editUser.telefono}
                                onChange={(e) => setEditUser({ ...editUser, telefono: e.target.value })}
                            />
                            <Label>Rol</Label>
                            <Select
                                onValueChange={(v) => setEditUser({ ...editUser, rol: v })}
                                value={editUser.rol}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="gerente">Gerente</SelectItem>
                                    <SelectItem value="almacenista">Almacenista</SelectItem>
                                    <SelectItem value="solicitante">Solicitante</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleUpdate}>Guardar cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ======================= MODAL ELIMINAR ======================= */}
            <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Seguro que deseas eliminar este usuario?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
