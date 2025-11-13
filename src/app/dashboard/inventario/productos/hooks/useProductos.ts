// src/app/dashboard/inventario/productos/hooks/useProductos.ts
import { useState, useEffect } from 'react';
import { Producto } from '../types';  // Ajusta la ruta según la ubicación real del archivo
import { supabase } from '@/lib/supabaseClient';

export const useProductos = () => {
    const [productos, setProductos] = useState<Producto[]>([]);  // Usamos Producto como tipo de los productos
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProductos = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('a_productos')
            .select('*')
            .order('nombre_prod', { ascending: true });

        if (error) {
            setError(error.message);
        } else {
            setProductos(data || []);  // Guardamos los productos en el estado
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    return { productos, loading, error, fetchProductos };
};
