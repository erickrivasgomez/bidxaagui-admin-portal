export interface EditionPage {
    id: string;
    imagen_url: string;
    numero: number;
}

export interface Edition {
    id: string;
    titulo: string;
    descripcion?: string;
    cover_url?: string;
    fecha?: string;
    pdf_url?: string;
    publicada: number;
    created_at: string;
    pages?: EditionPage[];
}
