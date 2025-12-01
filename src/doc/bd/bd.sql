-- =====================================================
-- 🌓 BASE DE DATOS: LUNA
-- Estructura simplificada: solo tabla a_usuarios

-- =====================================================
-- 👤 TABLA: a_usuarios
-- =====================================================
CREATE TABLE public.a_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_uid UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    correo VARCHAR(150) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150),
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    telefono VARCHAR(20),

    -- 🔹 Rol directamente en la tabla
    rol TEXT CHECK (rol IN ('admin', 'gerente', 'almacenista', 'solicitante'))
        DEFAULT 'solicitante',

    -- 🔹 Sucursal (nombre directamente, sin FK)
    sucursal TEXT,

    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.a_usuarios IS
'Usuarios sincronizados con auth.users, incluyendo rol, sucursal y estado.';

COMMENT ON COLUMN public.a_usuarios.rol IS
'Rol o perfil del usuario dentro del sistema: admin, gerente, almacenista, solicitante.';

COMMENT ON COLUMN public.a_usuarios.sucursal IS
'Nombre o identificador de la sucursal asignada al usuario.';

-- =====================================================
-- ⚙️ FUNCIÓN TRIGGER: crear_usuario_automatico
-- Crea un registro en a_usuarios cuando se registra un usuario nuevo en auth.users
-- =====================================================
CREATE OR REPLACE FUNCTION public.crear_usuario_automatico()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.a_usuarios (auth_uid, correo, nombre_completo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.crear_usuario_automatico() IS
'Crea automáticamente un registro en a_usuarios al registrarse un nuevo usuario en auth.users.';

-- =====================================================
-- 🚀 TRIGGER: on_auth_user_created
-- =====================================================
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.crear_usuario_automatico();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
'Trigger que sincroniza nuevos usuarios de auth.users con a_usuarios.';

-- =====================================================
-- ✅ OPCIONAL: Insertar ejemplo
-- =====================================================
INSERT INTO public.a_usuarios (auth_uid, correo, nombre_completo, rol, sucursal)
VALUES ('', 'admin@luna.com', 'Administrador LUNA', 'admin', 'Sucursal Central');

-- =====================================================
-- 📦 TABLA: a_productos
-- =====================================================

CREATE TABLE public.a_productos (
    id_prod UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha_reg TIMESTAMPTZ DEFAULT NOW(),
    auth_uid UUID REFERENCES public.a_usuarios(auth_uid) ON DELETE SET NULL,
    correo VARCHAR(150),
    sucursal TEXT,
    bodega TEXT,
    codigo_producto TEXT UNIQUE NOT NULL,
    nombre_prod TEXT NOT NULL,
    descripcion_prod TEXT,
    marca_prod TEXT,
    origen_prod TEXT,
    categoria_prod TEXT,
    id_proveedor UUID,
    nombre_proveedor TEXT,
    unidad_medida TEXT,
    stock_min INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE public.a_productos IS
'Catálogo de productos con información básica y stock mínimo configurado.';

COMMENT ON COLUMN public.a_productos.stock_min IS
'Cantidad mínima recomendada en inventario antes de generar alerta.';

-- =====================================================
-- 📥 TABLA: a_ingresos
-- =====================================================

CREATE TABLE public.a_ingresos (
    id_entr UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha_ing TIMESTAMPTZ DEFAULT NOW(),
    auth_uid UUID REFERENCES public.a_usuarios(auth_uid) ON DELETE SET NULL,
    correo VARCHAR(150),
    sucursal TEXT,
    codigo_producto TEXT NOT NULL REFERENCES public.a_productos(codigo_producto) ON DELETE CASCADE,
    nombre_prod TEXT,
    descripcion_prod TEXT,
    unidad_medida TEXT,
    cantidad_ingreso NUMERIC(10,2) NOT NULL CHECK (cantidad_ingreso > 0),
    fecha_cad DATE,
    nota TEXT
);

COMMENT ON TABLE public.a_ingresos IS
'Registro de entradas de productos al inventario (compras, devoluciones, etc.).';

-- =====================================================
-- 📤 TABLA: a_salidas
-- =====================================================

CREATE TABLE public.a_salidas (
    id_salida UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha_salida TIMESTAMPTZ DEFAULT NOW(),
    auth_uid UUID REFERENCES public.a_usuarios(auth_uid) ON DELETE SET NULL,
    correo VARCHAR(150),
    sucursal TEXT,
    codigo_producto TEXT NOT NULL REFERENCES public.a_productos(codigo_producto) ON DELETE CASCADE,
    nombre_prod TEXT,
    descripcion_prod TEXT,
    area_destino TEXT,
    numero_documento TEXT,
    unidad_medida TEXT,
    cantidad_salida NUMERIC(10,2) NOT NULL CHECK (cantidad_salida > 0),
    nota TEXT
);

COMMENT ON TABLE public.a_salidas IS
'Registro de salidas de productos del inventario (ventas, consumos, bajas, etc.).';

-- =====================================================
-- 🔍 VISTA OPCIONAL: a_vista_stock_minimo
-- =====================================================

CREATE OR REPLACE VIEW public.a_vista_stock_minimo AS
SELECT 
    p.id_prod,
    p.codigo_producto,
    p.nombre_prod,
    p.categoria_prod,
    p.unidad_medida,
    p.sucursal,
    p.bodega,
    p.stock_min
FROM public.a_productos p
WHERE p.stock_min > 0
ORDER BY p.sucursal, p.nombre_prod;

COMMENT ON VIEW public.a_vista_stock_minimo IS
'Vista que muestra los productos con su stock mínimo definido, para control de alertas.';

-- =====================================================
-- 🧠 RELACIONES CLAVE RESUMIDAS
-- =====================================================
-- auth.users → a_usuarios (1:N)
-- a_usuarios.auth_uid → a_productos.auth_uid (1:N)
-- a_usuarios.auth_uid → a_ingresos.auth_uid (1:N)
-- a_usuarios.auth_uid → a_salidas.auth_uid (1:N)
-- a_productos.codigo_producto → a_ingresos.codigo_producto (1:N)
-- a_productos.codigo_producto → a_salidas.codigo_producto (1:N)

-- =====================================================
-- 🔐 Row-Level Security (RLS)
-- =====================================================

ALTER TABLE public.a_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a_ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a_salidas ENABLE ROW LEVEL SECURITY;

-- Política básica de lectura (ajústala según tu lógica de roles)
CREATE POLICY "Lectura general de productos"
ON public.a_productos
FOR SELECT
USING (TRUE);

CREATE POLICY "Lectura general de ingresos"
ON public.a_ingresos
FOR SELECT
USING (TRUE);

CREATE POLICY "Lectura general de salidas"
ON public.a_salidas
FOR SELECT
USING (TRUE);

-- =====================================================
-- 🌎 TABLA: a_zona
-- =====================================================

CREATE TABLE public.a_zona (
    id_zona UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pais TEXT NOT NULL,
    municipio TEXT,
    sucursal TEXT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    activo BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE public.a_zona IS
'Define las zonas geográficas donde operan las sucursales: país, municipio y sucursal.';

COMMENT ON COLUMN public.a_zona.pais IS
'Nombre del país donde se ubica la sucursal.';

COMMENT ON COLUMN public.a_zona.municipio IS
'Municipio o ciudad de la sucursal.';

COMMENT ON COLUMN public.a_zona.sucursal IS
'Nombre o identificador de la sucursal asignada a esta zona.';

-- =====================================================
-- 🔐 Row-Level Security (RLS)
-- =====================================================

ALTER TABLE public.a_zona ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura general de zonas"
ON public.a_zona
FOR SELECT
USING (TRUE);

SELECT 
  p.codigo_producto,
  p.nombre_prod,
  COALESCE(SUM(i.cantidad_ingreso), 0) AS total_ingresos,
  COALESCE(SUM(s.cantidad_salida), 0) AS total_salidas,
  (COALESCE(SUM(i.cantidad_ingreso), 0) - COALESCE(SUM(s.cantidad_salida), 0)) AS stock_calculado,
  p.stock_min
FROM a_productos p
LEFT JOIN a_ingresos i ON p.codigo_producto = i.codigo_producto
LEFT JOIN a_salidas s ON p.codigo_producto = s.codigo_producto
GROUP BY p.codigo_producto, p.nombre_prod, p.stock_min
ORDER BY p.nombre_prod;


SELECT 
  p.codigo_producto,
  p.nombre_prod,
  COALESCE(SUM(i.cantidad_ingreso), 0) AS total_ingresos,
  COALESCE(SUM(s.cantidad_salida), 0) AS total_salidas,
  (COALESCE(SUM(i.cantidad_ingreso), 0) - COALESCE(SUM(s.cantidad_salida), 0)) AS stock_calculado,
  p.stock_min
FROM public.a_productos p
LEFT JOIN public.a_ingresos i ON p.codigo_producto = i.codigo_producto
LEFT JOIN public.a_salidas s ON p.codigo_producto = s.codigo_producto
GROUP BY p.codigo_producto, p.nombre_prod, p.stock_min
ORDER BY p.nombre_prod;


--stock actual por producto
--productos bajo stock
--Función: productos próximos a caducar (≤ 30 días)