'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export default function LoginPage() {
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // 🔹 Verifica si hay sesión activa al cargar la página
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                router.push("/dashboard")
            }
        })
    }, [router])

    // 🔹 Manejo de login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        setLoading(false)

        if (error) {
            setError(error.message)
        } else {
            router.push("/dashboard")
        }
    }

    return (
        <div
            className="flex min-h-screen items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/bgg/msgrad_e.png')" }}
        >
            <form
                onSubmit={handleLogin}
                className="backdrop-blur-md bg-white/20 p-8 rounded-xl shadow-xl w-full max-w-md border border-white/30"
            >
                {/* 🔹 Logo superior opcional */}
                <div className="flex justify-center mb-6">
                    <Image
                        src="/assets/logos/gh_logo.png"
                        alt="Logo Grupo Hijuelas"
                        width={60}
                        height={60}
                        className="rounded-md"
                    />
                </div>

                <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-md">
                    Iniciar Sesión
                </h2>

                <div className="mb-4">
                    <Label htmlFor="email" className="text-white">Correo electrónico</Label>
                    <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        required
                        className="mt-1 bg-white/40 text-gray-900 placeholder-gray-700 border border-white/30 focus:border-white/60"
                    />
                </div>

                <div className="mb-6">
                    <Label htmlFor="password" className="text-white">Contraseña</Label>
                    <Input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        required
                        className="mt-1 bg-white/40 text-gray-900 placeholder-gray-700 border border-white/30 focus:border-white/60"
                    />
                </div>

                {error && <p className="text-red-300 mb-4 text-center">⚠ {error}</p>}

                <Button
                    type="submit"
                    className="w-full bg-white/30 text-white hover:bg-white/50 backdrop-blur-sm transition"
                    disabled={loading}
                >
                    {loading ? "Ingresando..." : "Iniciar Sesión"}
                </Button>
            </form>
        </div>
    )
}
