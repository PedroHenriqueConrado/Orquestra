import api from './api.service';
import { Document, DocumentVersion } from './document.service';

export interface TaskDocument {
  task_id: number;
  document_id: number;
  added_at: string;
  added_by: number;
  document: Document;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

class TaskDocumentService {
  /**
   * Obtém todos os documentos associados a uma tarefa
   */
  async getTaskDocuments(projectId: number, taskId: number): Promise<TaskDocument[]> {
    try {
      const response = await api.get<TaskDocument[]>(
        `/projects/${projectId}/tasks/${taskId}/documents`
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar documentos da tarefa:', error);
      throw new Error(error.message || 'Erro ao buscar documentos');
    }
  }

  /**
   * Cria um novo documento e o associa a uma tarefa
   */
  async createAndAssociateDocument(
    projectId: number,
    taskId: number,
    title: string,
    file: File
  ): Promise<TaskDocument> {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);

      const response = await api.post<TaskDocument>(
        `/projects/${projectId}/tasks/${taskId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar e associar documento:', error);
      throw new Error(error.message || 'Erro ao criar documento');
    }
  }

  /**
   * Associa um documento existente a uma tarefa
   */
  async associateDocument(
    projectId: number,
    taskId: number,
    documentId: number
  ): Promise<TaskDocument> {
    try {
      const response = await api.post<TaskDocument>(
        `/projects/${projectId}/tasks/${taskId}/documents/${documentId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao associar documento:', error);
      throw new Error(error.message || 'Erro ao associar documento');
    }
  }

  /**
   * Remove a associação entre um documento e uma tarefa
   */
  async removeAssociation(
    projectId: number,
    taskId: number,
    documentId: number
  ): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}/documents/${documentId}`);
    } catch (error: any) {
      console.error('Erro ao remover associação:', error);
      throw new Error(error.message || 'Erro ao remover associação');
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
    // Obtém o token do localStorage
    const token = localStorage.getItem('token');
    
    // Certifica-se de que a URL base termina sem barra para evitar barras duplicadas
    const baseUrl = api.defaults.baseURL?.endsWith('/') 
      ? api.defaults.baseURL.slice(0, -1) 
      : api.defaults.baseURL || '';
    
    // URL completa com parâmetros de URL corretos
    const url = `${baseUrl}/projects/${projectId}/documents/${documentId}/versions/${versionNumber}?token=${token}`;
    
    console.log('URL de download gerada:', url);
    
    return url;
  }

  /**
   * Faz upload de uma nova versão do documento
   */
  async uploadNewVersion(
    projectId: number,
    documentId: number,
    file: File
  ): Promise<DocumentVersion> {
    try {
      console.log('Iniciando upload de nova versão:', {
        projectId,
        documentId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const formData = new FormData();
      formData.append('file', file);

      // URL correta para o endpoint de documentos do projeto
      const url = `/projects/${projectId}/documents/${documentId}/versions`;
      console.log('URL para upload:', url);

      const response = await api.post<DocumentVersion>(
        url,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('Resposta do servidor:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao fazer upload de nova versão:', error);
      console.error('Detalhes do erro:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message || 'Erro ao fazer upload de nova versão');
    }
  }
}

export default new TaskDocumentService(); 