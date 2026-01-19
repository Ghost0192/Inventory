-- Vista: v_stock_disponible
-- Descripción: Muestra el stock disponible de productos con alertas basadas en stock mínimo y una lógica de prioridad mejorada.
CREATE OR REPLACE VIEW public.v_stock_disponible AS
SELECT 
  p.codigo_producto,
  p.nombre_prod,
  p.stock_min,

  COALESCE(i_sum.total_ingresos, 0) AS total_ingresos, 
  COALESCE(s_sum.total_salidas, 0) AS total_salidas,

  (COALESCE(i_sum.total_ingresos, 0) - COALESCE(s_sum.total_salidas, 0)) 
    AS stock_disponible,

  CASE
    -- 1️⃣ igual o menor al stock_min
    WHEN (COALESCE(i_sum.total_ingresos, 0) - COALESCE(s_sum.total_salidas, 0)) 
         <= p.stock_min
      THEN '❌ URGENTE: SIN STOCK'

    -- 2️⃣ hasta 10% sobre el stock_min
    WHEN (COALESCE(i_sum.total_ingresos, 0) - COALESCE(s_sum.total_salidas, 0)) 
         <= (p.stock_min * 1.10)
      THEN '⚠️ STOCK BAJO: Reponer'

    -- 3️⃣ sobre el 10%
    ELSE '✔️ STOCK SUFICIENTE'
  END AS estado_stock,

  CASE
    WHEN (COALESCE(i_sum.total_ingresos, 0) - COALESCE(s_sum.total_salidas, 0)) 
         <= p.stock_min
      THEN 1
    WHEN (COALESCE(i_sum.total_ingresos, 0) - COALESCE(s_sum.total_salidas, 0)) 
         <= (p.stock_min * 1.10)
      THEN 2
    ELSE 3
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

ORDER BY orden_prioridad, p.nombre_prod;
