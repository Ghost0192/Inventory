import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { LogOut, User, ChevronDown } from "lucide-react"
import { useState } from "react"

interface HeaderProps {
    nombreCompleto: string
    correo: string
}

export default function Header({ nombreCompleto, correo }: HeaderProps) {
    const router = useRouter()
    const [menuOpen, setMenuOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <header className="w-full bg-white shadow flex items-center justify-between px-4 md:px-6 py-3 rounded-2xl relative">
            <div>
                <h1 className="font-semibold text-base sm:text-lg text-gray-800">
                    Bienvenido,{" "}
                    <span className="text-green-900 font-bold">{nombreCompleto}</span>
                </h1>
                <p className="text-sm text-gray-500">{correo}</p>
            </div>

            {/* 🧑‍💼 Menú de usuario */}
            <div className="relative">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md hover:bg-gray-200"
                >
                    <User className="w-5 h-5 text-gray-700" />
                    <ChevronDown className="w-4 h-4 text-gray-700" />
                </button>

                {/* 🔽 Dropdown */}
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}
