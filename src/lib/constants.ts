/**
 * Application-wide constants for dropdowns and enums
 */

export const SUCURSALES = [
  "HIJUELAS",
  "OSORNO",
  "ICA",
  "QUERÉTARO",
] as const;

export const BODEGAS = [
  "INVITRO LAB",
  "HARDENING",
] as const;

export const PRODUCT_CATEGORIES = [
  "CONTENEDOR",
  "AGROQUÍMICOS",
  "FERTILIZANTE",
  "SEMILLA",
  "PLANTA",
  "OTRO",
] as const;

export const UNITS = [
  "UNIDAD",
  "KILOGRAMOS",
  "LITROS",
  "GRAMOS",
  "MILILITROS",
  "METROS",
] as const;

export const DESTINO_AREAS = [
  "ADMINISTRACION",
  "ASEO",
  "CHEQUEO",
  "CIDI",
  "DESPACHO",
  "FRUTALES",
  "HARDENING ESTERIL",
  "LAVADERO",
  "MANTENCION",
  "MEDIO",
  "OSORNO",
  "TRANSFER",
  "TRANSFER 1",
  "TRANSFER 2",
  "TRANSFER 3",
  "TRANSFER 4",
] as const;

export const USER_ROLES = [
  "admin",
  "gerente",
  "almacenista",
  "solicitante",
] as const;

export type Sucursal = (typeof SUCURSALES)[number];
export type Bodega = (typeof BODEGAS)[number];
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type Unit = (typeof UNITS)[number];
export type DestinoArea = (typeof DESTINO_AREAS)[number];
export type UserRole = (typeof USER_ROLES)[number];


