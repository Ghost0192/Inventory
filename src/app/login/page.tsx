'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
                router.push("/dashboard") // Redirige automáticamente si ya hay sesión
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
            router.push("/dashboard") // Redirige al dashboard si login correcto
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>

                <div className="mb-4">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        required
                        className="mt-1"
                    />
                </div>

                <div className="mb-6">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        required
                        className="mt-1"
                    />
                </div>

                {error && <p className="text-red-500 mb-4">⚠ {error}</p>}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Ingresando..." : "Iniciar Sesión"}
                </Button>
            </form>
        </div>
    )
}
