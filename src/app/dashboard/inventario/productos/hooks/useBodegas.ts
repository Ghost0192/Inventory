//src/app/dashboard/inventario/productos/hooks/useBodegas.ts
"use client";

import { useState, useEffect } from 'react';
import { Bodegas } from '../types';  // Ajusta la ruta según la ubicación real del archivo
import { supabase } from '@/lib/supabaseClient';

export const useBodegas = () => {
    const [bodegas, setBodegas] = useState<Bodegas[]>([]);  // Usamos Bodegas como tipo de los Bodegas
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBodegas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('a_bodegas')
            .select('*')
            .order('bodega', { ascending: true });

        if (error) {
            setError(error.message);
        } else {
            setBodegas(data || []);  // Guardamos los Bodegas en el estado
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBodegas();
    }, []);

    return { bodegas, loading, error, fetchBodegas };
};
