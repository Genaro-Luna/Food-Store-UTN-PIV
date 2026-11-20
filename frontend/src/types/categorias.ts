export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
}

export type CategoriaFormValues = Omit<Categoria, 'id'>;