--DESCRIPCIONES (DOCUMENTACIÓN SQL)
-- ======================
-- a_usuarios
-- ======================
COMMENT ON TABLE public.a_usuarios IS 'Usuarios del sistema sincronizados con auth.users';
COMMENT ON COLUMN public.a_usuarios.auth_uid IS 'ID del usuario en Supabase Auth';
COMMENT ON COLUMN public.a_usuarios.rol IS 'Rol del usuario: admin, gerente, almacenista, solicitante';
COMMENT ON COLUMN public.a_usuarios.sucursal IS 'Sucursal asignada al usuario';
COMMENT ON COLUMN public.a_usuarios.activo IS 'Indica si el usuario está activo';

-- ======================
-- a_bodegas
-- ======================
COMMENT ON TABLE public.a_bodegas IS 'Bodegas físicas por sucursal';
COMMENT ON COLUMN public.a_bodegas.bodega IS 'Nombre o código de la bodega';

-- ======================
-- a_productos
-- ======================
COMMENT ON TABLE public.a_productos IS 'Catálogo de productos del inventario';
COMMENT ON COLUMN public.a_productos.codigo_producto IS 'Código único del producto';
COMMENT ON COLUMN public.a_productos.stock_min IS 'Stock mínimo permitido antes de alerta';

-- ======================
-- a_ingresos
-- ======================
COMMENT ON TABLE public.a_ingresos IS 'Registro de ingresos de productos al inventario';
COMMENT ON COLUMN public.a_ingresos.cantidad_ingreso IS 'Cantidad ingresada, debe ser mayor a cero';

-- ======================
-- a_salidas
-- ======================
COMMENT ON TABLE public.a_salidas IS 'Registro de salidas de productos del inventario';
COMMENT ON COLUMN public.a_salidas.cantidad_salida IS 'Cantidad retirada, debe ser mayor a cero';

-- ======================
-- a_zona
-- ======================
COMMENT ON TABLE public.a_zona IS 'Zonas geográficas y sucursales';

RLS – USUARIO AUTENTICADO (CRUD BÁSICO)

🔐 Activar RLS
ALTER TABLE public.a_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a_bodegas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a_ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a_salidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a_zona ENABLE ROW LEVEL SECURITY;

📖 LEER (SELECT)
CREATE POLICY "select_authenticated"
ON public.a_productos
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "select_authenticated"
ON public.a_ingresos
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "select_authenticated"
ON public.a_salidas
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "select_authenticated"
ON public.a_bodegas
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "select_authenticated"
ON public.a_zona
FOR SELECT
USING (auth.uid() IS NOT NULL);

✏️ CREAR / EDITAR / ELIMINAR (INSERT, UPDATE, DELETE)
CREATE POLICY "modify_authenticated"
ON public.a_productos
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "modify_authenticated"
ON public.a_ingresos
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "modify_authenticated"
ON public.a_salidas
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "modify_authenticated"
ON public.a_bodegas
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "modify_authenticated"
ON public.a_zona
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);