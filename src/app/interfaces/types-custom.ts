/**
 * custom type for screen type
 */
export type typeScreen =
  | 'PRODUCTOS'
  | 'CLIENTES'
  | 'USUARIOS'
  | 'ORDEN_REALIZDA'
  | 'REPORT_INVENTARIO'
  | 'REPORT_ORDEN';

/**
 * custom type for product type
 */
export type producType = 'ALQUILER' | 'SERVICIO' | 'CONSUMIBLE';

export type booleanType = 'true' | 'false';

export type yesNoType = 'SI' | 'NO';

export type stockType = 'DISPONIBLE' | 'NO_DISPONIBLE';

export type userStatusType = 'ACTIVO' | 'INACTIVO';

export type formaPagoType = 'EFECTIVO' | 'TRANSFERENCIA';

export type operationType = 'SUMAR' | 'RESTAR';

export type documentType = 'CEDULA' | 'RUC' | 'PASAPORTE';

export type statusAlquilerType = 'ACTIVO' | 'PENDIENTE' | 'FINALIZADO' | 'CANCELADO' | 'VENCIDO';
