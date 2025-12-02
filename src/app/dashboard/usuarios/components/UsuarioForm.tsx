//src/app/dashboard/usuarios/components/UsuarioForm.tsx
"use client";

import { useState } from "react";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsuarioForm({ onSubmit, loading }: { onSubmit: (form: any) => void, loading: boolean }) {
    const [form, setForm] = useState({
        correo: "",
        password: "",
        nombre_completo: "",
        apellido_paterno: "",
        apellido_materno: "",
        telefono: "",
        rol: "solicitante",
        sucursal: "",
    });

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Crear / Editar Usuario</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <Select value={form.rol} onValueChange={v => setForm({ ...form, rol: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
                        <Select value={form.sucursal} onValueChange={v => setForm({ ...form, sucursal: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Hijuelas">Hijuelas</SelectItem>
                                <SelectItem value="Osorno">Osorno</SelectItem>
                                <SelectItem value="Queretaro">Queretaro</SelectItem>
                                <SelectItem value="ICA">ICA</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button disabled={loading} onClick={() => onSubmit(form)}>{loading ? "Guardando..." : "Guardar usuario"}</Button>
            </CardFooter>
        </Card>
    );
}
