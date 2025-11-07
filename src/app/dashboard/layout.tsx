'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [perfil, setPerfil] = useState<{ nombre: string; rol: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPerfil = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const { data, error } = await supabase
                .from('perfiles')
                .select('nombre, rol')
                .eq('id', session.user.id)
                .single()

            if (error || !data) {
                router.push('/login')
                return
            }

            setPerfil(data)
            setLoading(false)
        }

        fetchPerfil()
    }, [router])

    if (loading) return <p className="text-center mt-20">Cargando dashboard...</p>

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar dinámico según rol */}
            <Sidebar role={perfil!.rol} />

            {/* Contenido principal */}
            <div className="flex flex-col flex-1">
                {/* Header con nombre del usuario */}
                <Header nombreUsuario={perfil!.nombre} nombre={''} />

                {/* Contenido dinámico (la vista actual) */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
