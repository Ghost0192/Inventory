'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import AdminView from "./components/AdminView"
import AlmacenistaView from "./components/AlmacenistaView"

export default function DashboardPage() {
    const router = useRouter()
    const [perfil, setPerfil] = useState<{ nombre: string; rol: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPerfil = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/login")
                return
            }

            const { data, error } = await supabase
                .from("perfiles")
                .select("nombre, rol")
                .eq("id", session.user.id)
                .single()

            if (error || !data) {
                router.push("/login")
                return
            }

            setPerfil(data)
            setLoading(false)
        }

        fetchPerfil()
    }, [router])

    if (loading) return <p className="text-center mt-20">Cargando dashboard...</p>

    return (
        <div className="flex h-screen">
            <Sidebar rol={perfil!.rol} />
            <div className="flex-1 flex flex-col">
                <Header nombreUsuario={perfil!.nombre} />
                {perfil!.rol === "almacenista" ? <AlmacenistaView /> : <AdminView />}
            </div>
        </div>
    )
}
