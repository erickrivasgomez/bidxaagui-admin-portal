import { EditionRepository } from '../domain/edition.repository';
import { Edition, EditionPage } from '../domain/edition.model';

export class GetEditionsUseCase {
    constructor(private repository: EditionRepository) {}
    execute(): Promise<Edition[]> {
        return this.repository.getAll();
    }
}

export class CreateEditionUseCase {
    constructor(private repository: EditionRepository) {}
    execute(data: { titulo: string; descripcion: string; fecha: string }): Promise<{ id: string }> {
        return this.repository.create(data);
    }
}

export class DeleteEditionUseCase {
    constructor(private repository: EditionRepository) {}
    execute(id: string): Promise<void> {
        return this.repository.delete(id);
    }
}

export class UploadEditionPageUseCase {
    constructor(private repository: EditionRepository) {}
    execute(id: string, formData: FormData): Promise<void> {
        return this.repository.uploadPage(id, formData);
    }
}

export class GetEditionPagesUseCase {
    constructor(private repository: EditionRepository) {}
    execute(id: string): Promise<EditionPage[]> {
        return this.repository.getPages(id);
    }
}

export class UploadEditionPdfUseCase {
    constructor(private repository: EditionRepository) {}
    execute(id: string, formData: FormData): Promise<void> {
        return this.repository.uploadPDF(id, formData);
    }
}
