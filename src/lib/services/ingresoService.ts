import { supabase } from "@/lib/supabaseClient";

export class IngresoService {
    static async getAll() {
        const { data, error } = await supabase
            .from("Ingreso")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
    }

    static async create(item: {
        Producto: string;
        Cantidad: number;
        Descripción: string;
        Marca: string;
    }) {
        const { error } = await supabase.from("Ingreso").insert([item]);
        if (error) throw error;
    }

    static async update(
        id: string,
        item: {
            Producto?: string;
            Cantidad?: number;
            Descripción?: string;
            Marca?: string;
        }
    ) {
        const { error } = await supabase.from("Ingreso").update(item).eq("id", id);
        if (error) throw error;
    }

    static async delete(id: string) {
        const { error } = await supabase.from("Ingreso").delete().eq("id", id);
        if (error) throw error;
    }
}
