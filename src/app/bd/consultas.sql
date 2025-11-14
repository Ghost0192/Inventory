
INSERT INTO public.a_productos (
    auth_uid,
    correo,
    sucursal,
    bodega,
    nombre_prod,
    descripcion_prod,
    marca_prod,
    origen_prod,
    categoria_prod,
    id_proveedor,
    nombre_proveedor,
    unidad_medida,
    stock_min,
    activo
) VALUES (
    'ae366033-8734-42a5-be37-b5195d1f3397', -- auth_uid
    'mx@luna.com',                          -- correo
    'Hijuelas',                    -- sucursal
    'Bodega Principal',                    -- bodega
    'Guantes de latex',                  -- nombre_prod
    'Guantes para manejo de agroquimocos',      -- descripcion_prod
    'Latex',                                -- marca_prod
    'China',                               -- origen_prod
    'EPP',                        -- categoria_prod
    '',-- id_proveedor
    'Latexcorp S.A.',          -- nombre_proveedor
    'Unidad',                               -- unidad_medida
    50,                                      -- stock_min
    TRUE                                    -- activo
);