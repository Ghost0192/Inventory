CREATE TABLE public.a_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  correo varchar(150) UNIQUE NOT NULL,
  nombre_completo varchar(150),
  apellido_paterno varchar(100),
  apellido_materno varchar(100),
  telefono varchar(20),
  rol text NOT NULL DEFAULT 'solicitante'
    CHECK (rol IN ('admin','gerente','almacenista','solicitante')),
  sucursal text,
  activo boolean DEFAULT true,
  creado_en timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.a_bodegas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bodega text NOT NULL,
  creado_en timestamptz DEFAULT now()
);

CREATE TABLE public.a_productos (
  id_prod uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_reg timestamptz DEFAULT now(),
  auth_uid uuid REFERENCES public.a_usuarios(auth_uid) ON DELETE SET NULL,
  correo varchar(150),
  sucursal text,
  codigo_producto text UNIQUE NOT NULL,
  nombre_prod text NOT NULL,
  descripcion_prod text,
  categoria_prod text,
  unidad_medida text,
  stock_min integer DEFAULT 0,
  activo boolean DEFAULT true
);

CREATE TABLE public.a_ingresos (
  id_entr uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_ing timestamptz DEFAULT now(),
  auth_uid uuid REFERENCES public.a_usuarios(auth_uid) ON DELETE SET NULL,
  correo varchar(150),
  sucursal text,
  bodega text,
  codigo_producto text NOT NULL REFERENCES public.a_productos(codigo_producto),
  nombre_prod text,
  descripcion_prod text,
  unidad_medida text,
  cantidad_ingreso numeric NOT NULL CHECK (cantidad_ingreso > 0),
  marca text,
  origen_prod text,
  id_proveedor text,
  nombre_proveedor text,
  fecha_cad date,
  cuenta_contable numeric,
  nota text
);

CREATE TABLE public.a_salidas (
  id_salida uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_salida timestamptz DEFAULT now(),
  auth_uid uuid REFERENCES public.a_usuarios(auth_uid) ON DELETE SET NULL,
  correo varchar(150),
  sucursal text,
  codigo_producto text NOT NULL REFERENCES public.a_productos(codigo_producto),
  nombre_prod text,
  descripcion_prod text,
  area_destino text,
  numero_documento text,
  unidad_medida text,
  cantidad_salida numeric NOT NULL CHECK (cantidad_salida > 0),
  nota text
);

CREATE TABLE public.a_zona (
  id_zona uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pais text NOT NULL,
  municipio text,
  sucursal text NOT NULL,
  creado_en timestamptz DEFAULT now(),
  activo boolean DEFAULT true
);

CREATE TABLE public.a_zona (
  id_zona uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pais text NOT NULL,
  municipio text,
  sucursal text NOT NULL,
  creado_en timestamptz DEFAULT now(),
  activo boolean DEFAULT true
);
