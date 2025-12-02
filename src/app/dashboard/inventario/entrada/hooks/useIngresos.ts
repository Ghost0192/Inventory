// src/app/dashboard/inventario/entrada/hooks/useIngresos.ts
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Ingreso } from "../types";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useIngresos = () => {
    const [ingresos, setIngresos] = useState<Ingreso[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchIngresos = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from("a_ingresos")
            .select("*")
            .order("fecha_ing", { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setIngresos(data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchIngresos();
    }, []);

    return {
        ingresos,
        loading,
        error,
        fetchIngresos
    };
};
