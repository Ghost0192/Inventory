import { useState, useEffect } from 'react';
import { Producto } from '../types';
import { supabase } from '@/lib/supabaseClient';

export const useProductos = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProductos = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from<Producto>('a_productos')
            .select('*')
            .order('nombre_prod', { ascending: true });

        if (error) {
            setError(error.message);
        } else {
            setProductos(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    return { productos, loading, error, fetchProductos };
};
