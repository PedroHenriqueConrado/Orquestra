import React, { useState, useEffect, useRef } from 'react';
import taskDocumentService from '../services/task-document.service';
import type { TaskDocument } from '../services/task-document.service';
import documentService from '../services/document.service';
import { FiFile, FiUpload, FiDownload, FiTrash2, FiPlus, FiX, FiCheckSquare, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from './ui/Button';
import Dialog from './ui/Dialog';
import formatFileSize from '../utils/formatFileSize';
import formatDate from '../utils/formatDate';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usePermissionRestriction } from '../hooks/usePermissionRestriction';
import PermissionRestrictionModal from './ui/PermissionRestrictionModal';

interface TaskDocumentsProps {
  taskId: number;
  projectId: number;
}

const TaskDocuments: React.FC<TaskDocumentsProps> = ({ taskId, projectId }) => {
  // Estados
  const [documents, setDocuments] = useState<TaskDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploadMode, setUploadMode] = useState<'new' | 'existing' | 'newVersion'>('new');
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectDocuments, setProjectDocuments] = useState<Array<any>>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocForVersion, setSelectedDocForVersion] = useState<any>(null);
  
  // Referências
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { theme } = useTheme();
  const { user } = useAuth();
  const { handleRestrictedAction, isModalOpen, currentRestriction, closeModal } = usePermissionRestriction();
  
  // Efeito para carregar documentos da tarefa
  useEffect(() => {
    loadTaskDocuments();
  }, [taskId, projectId]);
  
  // Função para carregar documentos da tarefa
  const loadTaskDocuments = async () => {
    try {
      setLoading(true);
      const data = await taskDocumentService.getTaskDocuments(projectId, taskId);
      setDocuments(data);
    } catch (error: any) {
      toast.error('Erro ao carregar documentos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Função para carregar documentos do projeto (para seleção)
  const loadProjectDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getProjectDocuments(projectId);
      console.log('Documentos do projeto carregados:', data);
      
      // Filtra documentos já associados à tarefa
      const associatedDocIds = documents.map(doc => doc.document_id);
      console.log('IDs de documentos já associados:', associatedDocIds);
      
      const availableDocuments = data.filter(doc => !associatedDocIds.includes(doc.id));
      console.log('Documentos disponíveis para vinculação:', availableDocuments);
      
      setProjectDocuments(availableDocuments);
    } catch (error: any) {
      console.error('Erro ao carregar documentos do projeto:', error);
      toast.error('Erro ao carregar documentos do projeto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Abrir diálogo de adição de documento
  const openAddDialog = (mode: 'new' | 'existing') => {
    setUploadMode(mode);
    setNewDocumentTitle('');
    setSelectedFile(null);
    setSelectedDocumentId(null);
    
    // Se for selecionar documento existente, carrega documentos do projeto
    if (mode === 'existing') {
      loadProjectDocuments();
    }
    
    setShowAddDialog(true);
  };
  
  // Função para criar novo documento
  const handleCreateDocument = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para upload');
      return;
    }
    
    if (!newDocumentTitle.trim()) {
      toast.error('Informe um título para o documento');
      return;
    }
    
    try {
      setLoading(true);
      await taskDocumentService.createAndAssociateDocument(
        projectId,
        taskId,
        newDocumentTitle,
        selectedFile
      );
      
      toast.success('Documento adicionado com sucesso');
      setShowAddDialog(false);
      await loadTaskDocuments();
    } catch (error: any) {
      toast.error('Erro ao adicionar documento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Função para associar documento existente
  const handleAssociateDocument = async () => {
    if (!selectedDocumentId) {
      toast.error('Selecione um documento para associar');
      return;
    }
    
    try {
      setLoading(true);
      await taskDocumentService.associateDocument(
        projectId,
        taskId,
        selectedDocumentId
      );
      
      toast.success('Documento associado com sucesso');
      setShowAddDialog(false);
      await loadTaskDocuments();
    } catch (error: any) {
      toast.error('Erro ao associar documento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Função para remover associação de documento
  const handleRemoveDocument = async (documentId: number) => {
    // Verificar se pode deletar documentos
    if (!handleRestrictedAction('delete_document')) {
      return;
    }

    if (!confirm('Tem certeza que deseja remover este documento da tarefa?')) {
      return;
    }
    
    try {
      setLoading(true);
      await taskDocumentService.removeAssociation(projectId, taskId, documentId);
      toast.success('Documento removido da tarefa');
      await loadTaskDocuments();
    } catch (error: any) {
      toast.error('Erro ao remover documento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Função para fazer download de uma versão do documento
  const handleDownloadVersion = (documentId: number, versionNumber: number) => {
    try {
      const url = taskDocumentService.getDocumentVersionDownloadUrl(
        projectId,
        documentId,
        versionNumber
      );
      
      console.log('URL de download:', url);
      
      // Cria um link temporário e simula o clique para fazer o download
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao iniciar download:', error);
      toast.error('Erro ao baixar documento');
    }
  };
  
  // Filtra documentos do projeto pelo termo de busca
  const filteredProjectDocuments = projectDocuments.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Função para abrir diálogo para nova versão
  const openNewVersionDialog = (document: any) => {
    setUploadMode('newVersion');
    setSelectedDocForVersion(document);
    setSelectedFile(null);
    setShowAddDialog(true);
  };

  // Função para enviar nova versão de um documento
  const handleUploadNewVersion = async () => {
    if (!selectedFile || !selectedDocForVersion) {
      toast.error('Selecione um arquivo para upload');
      return;
    }
    
    try {
      setLoading(true);
      
      // Log para debug
      console.log('Enviando nova versão para:', {
        projectId,
        documentId: selectedDocForVersion.document.id,
        documento: selectedDocForVersion
      });
      
      // Log completo do selectedDocForVersion para depuração
      console.log('Detalhes completos do documento:', JSON.stringify(selectedDocForVersion, null, 2));
      
      // Chamada do serviço com parâmetros corretos
      const result = await taskDocumentService.uploadNewVersion(
        projectId,
        selectedDocForVersion.document.id, // Usar o ID do documento, não o ID da associação
        selectedFile
      );
      
      console.log('Resultado do upload de nova versão:', result);
      
      toast.success('Nova versão adicionada com sucesso');
      setShowAddDialog(false);
      await loadTaskDocuments();
    } catch (error: any) {
      console.error('Erro detalhado:', error);
      toast.error('Erro ao adicionar nova versão: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Verificar se pode fazer upload de documentos
    if (!handleRestrictedAction('upload_document')) {
      return;
    }

    const file = files[0];
    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use PDF, Word, Excel, texto ou imagens.');
      return;
    }
    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }
    setSelectedFile(file); // <-- Correção: salvar o arquivo selecionado no estado
  };
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className={theme === 'dark' ? 'text-lg font-medium text-dark-text' : 'text-lg font-medium text-gray-900'}>Documentos</h3>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openAddDialog('existing')}
            disabled={loading}
          >
            <FiSearch className="mr-1" />
            Vincular Existente
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => openAddDialog('new')}
            disabled={loading}
          >
            <FiUpload className="mr-1" />
            Novo Documento
          </Button>
        </div>
      </div>
      
      {/* Lista de documentos */}
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-primary rounded-full"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className={theme === 'dark' ? 'bg-dark-secondary p-4 rounded-md text-center text-dark-muted' : 'bg-gray-50 p-4 rounded-md text-center text-gray-500'}>
          Nenhum documento associado a esta tarefa.
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((taskDoc) => (
            <div key={`${taskDoc.task_id}-${taskDoc.document_id}`} className={theme === 'dark' ? 'bg-dark-secondary shadow-sm rounded-md border border-dark-border overflow-hidden' : 'bg-white shadow-sm rounded-md border border-gray-200 overflow-hidden'}>
              <div className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <FiFile className="text-blue-500 mr-2 text-xl" />
                    <div>
                      <h4 className={theme === 'dark' ? 'font-medium text-dark-text' : 'font-medium text-gray-900'}>{taskDoc.document.title}</h4>
                      <p className={theme === 'dark' ? 'text-sm text-dark-muted' : 'text-sm text-gray-500'}>
                        Adicionado por {taskDoc.user.name} em {formatDate(taskDoc.added_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-3"
                      onClick={() => openNewVersionDialog(taskDoc)}
                      title="Adicionar nova versão"
                    >
                      <FiUpload />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveDocument(taskDoc.document_id)}
                      title="Remover documento desta tarefa"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
                
                {/* Lista de versões */}
                <div className="mt-3 border-t pt-3">
                  <h5 className={theme === 'dark' ? 'text-sm font-medium text-dark-text mb-2' : 'text-sm font-medium text-gray-700 mb-2'}>
                    Versões disponíveis ({taskDoc.document.versions?.length || 0}):
                  </h5>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {taskDoc.document.versions?.map((version, index) => (
                      <div 
                        key={version.id} 
                        className={`flex justify-between items-center p-2 rounded text-sm ${
                          index === 0 
                            ? theme === 'dark' ? 'bg-blue-900 border border-blue-700 text-blue-200' : 'bg-blue-50 border border-blue-200 text-blue-700'
                            : theme === 'dark' ? 'bg-dark-accent text-dark-text' : 'bg-gray-50'
                        }`}
                      >
                        <div>
                          <span className={`font-medium ${index === 0 ? (theme === 'dark' ? 'text-blue-200' : 'text-blue-700') : ''}`}>
                            {index === 0 ? 'Versão atual - ' : ''}v{version.version_number}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{version.original_name}</span>
                          <span className="mx-2">•</span>
                          <span>{formatFileSize(version.size)}</span>
                          <span className="mx-2">•</span>
                          <span title={formatDate(version.uploaded_at)}>
                            {new Date(version.uploaded_at).toLocaleDateString()}
                          </span>
                          {version.uploader && (
                            <>
                              <span className="mx-2">•</span>
                              <span>por {version.uploader.name}</span>
                            </>
                          )}
                        </div>
                        <button
                          className={theme === 'dark' ? 'text-blue-300 hover:text-blue-400 flex items-center' : 'text-blue-600 hover:text-blue-800 flex items-center'}
                          onClick={() => handleDownloadVersion(taskDoc.document_id, version.version_number)}
                          title="Baixar esta versão"
                        >
                          <FiDownload className="mr-1" />
                          <span className="hidden sm:inline">Baixar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Diálogo para adicionar documento */}
      <Dialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title={
          uploadMode === 'new' 
            ? 'Adicionar Novo Documento' 
            : uploadMode === 'existing'
              ? 'Vincular Documento Existente'
              : `Nova Versão: ${selectedDocForVersion?.document.title}`
        }
      >
        {uploadMode === 'new' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="documentTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Título do Documento
              </label>
              <input
                type="text"
                id="documentTitle"
                value={newDocumentTitle}
                onChange={(e) => setNewDocumentTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Título do documento"
              />
            </div>
            
            <div>
              <label htmlFor="documentFile" className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="documentFile"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Selecionar Arquivo
                </Button>
                {selectedFile && (
                  <span className="text-sm text-gray-500">{selectedFile.name}</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleCreateDocument} disabled={loading}>
                {loading ? 'Enviando...' : 'Adicionar Documento'}
              </Button>
            </div>
          </div>
        ) : uploadMode === 'existing' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="searchDocument" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar Documento
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="searchDocument"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Buscar documento por título..."
                />
              </div>
            </div>
            
            <div className="border rounded-md max-h-60 overflow-y-auto">
              {filteredProjectDocuments.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhum documento disponível encontrado.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredProjectDocuments.map((doc) => (
                    <li
                      key={doc.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center ${
                        selectedDocumentId === doc.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedDocumentId(doc.id)}
                    >
                      <div className="flex items-center">
                        <FiFile className="text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.title}</p>
                          <p className="text-xs text-gray-500">
                            Criado por {doc.creator?.name} em {formatDate(doc.created_at)}
                          </p>
                        </div>
                      </div>
                      {selectedDocumentId === doc.id && (
                        <FiCheckSquare className="text-blue-500" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleAssociateDocument}
                disabled={loading || !selectedDocumentId}
              >
                {loading ? 'Vinculando...' : 'Vincular Documento'}
              </Button>
            </div>
          </div>
        ) : (
          // Diálogo para nova versão
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Você está enviando uma nova versão para o documento "{selectedDocForVersion?.document.title}".
                A versão atual é v{selectedDocForVersion?.document.versions?.[0]?.version_number || 1}.
              </p>
              
              <label htmlFor="versionFile" className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="versionFile"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Selecionar Arquivo
                </Button>
                {selectedFile && (
                  <span className="text-sm text-gray-500">{selectedFile.name}</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleUploadNewVersion} disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Nova Versão'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Modal de restrição de permissão */}
      {isModalOpen && currentRestriction && user && (
        <PermissionRestrictionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          action={currentRestriction.action}
          requiredRoles={currentRestriction.requiredRoles}
          currentRole={user.role}
        />
      )}
    </div>
  );
};

export default TaskDocuments; 