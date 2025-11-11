"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UsuarioDeleteDialogProps {
    open: boolean
    onClose: () => void
    usuario: any
    onConfirm: () => void
}

export function UsuarioDeleteDialog({
    open,
    onClose,
    usuario,
    onConfirm,
}: UsuarioDeleteDialogProps) {
    if (!usuario) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>¿Eliminar usuario?</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-600">
                    ¿Seguro que deseas eliminar a <strong>{usuario.nombre_completo}</strong>?<br />
                    Esta acción no se puede deshacer.
                </p>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Eliminar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
