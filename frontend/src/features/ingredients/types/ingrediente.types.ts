export interface Ingrediente {
    id: number;
    nombre: string;
}

export type IngredienteFormValues = Omit<Ingrediente, 'id'>;