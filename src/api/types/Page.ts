// =========================================================
// Tipo genérico para respuestas paginadas de Spring.
// La <T> significa "una página de lo que sea": Page<OfertaLaboralResponse>,
// Page<PostulacionResponse>, etc. Lo reutilizamos en TODAS las listas.
// =========================================================
export interface Page<T> {
  content: T[];          // los elementos de esta página
  totalElements: number; // total de elementos (todas las páginas)
  totalPages: number;    // total de páginas
  number: number;        // página actual (empieza en 0)
  size: number;          // tamaño de página
  first: boolean;        // ¿es la primera página?
  last: boolean;         // ¿es la última página?
  numberOfElements: number; // cuántos elementos hay en ESTA página
  empty: boolean;        // ¿la página está vacía?
}
