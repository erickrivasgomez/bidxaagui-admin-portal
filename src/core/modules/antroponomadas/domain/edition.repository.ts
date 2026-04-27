import { Edition, EditionPage } from './edition.model';

export interface EditionRepository {
    getAll(): Promise<Edition[]>;
    create(data: { titulo: string; descripcion: string; fecha: string }): Promise<{ id: string }>;
    delete(id: string): Promise<void>;
    uploadPage(id: string, formData: FormData): Promise<void>;
    getPages(id: string): Promise<EditionPage[]>;
    uploadPDF(id: string, formData: FormData): Promise<void>;
}
