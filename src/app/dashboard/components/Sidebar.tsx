'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Box,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({})
  const [isOpen, setIsOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const isActive = (path: string) =>
    pathname === path
      ? 'bg-blue-100 text-blue-600 font-semibold'
      : 'text-gray-700 hover:bg-gray-100'

  // 🔹 Submenús
  const inventarioSubMenu = [
    { href: '/dashboard/inventario/ingreso', label: 'Ingreso Inventario' },
    { href: '/dashboard/inventario/ordenes', label: 'Órdenes Recepcionadas' },
    { href: '/dashboard/inventario/salida', label: 'Salida Inventario' },
  ]

  const usuariosSubMenu = [
    { href: '/dashboard/usuarios', label: 'Administrar usuarios' },
  ]
  
  // 🔹 Menús base
  let menuItems: any[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/movimientos', label: 'Movimientos', icon: ClipboardList },
  ]

  // 🔹 Inventario acordeón según rol
  if (role === 'admin' || role === 'gerente' || role === 'almacenista') {
    menuItems.splice(1, 0, { // Insertamos después de Dashboard
      label: 'Inventario',
      icon: Package,
      subItems: inventarioSubMenu,
    })
  }

  // 🔹 Admin o gerente: Usuarios y Productos
  if (role === 'admin' || role === 'gerente') {
    menuItems.push(
      {
        label: 'Usuarios',
        icon: Users,
        subItems: usuariosSubMenu,
      },
      { href: '/dashboard/productos', label: 'Productos', icon: Box }
    )
  }

  // 🔹 Almacenista: solo Productos
  if (role === 'almacenista') {
    menuItems.push({ href: '/dashboard/productos', label: 'Productos', icon: Box })
  }

  // 🔹 Solicitante: Mis órdenes
  if (role === 'solicitante') {
    menuItems.push({ href: '/dashboard/ordenes', label: 'Mis órdenes', icon: ClipboardList })
  }

  // 🚪 Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // 🔹 Toggle acordeones
  const toggleAccordion = (label: string) => {
    setOpenAccordions(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <>
      {/* 🔘 Botón hamburger (solo móvil) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-green-700 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* 🌙 Fondo oscuro en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🧱 Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r shadow-sm flex flex-col transform transition-transform duration-300 z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:w-64`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 px-4 py-3 border-b">
          <Image
            src="/assets/logos/gh_logo.png"
            alt="Logo Grupo Hijuelas"
            width={40}
            height={40}
            className="rounded-md"
          />
          <h1 className="text-3xl font-bold text-green-900">Ventory</h1>
        </div>

        {/* Info panel */}
        <div className="px-4 py-2 text-sm text-gray-500 uppercase border-b">
          Main menu
          <p className="text-gray-400 capitalize">Panel {role}</p>
        </div>

        {/* Menú principal */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {menuItems.map((item, idx) => {
            if ('subItems' in item) {
              const isOpenAccordion = openAccordions[item.label] || false
              return (
                <div key={idx}>
                  <button
                    onClick={() => toggleAccordion(item.label)}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-sm transition ${isOpenAccordion ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <item.icon className="w-5 h-5 mr-2" />
                    <span>{item.label}</span>
                    <div className="ml-auto">
                      {isOpenAccordion ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpenAccordion && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((sub: any, subIdx: number) => (
                        <Link
                          key={subIdx}
                          href={sub.href}
                          className={`block px-3 py-1.5 text-sm rounded-md transition ${isActive(sub.href)}`}
                          onClick={() => setIsOpen(false)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${isActive(item.href)}`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* 🚪 Botón de Cerrar sesión */}
        <div className="mt-auto border-t px-3 py-3">
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 w-full px-3 py-2 rounded-md transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ⚠️ Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-80 p-6 text-center">
            <h2 className="text-lg font-semibold mb-3">¿Cerrar sesión?</h2>
            <p className="text-gray-600 mb-5">
              Se cerrará tu sesión actual y deberás iniciar sesión nuevamente.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white"
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
