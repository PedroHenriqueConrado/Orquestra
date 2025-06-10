import React, { useState, useEffect } from 'react';
import { Gantt, Task, ViewMode, DisplayOption } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { addDays, format } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';

// Tipos para as tarefas
interface ProjectTask {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  created_at: string;
  updated_at: string;
  parent_task_id?: number;
  project_id: number;
}

// Cores para cada status de tarefa
const STATUS_COLORS = {
  pending: '#6c757d',
  in_progress: '#0d6efd',
  completed: '#198754',
};

// Cores para cada prioridade
const PRIORITY_COLORS = {
  low: '#28a745',
  medium: '#ffc107',
  high: '#fd7e14',
  urgent: '#dc3545',
};

// Mapear as tarefas do projeto para o formato esperado pelo componente Gantt
const mapTasksToGanttFormat = (tasks: ProjectTask[]): Task[] => {
  // Criar um mapa de ids para facilitar a busca de tarefas pai
  const taskMap = new Map<number, ProjectTask>();
  tasks.forEach(task => taskMap.set(task.id, task));

  return tasks.map(task => {
    // Definir datas de início e fim
    const startDate = new Date(task.created_at);
    // Se houver data de vencimento, usar como data de término
    let endDate = task.due_date 
      ? new Date(task.due_date) 
      : addDays(startDate, 7); // Padrão de 7 dias se não houver data de vencimento

    // Se a data de término for anterior à data de início, ajustar para o dia seguinte
    if (endDate <= startDate) {
      endDate = addDays(startDate, 1);
    }

    // Determinar o tipo de tarefa (projeto, tarefa ou marco)
    const taskType = task.parent_task_id ? 'task' : 'project' as any;

    // Determinar o progresso com base no status
    let progress = 0;
    if (task.status === 'in_progress') progress = 50;
    if (task.status === 'completed') progress = 100;

    // Determinar a cor com base na prioridade
    const styles = {
      backgroundColor: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium,
      progressColor: STATUS_COLORS[task.status] || STATUS_COLORS.pending,
    };

    return {
      id: `${task.id}`,
      name: task.title,
      type: taskType,
      start: startDate,
      end: endDate,
      progress,
      isDisabled: false,
      hideChildren: false,
      project: task.parent_task_id ? `${task.parent_task_id}` : undefined,
      dependencies: task.parent_task_id ? [`${task.parent_task_id}`] : [],
      styles,
    };
  });
};

interface GanttChartProps {
  tasks: ProjectTask[];
  onDateChange?: (task: Task) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, onDateChange }) => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
  const [ganttTasks, setGanttTasks] = useState<Task[]>([]);
  const [columnWidth, setColumnWidth] = useState(60);

  // Preparar os dados de tarefas para o Gantt
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const formattedTasks = mapTasksToGanttFormat(tasks);
      setGanttTasks(formattedTasks);
    }
  }, [tasks]);

  // Configurações de exibição para o Gantt
  const displayOptions: DisplayOption = {
    viewMode,
    viewDate: new Date(),
    preStepsCount: 1,
    locale: 'pt-BR',
    ganttHeight: 400,
    columnWidth,
  };

  // Função chamada quando uma tarefa é expandida ou recolhida
  const handleExpanderClick = (task: Task) => {
    setGanttTasks(tasks => {
      const newTasks = tasks.map(t => {
        if (t.id === task.id) {
          return { ...t, hideChildren: !t.hideChildren };
        }
        return t;
      });
      return newTasks;
    });
  };

  // Função para alterar a visualização do Gantt
  const handleViewModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as ViewMode;
    setViewMode(mode);
    
    // Ajustar largura da coluna com base no modo de visualização
    switch (mode) {
      case ViewMode.Day:
        setColumnWidth(60);
        break;
      case ViewMode.Week:
        setColumnWidth(180);
        break;
      case ViewMode.Month:
        setColumnWidth(300);
        break;
      case ViewMode.Year:
        setColumnWidth(350);
        break;
      default:
        setColumnWidth(60);
    }
  };

  // Estilos customizados com base no tema
  const ganttStyles = {
    container: {
      backgroundColor: theme === 'dark' ? '#1E1E1E' : '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.1)',
    },
    header: {
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      color: theme === 'dark' ? '#E0E0E0' : '#333',
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    legend: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      margin: '10px 0',
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      marginRight: '10px',
    },
    legendColor: (color: string) => ({
      width: '15px',
      height: '15px',
      backgroundColor: color,
      marginRight: '5px',
      borderRadius: '3px',
    }),
    legendText: {
      color: theme === 'dark' ? '#E0E0E0' : '#666',
      fontSize: '0.85rem',
    },
    select: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: theme === 'dark' ? '1px solid #333' : '1px solid #ddd',
      backgroundColor: theme === 'dark' ? '#2C2C2C' : '#fff',
      color: theme === 'dark' ? '#E0E0E0' : '#333',
      fontSize: '0.9rem',
      cursor: 'pointer',
    },
  };

  return (
    <div style={ganttStyles.container} className="gantt-container">
      <div style={ganttStyles.header}>
        <h2 style={ganttStyles.title}>Cronograma do Projeto</h2>
        <select 
          value={viewMode}
          onChange={handleViewModeChange}
          style={ganttStyles.select}
        >
          <option value={ViewMode.Day}>Diário</option>
          <option value={ViewMode.Week}>Semanal</option>
          <option value={ViewMode.Month}>Mensal</option>
          <option value={ViewMode.Year}>Anual</option>
        </select>
      </div>
      
      <div style={ganttStyles.legend}>
        <div style={ganttStyles.legendItem}>
          <div style={ganttStyles.legendColor(PRIORITY_COLORS.low)}></div>
          <span style={ganttStyles.legendText}>Baixa</span>
        </div>
        <div style={ganttStyles.legendItem}>
          <div style={ganttStyles.legendColor(PRIORITY_COLORS.medium)}></div>
          <span style={ganttStyles.legendText}>Média</span>
        </div>
        <div style={ganttStyles.legendItem}>
          <div style={ganttStyles.legendColor(PRIORITY_COLORS.high)}></div>
          <span style={ganttStyles.legendText}>Alta</span>
        </div>
        <div style={ganttStyles.legendItem}>
          <div style={ganttStyles.legendColor(PRIORITY_COLORS.urgent)}></div>
          <span style={ganttStyles.legendText}>Urgente</span>
        </div>
      </div>
      
      {ganttTasks.length > 0 ? (
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          onDateChange={onDateChange}
          onExpanderClick={handleExpanderClick}
          columnWidth={columnWidth}
          listCellWidth="200px"
          rowHeight={40}
          barCornerRadius={3}
          barFill={75}
          todayColor={theme === 'dark' ? '#6c757d' : '#ccc'}
          projectProgressBarStyles={{
            progressColor: theme === 'dark' ? '#FAD956' : '#96874B',
            progressSelectedColor: theme === 'dark' ? '#FAD956' : '#96874B',
          }}
          TooltipContent={({ task }) => (
            <div className={`p-3 ${theme === 'dark' ? 'bg-dark-secondary text-dark-text' : 'bg-white text-gray-700'} rounded shadow-lg`}>
              <h3 className="font-medium">{task.name}</h3>
              <p>Início: {format(task.start, 'dd/MM/yyyy')}</p>
              <p>Término: {format(task.end, 'dd/MM/yyyy')}</p>
              <p>Progresso: {task.progress}%</p>
            </div>
          )}
        />
      ) : (
        <div className={`p-8 text-center ${theme === 'dark' ? 'text-dark-muted' : 'text-gray-500'}`}>
          Não há tarefas para exibir no gráfico.
        </div>
      )}
    </div>
  );
};

export default GanttChart; 