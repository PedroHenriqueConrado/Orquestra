import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos para as tarefas
export interface TaskItem {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedUser?: {
    id: number;
    name: string;
    email: string;
  };
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface Column {
  id: 'pending' | 'in_progress' | 'completed';
  title: string;
  taskIds: number[];
}

interface TaskBoardProps {
  tasks: TaskItem[];
  onTaskMove: (taskId: number, newStatus: string, newPosition?: number) => Promise<void>;
}

const DraggableTaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskMove }) => {
  const { theme } = useTheme();
  const [columns, setColumns] = useState<{ [key: string]: Column }>({
    pending: {
      id: 'pending',
      title: 'Pendentes',
      taskIds: [],
    },
    in_progress: {
      id: 'in_progress',
      title: 'Em Progresso',
      taskIds: [],
    },
    completed: {
      id: 'completed',
      title: 'Concluídas',
      taskIds: [],
    },
  });

  // Configurar as colunas com base nas tarefas recebidas
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const newColumns = {
        pending: {
          ...columns.pending,
          taskIds: tasks
            .filter(task => task.status === 'pending')
            .map(task => task.id),
        },
        in_progress: {
          ...columns.in_progress,
          taskIds: tasks
            .filter(task => task.status === 'in_progress')
            .map(task => task.id),
        },
        completed: {
          ...columns.completed,
          taskIds: tasks
            .filter(task => task.status === 'completed')
            .map(task => task.id),
        },
      };
      setColumns(newColumns);
    }
  }, [tasks]);

  // Lidar com o evento de arrastar e soltar
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Se não há destino válido, não fazer nada
    if (!destination) return;

    // Se o destino é o mesmo que a origem e a posição não mudou, não fazer nada
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = parseInt(draggableId.replace('task-', ''));
    const newStatus = destination.droppableId;
    const newPosition = destination.index;

    // Atualizar o estado local para feedback imediato ao usuário
    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    if (start === finish) {
      // Mover dentro da mesma coluna
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, taskId);

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      });
    } else {
      // Mover para outra coluna
      const startTaskIds = Array.from(start.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStart = {
        ...start,
        taskIds: startTaskIds,
      };

      const finishTaskIds = Array.from(finish.taskIds);
      finishTaskIds.splice(destination.index, 0, taskId);
      const newFinish = {
        ...finish,
        taskIds: finishTaskIds,
      };

      setColumns({
        ...columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      });
    }

    // Chamar a função para atualizar o status e posição no servidor
    try {
      await onTaskMove(taskId, newStatus, newPosition);
    } catch (error) {
      console.error('Erro ao mover tarefa:', error);
      // Reverter a operação em caso de erro
      // Você poderia recarregar as tarefas ou restaurar o estado anterior aqui
    }
  };

  // Função auxiliar para obter uma tarefa pelo ID
  const getTaskById = (id: number) => {
    return tasks.find(task => task.id === id);
  };

  // Cores para cada prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return theme === 'dark' ? '#2c5b42' : '#d1e7dd';
      case 'medium': return theme === 'dark' ? '#6b5627' : '#fff3cd';
      case 'high': return theme === 'dark' ? '#774215' : '#ffe5d0';
      case 'urgent': return theme === 'dark' ? '#842029' : '#f8d7da';
      default: return theme === 'dark' ? '#6b5627' : '#fff3cd';
    }
  };

  // Traduzir prioridade para português
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return 'Média';
    }
  };

  // Formatação de data relativa (ex: "há 2 dias")
  const formatRelativeDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className={`rounded-lg ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'} p-4 shadow-md transition-colors duration-200`}>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-dark-text' : 'text-gray-800'}`}>
        Quadro de Tarefas
      </h2>

      <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto pb-2">
        <DragDropContext onDragEnd={handleDragEnd}>
          {Object.values(columns).map(column => (
            <div 
              key={column.id} 
              className="flex-1 min-w-[280px]"
            >
              <div 
                className={`${
                  column.id === 'pending'
                    ? theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    : column.id === 'in_progress'
                    ? theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'
                    : theme === 'dark' ? 'bg-green-900' : 'bg-green-100'
                } p-3 rounded-t-lg`}
              >
                <h3 className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-800'}`}>
                  {column.title} ({column.taskIds.length})
                </h3>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`${
                      theme === 'dark' ? 'bg-dark-accent' : 'bg-gray-50'
                    } ${
                      snapshot.isDraggingOver ? theme === 'dark' ? 'bg-dark-primary' : 'bg-gray-100' : ''
                    } p-2 rounded-b-lg min-h-[300px] transition-colors duration-200`}
                  >
                    {column.taskIds.map((taskId, index) => {
                      const task = getTaskById(taskId);
                      if (!task) return null;

                      return (
                        <Draggable 
                          key={`task-${task.id}`} 
                          draggableId={`task-${task.id}`} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${
                                theme === 'dark' ? 'bg-dark-secondary' : 'bg-white'
                              } ${
                                snapshot.isDragging ? theme === 'dark' ? 'shadow-lg' : 'shadow-md' : 'shadow'
                              } p-3 mb-2 rounded-lg border-l-4 transition-all duration-200`}
                              style={{
                                borderLeftColor: getPriorityColor(task.priority),
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className={`font-medium ${theme === 'dark' ? 'text-dark-text' : 'text-gray-800'}`}>
                                  {task.title}
                                </h4>
                                <span 
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    theme === 'dark' ? 'text-dark-text' : 'text-gray-700'
                                  }`}
                                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                                >
                                  {getPriorityText(task.priority)}
                                </span>
                              </div>
                              
                              {task.description && (
                                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-600'} line-clamp-2`}>
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="mt-3 flex flex-wrap justify-between gap-y-1">
                                {task.assignedUser && (
                                  <div className={`text-xs ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'} flex items-center`}>
                                    <span className="w-5 h-5 rounded-full bg-primary-lighter flex items-center justify-center text-white mr-1">
                                      {task.assignedUser.name.charAt(0).toUpperCase()}
                                    </span>
                                    {task.assignedUser.name}
                                  </div>
                                )}
                                
                                {task.due_date && (
                                  <div className={`text-xs ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}>
                                    Prazo: {formatRelativeDate(task.due_date)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                    
                    {column.taskIds.length === 0 && (
                      <div className={`text-center py-4 ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-400'} text-sm italic`}>
                        Sem tarefas
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
};

export default DraggableTaskBoard; 