/** Espeja CategoriaRead del backend. */
export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string | null;
    activo: boolean;
}

/** Cuerpo de POST y PUT /categorias (CategoriaCreate / CategoriaUpdate). */
export interface CategoriaPayload {
    nombre: string;
    descripcion: string | null;
}

/** Valores del formulario: los inputs siempre manejan texto. */
export interface CategoriaFormValues {
    nombre: string;
    descripcion: string;
}
