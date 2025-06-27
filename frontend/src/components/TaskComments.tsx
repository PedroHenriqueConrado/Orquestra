import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Rating from './ui/Rating';
import { useAuth } from '../contexts/AuthContext';
import { usePermissionRestriction } from '../hooks/usePermissionRestriction';
import PermissionRestrictionModal from './ui/PermissionRestrictionModal';
import taskCommentService from '../services/task-comment.service';
import type { TaskComment, CreateCommentData } from '../services/task-comment.service';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

interface TaskCommentsProps {
  projectId: number;
  taskId: number;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ projectId, taskId }) => {
  const { user } = useAuth();
  const { handleRestrictedAction, isModalOpen, currentRestriction, closeModal } = usePermissionRestriction();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState<number | undefined>(undefined);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { theme } = useTheme();

  // Carregar comentários
  const loadComments = async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await taskCommentService.getTaskComments(projectId, taskId, page, 10);
      
      if (append) {
        setComments(prev => [...prev, ...response.comments]);
      } else {
        setComments(response.comments);
      }
      
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.current_page);
      setHasMore(response.pagination.current_page < response.pagination.pages);
    } catch (error: any) {
      console.error('Erro ao carregar comentários:', error);
      toast.error('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  // Carregar comentários iniciais
  useEffect(() => {
    loadComments(1, false);
  }, [projectId, taskId]);

  // Criar novo comentário
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Verificar se pode avaliar tarefas
    if (newRating !== undefined && !handleRestrictedAction('rate_task')) {
      return;
    }

    try {
      setSubmitting(true);
      const data: CreateCommentData = { 
        content: newComment.trim(),
        rating: newRating
      };
      const comment = await taskCommentService.createComment(projectId, taskId, data);
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setNewRating(undefined);
      toast.success('Comentário adicionado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar comentário:', error);
      toast.error('Erro ao criar comentário');
    } finally {
      setSubmitting(false);
    }
  };

  // Iniciar edição de comentário
  const handleStartEdit = (comment: TaskComment) => {
    // Verificar se pode editar comentários de outros usuários
    if (comment.user_id !== user?.id && !handleRestrictedAction('edit_any_comment')) {
      return;
    }

    setEditingComment(comment.id);
    setEditContent(comment.content);
    setEditRating(comment.rating);
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
    setEditRating(undefined);
  };

  // Salvar edição
  const handleSaveEdit = async (commentId: number) => {
    if (!editContent.trim()) return;

    // Verificar se pode avaliar tarefas
    if (editRating !== undefined && !handleRestrictedAction('rate_task')) {
      return;
    }

    try {
      setSubmitting(true);
      const updatedComment = await taskCommentService.updateComment(
        projectId, 
        taskId, 
        commentId, 
        { 
          content: editContent.trim(),
          rating: editRating
        }
      );
      
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? updatedComment : comment
        )
      );
      
      setEditingComment(null);
      setEditContent('');
      setEditRating(undefined);
      toast.success('Comentário atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar comentário:', error);
      toast.error('Erro ao atualizar comentário');
    } finally {
      setSubmitting(false);
    }
  };

  // Excluir comentário
  const handleDeleteComment = async (commentId: number) => {
    // Verificar se pode deletar comentários de outros usuários
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.user_id !== user?.id && !handleRestrictedAction('delete_any_comment')) {
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      setSubmitting(true);
      await taskCommentService.deleteComment(projectId, taskId, commentId);
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success('Comentário excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir comentário:', error);
      toast.error('Erro ao excluir comentário');
    } finally {
      setSubmitting(false);
    }
  };

  // Carregar mais comentários
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadComments(currentPage + 1, true);
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Calcular média de ratings
  const calculateAverageRating = () => {
    const ratedComments = comments.filter(comment => comment.rating !== undefined && comment.rating !== null && comment.rating > 0);
    if (ratedComments.length === 0) return null;
    
    const totalRating = ratedComments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
    return Math.round((totalRating / ratedComments.length) * 10) / 10; // Arredondar para 1 casa decimal
  };

  const averageRating = calculateAverageRating();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className={theme === 'dark' ? 'text-lg font-medium text-dark-text' : 'text-lg font-medium text-gray-900'}>Comentários</h2>
          {averageRating && (
            <div className="flex items-center space-x-2">
              <span className={theme === 'dark' ? 'text-sm text-dark-muted' : 'text-sm text-gray-600'}>Média:</span>
              <Rating
                value={Math.round(averageRating)}
                readonly={true}
                size="sm"
                showValue={true}
              />
              <span className={theme === 'dark' ? 'text-xs text-dark-muted' : 'text-xs text-gray-500'}>
                ({comments.filter(c => c.rating && c.rating > 0).length} avaliações)
              </span>
            </div>
          )}
        </div>
        <span className={theme === 'dark' ? 'text-sm text-dark-muted' : 'text-sm text-gray-500'}>{comments.length} comentário{comments.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Formulário para novo comentário */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            rows={3}
            className={theme === 'dark' ? 'w-full px-3 py-2 border border-dark-border rounded-md shadow-sm bg-dark-accent text-dark-text focus:outline-none focus:ring-primary focus:border-primary resize-none' : 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-primary focus:border-primary resize-none'}
            disabled={submitting}
          />
        </div>
        
        {/* Rating para novo comentário */}
        <div className="flex items-center space-x-3">
          <span className={theme === 'dark' ? 'text-sm font-medium text-dark-text' : 'text-sm font-medium text-gray-700'}>Avaliação:</span>
          <Rating
            value={newRating || 0}
            onChange={setNewRating}
            size="md"
            showValue={true}
          />
          {newRating && (
            <button
              type="button"
              onClick={() => setNewRating(undefined)}
              className={theme === 'dark' ? 'text-sm text-dark-muted hover:text-dark-text' : 'text-sm text-gray-500 hover:text-gray-700'}
            >
              Limpar
            </button>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!newComment.trim() || submitting}
            isLoading={submitting}
          >
            Comentar
          </Button>
        </div>
      </form>

      {/* Lista de comentários */}
      <div className="space-y-4">
        {loading && comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className={theme === 'dark' ? 'mt-2 text-sm text-dark-muted' : 'mt-2 text-sm text-gray-500'}>Carregando comentários...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className={theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className={theme === 'dark' ? 'bg-dark-secondary rounded-lg p-4' : 'bg-gray-50 rounded-lg p-4'}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={theme === 'dark' ? 'text-sm font-medium text-dark-text' : 'text-sm font-medium text-gray-900'}>{comment.user.name}</p>
                      <p className={theme === 'dark' ? 'text-xs text-dark-muted' : 'text-xs text-gray-500'}>{formatDate(comment.created_at)}</p>
                    </div>
                  </div>
                  
                  {/* Ações do comentário (apenas para o autor) */}
                  {user?.id === comment.user_id && (
                    <div className="flex items-center space-x-2">
                      {editingComment === comment.id ? (
                        <>
                          <Button
                            variant="save"
                            size="xs"
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={submitting}
                            isLoading={submitting}
                          >
                            Salvar
                          </Button>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={handleCancelEdit}
                            disabled={submitting}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleStartEdit(comment)}
                            disabled={submitting}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="delete"
                            size="xs"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={submitting}
                            isLoading={submitting}
                          >
                            Excluir
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Rating do comentário */}
                {comment.rating && comment.rating > 0 && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={theme === 'dark' ? 'text-sm text-dark-muted' : 'text-sm text-gray-600'}>Avaliação:</span>
                    <Rating
                      value={comment.rating}
                      readonly={true}
                      size="sm"
                      showValue={true}
                    />
                  </div>
                )}
                
                <div className="mt-3">
                  {editingComment === comment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className={theme === 'dark' ? 'w-full px-3 py-2 border border-dark-border rounded-md shadow-sm bg-dark-accent text-dark-text focus:outline-none focus:ring-primary focus:border-primary resize-none' : 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-primary focus:border-primary resize-none'}
                        disabled={submitting}
                      />
                      <div className="flex items-center space-x-3">
                        <span className={theme === 'dark' ? 'text-sm font-medium text-dark-text' : 'text-sm font-medium text-gray-700'}>Avaliação:</span>
                        <Rating
                          value={editRating || 0}
                          onChange={setEditRating}
                          size="sm"
                          showValue={true}
                        />
                        {editRating && (
                          <button
                            type="button"
                            onClick={() => setEditRating(undefined)}
                            className={theme === 'dark' ? 'text-sm text-dark-muted hover:text-dark-text' : 'text-sm text-gray-500 hover:text-gray-700'}
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className={theme === 'dark' ? 'text-sm text-dark-text whitespace-pre-wrap break-words' : 'text-sm text-gray-700 whitespace-pre-wrap break-words'}>
                      {comment.content}
                    </p>
                  )}
                </div>
                
                {comment.updated_at !== comment.created_at && (
                  <p className={theme === 'dark' ? 'mt-2 text-xs text-dark-muted' : 'mt-2 text-xs text-gray-400'}>
                    Editado em {formatDate(comment.updated_at)}
                  </p>
                )}
              </div>
            ))}
            
            {/* Botão para carregar mais comentários */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loading}
                  isLoading={loading}
                >
                  Carregar mais comentários
                </Button>
              </div>
            )}
          </>
        )}
      </div>

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

export default TaskComments; 