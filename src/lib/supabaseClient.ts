import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true, // ✅ Guarda la sesión localmente
        autoRefreshToken: true, // ✅ Refresca tokens automáticamente
        detectSessionInUrl: true, // ✅ Detecta tokens tras login mágico (si usas)
    },
});
