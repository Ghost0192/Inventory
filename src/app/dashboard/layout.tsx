'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [perfil, setPerfil] = useState<{ nombre: string; correo: string; rol: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPerfil = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const { data, error } = await supabase
                .from('a_usuarios')
                .select('nombre_completo, correo, rol')
                .eq('auth_uid', session.user.id)
                .single()

            if (error || !data) {
                router.push('/login')
                return
            }

            setPerfil({
                nombre: data.nombre_completo,
                correo: data.correo,
                rol: data.rol,
            })
            setLoading(false)
        }

        fetchPerfil()
    }, [router])

    if (loading) return <p className="text-center mt-20">Cargando dashboard...</p>

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={perfil!.rol} />
            <div className="flex flex-col flex-1">
                {/* 👇 Aquí pasamos nombre completo y correo */}
                <Header nombreCompleto={perfil!.nombre} correo={perfil!.correo} />

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
