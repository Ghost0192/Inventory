"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<any[]>([])
    const [filtro, setFiltro] = useState("nombre_completo")
    const [busqueda, setBusqueda] = useState("")

    const [form, setForm] = useState({
        correo: "",
        nombre_completo: "",
        apellido_paterno: "",
        apellido_materno: "",
        telefono: "",
        tipo_usuario: "",
    })

    const [editUser, setEditUser] = useState<any | null>(null)
    const [deleteUser, setDeleteUser] = useState<any | null>(null)

    // 🔹 Cargar usuarios
    async function fetchUsuarios() {
        const { data, error } = await supabase.from("usuarios").select(`
      id, correo, nombre_completo, telefono, activo,
      perfil_usuario (tipo_usuario),
      locacion (pais, comuna_ubicacion)
    `)
        if (!error && data) setUsuarios(data)
    }

    useEffect(() => {
        fetchUsuarios()
    }, [])

    // 🔍 Buscar usuarios
    async function handleBuscar() {
        const { data, error } = await supabase
            .from("usuarios")
            .select(`
        id, correo, nombre_completo, telefono, activo,
        perfil_usuario (tipo_usuario),
        locacion (pais, comuna_ubicacion)
      `)
            .ilike(filtro, `%${busqueda}%`)

        if (!error && data) setUsuarios(data)
    }

    // 🧾 Guardar usuario
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const { error } = await supabase.from("usuarios").insert([form])
        if (!error) {
            setForm({
                correo: "",
                nombre_completo: "",
                apellido_paterno: "",
                apellido_materno: "",
                telefono: "",
                tipo_usuario: "",
            })
            fetchUsuarios()
        } else {
            console.error(error)
        }
    }

    // ✏️ Actualizar usuario (FIXED)
    async function handleUpdate() {
        if (!editUser) return

        const { error } = await supabase
            .from("usuarios")
            .update({
                correo: editUser.correo,
                nombre_completo: editUser.nombre_completo,
                telefono: editUser.telefono,
            })
            .eq("id", editUser.id)

        if (error) {
            console.error("Error al actualizar:", error)
            return
        }

        setEditUser(null)
        await fetchUsuarios()
    }

    // ❌ Eliminar usuario
    async function handleDelete() {
        if (!deleteUser) return
        const { error } = await supabase.from("usuarios").delete().eq("id", deleteUser.id)
        if (!error) {
            setDeleteUser(null)
            fetchUsuarios()
        }
    }

    return (
        <div className="space-y-8">
            {/* ======================= FORMULARIO ======================= */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Agregar nuevo usuario</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        <div>
                            <Label>Correo</Label>
                            <Input
                                value={form.correo}
                                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <Label>Nombre completo</Label>
                            <Input
                                value={form.nombre_completo}
                                onChange={(e) =>
                                    setForm({ ...form, nombre_completo: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div>
                            <Label>Apellido paterno</Label>
                            <Input
                                value={form.apellido_paterno}
                                onChange={(e) =>
                                    setForm({ ...form, apellido_paterno: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label>Apellido materno</Label>
                            <Input
                                value={form.apellido_materno}
                                onChange={(e) =>
                                    setForm({ ...form, apellido_materno: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <Label>Teléfono</Label>
                            <Input
                                value={form.telefono}
                                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Tipo de usuario</Label>
                            <Select
                                onValueChange={(v) => setForm({ ...form, tipo_usuario: v })}
                                defaultValue={form.tipo_usuario}
                            >
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
                        <div className="sm:col-span-2 lg:col-span-3 flex justify-end mt-4">
                            <Button type="submit" className="w-full sm:w-auto">
                                Guardar usuario
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* ======================= TABLA (Desktop) ======================= */}
            <Card className="shadow-sm hidden sm:block">
                <CardHeader>
                    <CardTitle>Administrar Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* 🔍 Buscador */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
                        <div className="w-full sm:w-40">
                            <Label>Tipo de búsqueda</Label>
                            <Select onValueChange={setFiltro} defaultValue={filtro}>
                                <SelectTrigger className="w-full">
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
                            <Label>Buscar</Label>
                            <Input
                                placeholder="Ingrese valor a buscar..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>
                        <Button className="mt-2 sm:mt-6 w-full sm:w-auto" onClick={handleBuscar}>
                            Buscar
                        </Button>
                    </div>

                    {/* 🧾 Tabla de usuarios */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-[800px] text-sm text-gray-700">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700 text-left">
                                    <th className="px-4 py-2">Nombre</th>
                                    <th className="px-4 py-2">Correo</th>
                                    <th className="px-4 py-2">Teléfono</th>
                                    <th className="px-4 py-2">Perfil</th>
                                    <th className="px-4 py-2">Ubicación</th>
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
                                        <td className="px-4 py-2">
                                            {u.perfil_usuario?.tipo_usuario}
                                        </td>
                                        <td className="px-4 py-2">
                                            {u.locacion?.pais} - {u.locacion?.comuna_ubicacion}
                                        </td>
                                        <td className="px-4 py-2">
                                            {u.activo ? (
                                                <span className="text-green-600 font-medium">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="text-red-600 font-medium">
                                                    Inactivo
                                                </span>
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
                </CardContent>
            </Card>

            {/* ======================= LISTA MÓVIL (Cards) ======================= */}
            <div className="sm:hidden space-y-4">
                {usuarios.map((u) => (
                    <Card key={u.id} className="shadow-md border border-gray-200">
                        <CardContent className="p-4 space-y-2">
                            <p className="text-sm font-semibold">{u.nombre_completo}</p>
                            <p className="text-xs text-gray-500">{u.correo}</p>
                            <p className="text-xs">{u.telefono}</p>
                            <p className="text-xs text-gray-500">
                                {u.perfil_usuario?.tipo_usuario || "Sin rol"}
                            </p>
                            <div className="flex justify-between pt-2">
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
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ======================= MODAL EDITAR ======================= */}
            <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                    </DialogHeader>
                    {editUser && (
                        <div className="space-y-3">
                            <Label>Nombre</Label>
                            <Input
                                value={editUser.nombre_completo}
                                onChange={(e) =>
                                    setEditUser({ ...editUser, nombre_completo: e.target.value })
                                }
                            />
                            <Label>Correo</Label>
                            <Input
                                value={editUser.correo}
                                onChange={(e) =>
                                    setEditUser({ ...editUser, correo: e.target.value })
                                }
                            />
                            <Label>Teléfono</Label>
                            <Input
                                value={editUser.telefono}
                                onChange={(e) =>
                                    setEditUser({ ...editUser, telefono: e.target.value })
                                }
                            />
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
                        <DialogTitle>
                            ¿Seguro que deseas eliminar este usuario?
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-500">
                        Esta acción no se puede deshacer.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteUser(null)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
