"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Salida } from "../types";

export const useSalidas = () => {
    const [salidas, setSalidas] = useState<Salida[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSalidas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("a_salidas")
            .select("*")
            .order("fecha_salida", { ascending: false });

        if (error) setError(error.message);
        else setSalidas(data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchSalidas();
    }, []);

    return { salidas, loading, error, fetchSalidas };
};
