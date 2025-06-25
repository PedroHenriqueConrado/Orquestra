import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import searchService from '../services/search.service';
import type {
  QuickSearchResult,
  GlobalSearchResponse,
  ProjectSearchResult,
  TaskSearchResult,
  DocumentSearchResult
} from '../services/search.service';

interface GlobalSearchProps {
  className?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [quickResults, setQuickResults] = useState<QuickSearchResult[]>([]);
  const [globalResults, setGlobalResults] = useState<GlobalSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGlobalResults, setShowGlobalResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  let debounceTimeout = useRef<number | undefined>(undefined);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowGlobalResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca rápida com debounce
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.trim().length >= 1) {
      debounceTimeout.current = window.setTimeout(() => {
        performQuickSearch();
      }, 300);
    } else {
      setQuickResults([]);
      setGlobalResults(null);
      setIsOpen(false);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  const performQuickSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await searchService.quickSearch(query.trim(), 5);
      setQuickResults(results);
      setIsOpen(results.length > 0);
    } catch (err: any) {
      setError(err.message);
      setQuickResults([]);
    } finally {
      setLoading(false);
    }
  };

  const performGlobalSearch = async () => {
    if (query.trim().length < 2) return;

    try {
      setLoading(true);
      setError(null);
      const results = await searchService.globalSearch(query.trim(), 'all', 20);
      setGlobalResults(results);
      setShowGlobalResults(true);
      setIsOpen(true);
    } catch (err: any) {
      setError(err.message);
      setGlobalResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowGlobalResults(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performGlobalSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setShowGlobalResults(false);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (result: QuickSearchResult) => {
    if (result.type === 'project') {
      navigate(`/projects/${result.id}`);
    } else if (result.type === 'task') {
      navigate(`/projects/${result.project?.id}/tasks/${result.id}`);
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleGlobalResultClick = (type: string, id: number, projectId?: number) => {
    if (type === 'project') {
      navigate(`/projects/${id}`);
    } else if (type === 'task' && projectId) {
      navigate(`/projects/${projectId}/tasks/${id}`);
    } else if (type === 'document' && projectId) {
      navigate(`/projects/${projectId}/documents/${id}`);
    }
    setIsOpen(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setQuickResults([]);
    setGlobalResults(null);
    setIsOpen(false);
    setShowGlobalResults(false);
    inputRef.current?.focus();
  };

  const renderQuickResult = (result: QuickSearchResult) => (
    <div
      key={`${result.type}-${result.id}`}
      onClick={() => handleResultClick(result)}
      className={`p-3 hover:bg-theme-secondary cursor-pointer transition-colors duration-200 ${
        theme === 'dark' ? 'border-b border-dark-border' : 'border-b border-gray-200'
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-lg">{searchService.getResultIcon(result.type)}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
            {result.title || result.name}
          </p>
          {result.description && (
            <p className={`text-xs truncate ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}>
              {result.description}
            </p>
          )}
          {result.project && (
            <p className={`text-xs ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-400'}`}>
              Projeto: {result.project.name}
            </p>
          )}
        </div>
        {result.type === 'task' && result.status && (
          <span className={`px-2 py-1 text-xs rounded-full ${searchService.getStatusColor(result.status)}`}>
            {searchService.getStatusText(result.status)}
          </span>
        )}
      </div>
    </div>
  );

  const renderGlobalResults = () => {
    if (!globalResults) return null;

    const { projects, tasks, documents, total } = globalResults;

    return (
      <div className="max-h-96 overflow-y-auto">
        {/* Cabeçalho */}
        <div className={`px-4 py-2 border-b ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'}`}>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
            {total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Projetos */}
        {projects.length > 0 && (
          <div>
            <div className={`px-4 py-2 bg-theme-secondary ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'} text-xs font-medium uppercase tracking-wide`}>
              Projetos ({projects.length})
            </div>
            {projects.map((project) => (
              <div
                key={`project-${project.id}`}
                onClick={() => handleGlobalResultClick('project', project.id)}
                className={`p-3 hover:bg-theme-secondary cursor-pointer transition-colors duration-200 ${
                  theme === 'dark' ? 'border-b border-dark-border' : 'border-b border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📁</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
                      {project.name}
                    </p>
                    {project.description && (
                      <p className={`text-xs truncate ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}>
                        {project.description}
                      </p>
                    )}
                    <p className={`text-xs ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-400'}`}>
                      {project._count.tasks} tarefas • {project._count.members} membros
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tarefas */}
        {tasks.length > 0 && (
          <div>
            <div className={`px-4 py-2 bg-theme-secondary ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'} text-xs font-medium uppercase tracking-wide`}>
              Tarefas ({tasks.length})
            </div>
            {tasks.map((task) => (
              <div
                key={`task-${task.id}`}
                onClick={() => handleGlobalResultClick('task', task.id, task.project.id)}
                className={`p-3 hover:bg-theme-secondary cursor-pointer transition-colors duration-200 ${
                  theme === 'dark' ? 'border-b border-dark-border' : 'border-b border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📋</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className={`text-xs truncate ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${searchService.getStatusColor(task.status)}`}>
                        {searchService.getStatusText(task.status)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${searchService.getPriorityColor(task.priority)}`}>
                        {searchService.getPriorityText(task.priority)}
                      </span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-400'}`}>
                        {task.project.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Documentos */}
        {documents.length > 0 && (
          <div>
            <div className={`px-4 py-2 bg-theme-secondary ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'} text-xs font-medium uppercase tracking-wide`}>
              Documentos ({documents.length})
            </div>
            {documents.map((document) => (
              <div
                key={`document-${document.id}`}
                onClick={() => handleGlobalResultClick('document', document.id, document.project.id)}
                className={`p-3 hover:bg-theme-secondary cursor-pointer transition-colors duration-200 ${
                  theme === 'dark' ? 'border-b border-dark-border' : 'border-b border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-dark-text' : 'text-gray-900'}`}>
                      {document.title}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-400'}`}>
                      {document.project.name} • Criado por {document.creator.name}
                    </p>
                    {document.versions.length > 0 && (
                      <p className={`text-xs ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-400'}`}>
                        v{document.versions[0].version_number} • {document.versions[0].original_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nenhum resultado */}
        {total === 0 && (
          <div className="p-4 text-center">
            <p className={`text-sm ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}>
              Nenhum resultado encontrado para "{query}"
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Campo de busca */}
      <div className="relative">
        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-400'}`}>
          <MagnifyingGlassIcon className="h-5 w-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={() => {
            if (query.trim().length >= 1) {
              setIsOpen(true);
            }
          }}
          placeholder="Buscar projetos, tarefas, documentos..."
          className={`block w-full pl-10 pr-10 py-2 border border-theme rounded-md leading-5 ${
            theme === 'dark' 
              ? 'bg-dark-accent text-dark-text placeholder-dark-muted focus:ring-primary-light focus:border-primary-light' 
              : 'bg-white text-gray-900 placeholder-gray-400 focus:ring-primary focus:border-primary'
          } transition-colors duration-200`}
        />
        {query && (
          <button
            onClick={clearSearch}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${theme === 'dark' ? 'text-dark-muted hover:text-dark-text' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 rounded-md shadow-lg border ${
          theme === 'dark' 
            ? 'bg-dark-surface border-dark-border' 
            : 'bg-white border-gray-200'
        } transition-colors duration-200`}>
          {loading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}>
                Buscando...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 text-center">
              <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                {error}
              </p>
            </div>
          )}

          {!loading && !error && (
            <>
              {showGlobalResults ? (
                renderGlobalResults()
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {quickResults.map(renderQuickResult)}
                  {quickResults.length > 0 && (
                    <div className={`p-2 border-t ${theme === 'dark' ? 'border-dark-border' : 'border-gray-200'}`}>
                      <button
                        onClick={performGlobalSearch}
                        className={`w-full text-left text-sm ${theme === 'dark' ? 'text-primary-light hover:text-primary-lighter' : 'text-primary hover:text-primary-dark'}`}
                      >
                        Ver todos os resultados para "{query}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch; 