"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 🔹 Cargar todos los usuarios
  async function fetchUsuarios() {
    setLoading(true)
    const { data, error } = await supabase
      .from("a_usuarios")
      .select("id, correo, nombre_completo, telefono, rol, sucursal, activo, creado_en")
      .order("creado_en", { ascending: false })

    if (error) console.error("❌ Error al cargar usuarios:", error)
    else setUsuarios(data || [])

    setLoading(false)
  }

  // 🔹 Buscar usuarios por campo y valor
  async function buscarUsuarios(filtro: string, valor: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from("a_usuarios")
      .select("id, correo, nombre_completo, telefono, rol, sucursal, activo, creado_en")
      .ilike(filtro, `%${valor}%`)

    if (error) console.error("❌ Error al buscar usuarios:", error)
    else setUsuarios(data || [])

    setLoading(false)
  }

  // 🔹 Crear usuario (Auth + Perfil)
  async function crearUsuario(form: any) {
    try {
      setLoading(true)
      const email = form.correo.trim().toLowerCase()

      // 🧩 1️⃣ Verificar si ya existe en Auth
      const { data: existingUser, error: listError } = await supabase
        .from("a_usuarios")
        .select("correo")
        .eq("correo", email)
        .maybeSingle()

      if (listError) throw listError
      if (existingUser) {
        alert("⚠️ Ya existe un usuario con ese correo.")
        return false
      }

      // 🧩 2️⃣ Crear en Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
      })

      if (signUpError) throw signUpError

      const auth_uid = data.user?.id
      if (!auth_uid) throw new Error("No se pudo crear el usuario en auth.")

      // 🧩 3️⃣ Insertar registro en tabla a_usuarios
      const { error: insertError } = await supabase.from("a_usuarios").insert([
        {
          auth_uid,
          correo: email,
          nombre_completo: form.nombre_completo,
          apellido_paterno: form.apellido_paterno,
          apellido_materno: form.apellido_materno,
          telefono: form.telefono,
          rol: form.rol,
          sucursal: form.sucursal,
          activo: true,
        },
      ])

      if (insertError) throw insertError

      await fetchUsuarios()
      alert("✅ Usuario creado exitosamente.")
      return true
    } catch (err: any) {
      console.error("❌ Error crearUsuario:", err.message || err)
      alert(`Error al crear usuario: ${err.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Actualizar usuario
  async function actualizarUsuario(editUser: any) {
    try {
      setLoading(true)
      const { error } = await supabase
        .from("a_usuarios")
        .update({
          nombre_completo: editUser.nombre_completo,
          telefono: editUser.telefono,
          rol: editUser.rol,
          sucursal: editUser.sucursal,
          activo: editUser.activo,
        })
        .eq("id", editUser.id)

      if (error) throw error

      await fetchUsuarios()
      alert("✅ Usuario actualizado correctamente.")
      return true
    } catch (err: any) {
      console.error("❌ Error actualizarUsuario:", err.message || err)
      alert("Error al actualizar usuario.")
      return false
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Eliminar usuario
  async function eliminarUsuario(id: string) {
    try {
      setLoading(true)
      const { error } = await supabase.from("a_usuarios").delete().eq("id", id)
      if (error) throw error
      await fetchUsuarios()
      alert("🗑️ Usuario eliminado.")
      return true
    } catch (err: any) {
      console.error("❌ Error eliminarUsuario:", err.message || err)
      alert("Error al eliminar usuario.")
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  return {
    usuarios,
    loading,
    fetchUsuarios,
    buscarUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
  }
}
