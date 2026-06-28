export function getErrorMessage(err: any): string {
  return err?.response?.data?.message ?? 'Ocurrió un error inesperado. Intenta de nuevo.';
}
