CREATE OR REPLACE VIEW public.v_stock_disponible AS
SELECT 
    p.codigo_producto,
    p.nombre_prod,
    p.stock_min,

    COALESCE(i_sum.total_ingresos, 0) AS total_ingresos, 
    COALESCE(s_sum.total_salidas, 0) AS total_salidas,

    (COALESCE(i_sum.total_ingresos, 0) - COALESCE(s_sum.total_salidas, 0)) AS stock_disponible,

    -- Lógica de ALERTA DE STOCK:
    CASE
        WHEN (COALESCE(i_sum.total_ingresos, 0) - COALESCE(s_sum.total_salidas, 0)) <= 0
            THEN '❌ URGENTE: SIN STOCK'
        WHEN (COALESCE(i_sum.total_ingresos, 0) - COALESCE(s_sum.total_salidas, 0)) <= p.stock_min
            THEN '⚠️ STOCK BAJO: Reponer'
        ELSE
            '✔️ STOCK SUFICIENTE'
    END AS estado_stock,
    
    -- NUEVA COLUMNA DE ORDENACIÓN NUMÉRICA
    CASE
        WHEN (COALESCE(i_sum.total_ingresos, 0) - COALESCE(s_sum.total_salidas, 0)) <= 0
            THEN 1 -- URGENTE
        WHEN (COALESCE(i_sum.total_ingresos, 0) - COALESCE(s_sum.total_salidas, 0)) <= p.stock_min
            THEN 2 -- BAJO
        ELSE
            3 -- SUFICIENTE
    END AS orden_prioridad

FROM public.a_productos p

LEFT JOIN (
    SELECT codigo_producto, SUM(cantidad_ingreso) AS total_ingresos
    FROM public.a_ingresos
    GROUP BY codigo_producto
) i_sum ON p.codigo_producto = i_sum.codigo_producto

LEFT JOIN (
    SELECT codigo_producto, SUM(cantidad_salida) AS total_salidas
    FROM public.a_salidas
    GROUP BY codigo_producto
) s_sum ON p.codigo_producto = s_sum.codigo_producto

ORDER BY p.nombre_prod asc;

select * from v_stock_disponible
