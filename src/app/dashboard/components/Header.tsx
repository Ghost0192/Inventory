import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

interface HeaderProps {
    nombreUsuario: string
}

export default function Header({ nombreUsuario }: HeaderProps) {
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <header className="w-full h-16 bg-white shadow flex items-center justify-between px-6">
            <h1 className="font-bold text-lg">Bienvenido, {nombreUsuario}</h1>
            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Logout
            </button>
        </header>
    )
}
