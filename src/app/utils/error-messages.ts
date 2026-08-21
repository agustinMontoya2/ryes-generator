const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  USER_ALREADY_EXISTS: 'Ya existe una cuenta con ese email o usuario',
  INVALID_RESET_TOKEN: 'El enlace de restablecimiento es inválido o ya expiró. Solicitá uno nuevo.',
  PASSWORD_SAME_AS_CURRENT: 'La nueva contraseña debe ser distinta a la actual',
  USER_NOT_ADMIN: 'No tenés permisos para realizar esta acción',
  UNAUTHORIZED: 'Tu sesión no es válida. Iniciá sesión nuevamente.',
  RESOURCE_NOT_FOUND: 'El recurso solicitado no existe',
  RESOURCE_ALREADY_EXISTS: 'El recurso ya existe',
  CANNOT_ASSIGN_BRANCHES_TO_SUPER_ADMIN: 'No se pueden asignar sucursales a un super admin',
  INVALID_INPUT: 'Los datos ingresados son inválidos',
  VALIDATION_ERROR: 'Revisá los datos ingresados',
  UNPROCESSABLE_ENTITY: 'No se pudo completar la operación',
  INTERNAL_SERVER_ERROR: 'Error interno del servidor. Intentá nuevamente.',
  ORDER_NOT_PENDING: 'La orden ya no está pendiente',
  ORDER_NOT_COMPLETED: 'La orden debe estar completada para realizar esta acción',
  ORDER_ALREADY_IN_REPORT: 'Una o más órdenes ya fueron incluidas en otro remito',
  PATIENT_HAS_RELATED_ORDERS: 'El paciente tiene órdenes asociadas y no puede eliminarse',
  DENTIST_HAS_RELATED_ORDERS: 'El odontólogo tiene órdenes asociadas y no puede eliminarse',
  SERVICE_HAS_RELATED_ORDERS: 'El servicio tiene órdenes asociadas y no puede eliminarse',
  DUE_DATE_LESS_THAN_DISPATCH_DATE: 'La fecha de entrega no puede ser anterior al despacho',
};
interface TranslatableError {
  message?: string;
  errorCode?: string;
}

export function translateApiError({ message, errorCode }: TranslatableError): string {
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }

  return message || 'Ocurrió un error inesperado';
}
