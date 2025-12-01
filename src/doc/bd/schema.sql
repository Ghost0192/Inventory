-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.a_ingresos (
  id_entr uuid NOT NULL DEFAULT gen_random_uuid(),
  fecha_ing timestamp with time zone DEFAULT now(),
  auth_uid uuid,
  correo character varying,
  sucursal text,
  codigo_producto text NOT NULL,
  nombre_prod text,
  unidad_medida text,
  cantidad_ingreso numeric NOT NULL CHECK (cantidad_ingreso > 0::numeric),
  fecha_cad date,
  nota text,
  descripcion_prod text,
  CONSTRAINT a_ingresos_pkey PRIMARY KEY (id_entr),
  CONSTRAINT a_ingresos_auth_uid_fkey FOREIGN KEY (auth_uid) REFERENCES public.a_usuarios(auth_uid)
);
CREATE TABLE public.a_productos (
  id_prod uuid NOT NULL DEFAULT gen_random_uuid(),
  fecha_reg timestamp with time zone DEFAULT now(),
  auth_uid uuid,
  correo character varying,
  sucursal text,
  bodega text,
  codigo_producto text NOT NULL UNIQUE,
  nombre_prod text NOT NULL,
  descripcion_prod text,
  marca_prod text,
  origen_prod text,
  categoria_prod text,
  id_proveedor uuid,
  nombre_proveedor text,
  unidad_medida text,
  stock_min integer DEFAULT 0,
  activo boolean DEFAULT true,
  CONSTRAINT a_productos_pkey PRIMARY KEY (id_prod),
  CONSTRAINT a_productos_auth_uid_fkey FOREIGN KEY (auth_uid) REFERENCES public.a_usuarios(auth_uid)
);
CREATE TABLE public.a_salidas (
  id_salida uuid NOT NULL DEFAULT gen_random_uuid(),
  fecha_salida timestamp with time zone DEFAULT now(),
  auth_uid uuid,
  correo character varying,
  sucursal text,
  codigo_producto text NOT NULL,
  nombre_prod text,
  descripcion_prod text,
  area_destino text,
  numero_documento text,
  unidad_medida text,
  cantidad_salida numeric NOT NULL CHECK (cantidad_salida > 0::numeric),
  nota text,
  CONSTRAINT a_salidas_pkey PRIMARY KEY (id_salida),
  CONSTRAINT a_salidas_auth_uid_fkey FOREIGN KEY (auth_uid) REFERENCES public.a_usuarios(auth_uid),
  CONSTRAINT a_salidas_codigo_producto_fkey FOREIGN KEY (codigo_producto) REFERENCES public.a_productos(codigo_producto)
);
CREATE TABLE public.a_usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_uid uuid NOT NULL UNIQUE,
  correo character varying NOT NULL UNIQUE,
  nombre_completo character varying,
  apellido_paterno character varying,
  apellido_materno character varying,
  telefono character varying,
  rol text DEFAULT 'solicitante'::text CHECK (rol = ANY (ARRAY['admin'::text, 'gerente'::text, 'almacenista'::text, 'solicitante'::text])),
  sucursal text,
  activo boolean DEFAULT true,
  creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT a_usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT a_usuarios_auth_uid_fkey FOREIGN KEY (auth_uid) REFERENCES auth.users(id)
);
CREATE TABLE public.a_zona (
  id_zona uuid NOT NULL DEFAULT gen_random_uuid(),
  pais text NOT NULL,
  municipio text,
  sucursal text NOT NULL,
  creado_en timestamp with time zone DEFAULT now(),
  activo boolean DEFAULT true,
  CONSTRAINT a_zona_pkey PRIMARY KEY (id_zona)
);
CREATE TABLE public.stock_disponible (
  codigo_producto text,
  nombre_prod text,
  stock_min integer,
  total_ingresos numeric,
  total_salidas numeric,
  stock_disponible numeric
);