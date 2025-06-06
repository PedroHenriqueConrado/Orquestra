import api from './api.service';

export interface DocumentVersion {
  id: number;
  document_id: number;
  version_number: number;
  file_path: string;
  original_name: string;
  mime_type: string;
  size: number;
  is_compressed: boolean;
  uploaded_at: string;
  uploaded_by: number;
  uploader?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Document {
  id: number;
  project_id: number;
  title: string;
  created_at: string;
  created_by: number;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  versions?: DocumentVersion[];
  currentVersion?: DocumentVersion;
}

class DocumentService {
  /**
   * Obtém todos os documentos de um projeto
   */
  async getProjectDocuments(projectId: number): Promise<Document[]> {
    try {
      const response = await api.get<Document[]>(`/projects/${projectId}/documents`);
      return response.data || [];
    } catch (error: any) {
      console.error(`Erro ao buscar documentos do projeto ${projectId}:`, error);
      throw new Error(error.message || 'Erro ao buscar documentos do projeto');
    }
  }

  /**
   * Obtém um documento específico pelo ID
   */
  async getDocumentById(projectId: number, documentId: number): Promise<Document> {
    try {
      const response = await api.get<Document>(`/projects/${projectId}/documents/${documentId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao buscar documento ${documentId}:`, error);
      throw new Error(error.message || 'Erro ao buscar detalhes do documento');
    }
  }

  /**
   * Cria um novo documento
   */
  async createDocument(projectId: number, title: string, file: File): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);

      const response = await api.post<Document>(
        `/projects/${projectId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar documento:', error);
      throw new Error(error.message || 'Erro ao criar documento');
    }
  }

  /**
   * Atualiza o título de um documento existente
   */
  async updateDocument(projectId: number, documentId: number, title: string): Promise<Document> {
    try {
      const response = await api.put<Document>(
        `/projects/${projectId}/documents/${documentId}`,
        { title }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao atualizar documento ${documentId}:`, error);
      throw new Error(error.message || 'Erro ao atualizar documento');
    }
  }

  /**
   * Exclui um documento
   */
  async deleteDocument(projectId: number, documentId: number): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}/documents/${documentId}`);
    } catch (error: any) {
      console.error(`Erro ao excluir documento ${documentId}:`, error);
      throw new Error(error.message || 'Erro ao excluir documento');
    }
  }

  /**
   * Faz upload de uma nova versão do documento
   */
  async uploadNewVersion(projectId: number, documentId: number, file: File): Promise<DocumentVersion> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<DocumentVersion>(
        `/projects/${projectId}/documents/${documentId}/versions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao fazer upload de nova versão para o documento ${documentId}:`, error);
      throw new Error(error.message || 'Erro ao fazer upload de nova versão');
    }
  }

  /**
   * Obtém a URL para download de uma versão de documento
   */
  getDocumentVersionDownloadUrl(
    projectId: number,
    documentId: number,
    versionNumber: number
  ): string {
    return `${api.defaults.baseURL}/projects/${projectId}/documents/${documentId}/versions/${versionNumber}`;
  }
}

export default new DocumentService(); 