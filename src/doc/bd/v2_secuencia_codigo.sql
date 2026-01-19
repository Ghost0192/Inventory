--FUNCIÓN ASIGNAR CÓDIGO

--1.- Reiniciar el contador
ALTER SEQUENCE seq_codigo_producto RESTART WITH 1;

--2.- Crear la secuencia y función para asignar códigos automáticos a productos
CREATE SEQUENCE IF NOT EXISTS seq_codigo_producto
    START 1
    INCREMENT 1
    MINVALUE 1;

CREATE OR REPLACE FUNCTION asignar_codigo_producto()
RETURNS TRIGGER AS $$
DECLARE
    siguiente BIGINT;
BEGIN
    -- Obtener el siguiente número de la secuencia
    siguiente := nextval('seq_codigo_producto');

    -- Asignar el código al nuevo registro
    NEW.codigo_producto := 'GHPROD-' || LPAD(siguiente::text, 6, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--3.- Crear el trigger que utiliza la función anterior
CREATE TRIGGER trigger_codigo_producto
BEFORE INSERT ON public.a_productos
FOR EACH ROW
WHEN (NEW.codigo_producto IS NULL OR NEW.codigo_producto = '')
EXECUTE FUNCTION asignar_codigo_producto();
