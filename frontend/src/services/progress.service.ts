import taskService from './task.service';
import type { Task } from './task.service';

class ProgressService {
  // Calcula o progresso baseado nas tarefas
  calculateProgress(tasks: Task[]): number {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  // Calcula o progresso de um projeto específico
  async getProjectProgress(projectId: number): Promise<number> {
    try {
      const tasks = await taskService.getProjectTasks(projectId);
      return this.calculateProgress(tasks);
    } catch (error) {
      console.error('Erro ao calcular progresso do projeto:', error);
      return 0;
    }
  }

  // Determina o status do projeto baseado no progresso
  getProjectStatus(progress: number): string {
    if (progress === 100) return 'Concluído';
    if (progress === 0) return 'Não iniciado';
    return 'Em progresso';
  }
}

export default new ProgressService(); 