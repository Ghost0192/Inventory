"use client"

import { useState } from "react"
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

interface UsuarioSearchProps {
    onSearch: (campo: string, valor: string) => void
}

export function UsuarioSearch({ onSearch }: UsuarioSearchProps) {
    const [filtro, setFiltro] = useState("nombre_completo")
    const [valor, setValor] = useState("")

    const handleBuscar = () => {
        if (!valor.trim()) return
        onSearch(filtro, valor)
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-4">
            <div className="w-full sm:w-40">
                <Label>Buscar por</Label>
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
                <Label>Valor</Label>
                <Input
                    placeholder="Ingrese valor..."
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                />
            </div>

            <Button className="mt-2 sm:mt-6 w-full sm:w-auto" onClick={handleBuscar}>
                Buscar
            </Button>
        </div>
    )
}
