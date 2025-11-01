import React from "react"
import Link from "next/link"

interface SidebarProps {
    rol: string
}

export default function Sidebar({ rol }: SidebarProps) {
    return (
        <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col p-4">
            <h2 className="text-xl font-bold mb-6">Ventory</h2>
            <nav className="flex flex-col gap-2">
                {rol === "almacenista" ? (
                    <>
                        <Link href="/dashboard/Dasboard" className="hover:bg-gray-700 p-2 rounded">
                            Dasboard
                        </Link>
                        <Link href="/dashboard/inventario" className="hover:bg-gray-700 p-2 rounded">
                            Inventario
                        </Link>
                        <Link href="/dashboard/inventario" className="hover:bg-gray-700 p-2 rounded">
                            Inventario
                        </Link>
                        <Link href="/dashboard/movimientos" className="hover:bg-gray-700 p-2 rounded">
                            Movimientos
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/dashboard/Dasboard" className="hover:bg-gray-700 p-2 rounded">
                            Dasboard
                        </Link>
                        <Link href="/dashboard/solicitudes" className="hover:bg-gray-700 p-2 rounded">
                            Solicitudes
                        </Link>
                        <Link href="/dashboard/usuarios" className="hover:bg-gray-700 p-2 rounded">
                            Usuarios
                        </Link>
                        <Link href="/dashboard/reportes" className="hover:bg-gray-700 p-2 rounded">
                            Reportes
                        </Link>
                    </>
                )}
            </nav>
        </aside>
    )
}
