"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"

interface UsuarioEditDialogProps {
    open: boolean
    onClose: () => void
    usuario: any
    onSave: (usuario: any) => void
}

export function UsuarioEditDialog({
    open,
    onClose,
    usuario,
    onSave,
}: UsuarioEditDialogProps) {
    if (!usuario) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <Label>Nombre completo</Label>
                    <Input
                        value={usuario.nombre_completo}
                        onChange={(e) =>
                            onSave({ ...usuario, nombre_completo: e.target.value })
                        }
                    />

                    <Label>Teléfono</Label>
                    <Input
                        value={usuario.telefono}
                        onChange={(e) => onSave({ ...usuario, telefono: e.target.value })}
                    />

                    <Label>Rol</Label>
                    <Select
                        onValueChange={(v) => onSave({ ...usuario, rol: v })}
                        defaultValue={usuario.rol}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="gerente">Gerente</SelectItem>
                            <SelectItem value="almacenista">Almacenista</SelectItem>
                            <SelectItem value="solicitante">Solicitante</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button onClick={() => onSave(usuario)}>Guardar</Button>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
