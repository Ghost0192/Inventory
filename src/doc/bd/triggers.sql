--Prdoductos bajos en stock

CREATE OR REPLACE FUNCTION public.productos_bajo_stock()
RETURNS TABLE (
    codigo_producto TEXT,
    nombre_prod TEXT,
    stock_disponible NUMERIC,
    stock_min INTEGER,
    estado_stock TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.codigo_producto,
        v.nombre_prod,
        v.stock_disponible,
        v.stock_min,
        v.estado_stock
    FROM public.v_stock_disponible v
    WHERE v.stock_disponible <= v.stock_min
    ORDER BY v.stock_disponible ASC;
END;
$$ LANGUAGE plpgsql STABLE;

drop function productos_bajo_stock

select * productos_bajo_stock;