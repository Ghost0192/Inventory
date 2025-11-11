"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Traer todos los usuarios
  async function fetchUsuarios() {
    const { data, error } = await supabase
      .from("a_usuarios")
      .select("*");
    if (!error && data) setUsuarios(data);
  }

  // 🔹 Buscar usuarios
  async function buscarUsuarios(filtro: string, valor: string) {
    const { data, error } = await supabase
      .from("a_usuarios")
      .select("*")
      .ilike(filtro, `%${valor}%`);
    if (!error && data) setUsuarios(data);
  }

  // 🔹 Crear usuario
  async function crearUsuario(form: any) {
    setLoading(true);
    try {
      const email = form.correo.trim().toLowerCase();

      // Verificar si ya existe
      const { data: existingUser } = await supabase
        .from("a_usuarios")
        .select("id")
        .eq("correo", email)
        .maybeSingle();

      if (existingUser) {
        alert("Ya existe un usuario con este correo.");
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: { data: { full_name: form.nombre_completo } },
      });

      if (signUpError) throw signUpError;
      const auth_uid = data.user?.id;
      if (!auth_uid) throw new Error("Error al crear usuario.");

      // Actualizar datos adicionales
      const { error: updateError } = await supabase
        .from("a_usuarios")
        .update({
          apellido_paterno: form.apellido_paterno,
          apellido_materno: form.apellido_materno,
          telefono: form.telefono,
          rol: form.rol,
          sucursal: form.sucursal,
        })
        .eq("auth_uid", auth_uid);

      if (updateError) throw updateError;
      alert("Usuario creado exitosamente.");
      fetchUsuarios();
    } catch (err: any) {
      console.error(err);
      alert("Error al crear usuario: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Actualizar usuario
  async function actualizarUsuario(usuario: any) {
    const { error } = await supabase
      .from("a_usuarios")
      .update(usuario)
      .eq("id", usuario.id);

    if (error) alert("Error al actualizar usuario.");
    else fetchUsuarios();
  }

  // 🔹 Eliminar usuario
  async function eliminarUsuario(id: string) {
    const { error } = await supabase.from("a_usuarios").delete().eq("id", id);
    if (error) alert("Error al eliminar usuario.");
    else fetchUsuarios();
  }

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return { usuarios, loading, fetchUsuarios, buscarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario };
}
