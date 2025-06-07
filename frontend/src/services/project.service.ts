import api from './api.service';
import type { TaskData } from './task.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ProjectData {
  name: string;
  description?: string;
  initialTasks?: TaskData[];
  initialMembers?: number[];
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  members: ProjectMember[];
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: string;
  joined_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface MemberData {
  userId: number;
  role: 'developer' | 'supervisor' | 'tutor' | 'project_manager' | 'team_leader';
}

class ProjectService {
  async createProject(data: ProjectData): Promise<Project> {
    try {
      // Primeiro cria o projeto básico
      const response = await api.post<Project>('/projects', {
        name: data.name,
        description: data.description
      });
      
      const newProject = response.data;
      const projectId = newProject.id;
      
      // Se houver tarefas iniciais, cria cada uma delas
      if (data.initialTasks && data.initialTasks.length > 0) {
        console.log(`Criando ${data.initialTasks.length} tarefas iniciais para o projeto ${projectId}`);
        
        // Criamos as tarefas em paralelo, convertendo os nomes dos campos para o formato esperado pelo backend
        await Promise.all(
          data.initialTasks.map(taskData => {
            // Convertendo os nomes dos campos do frontend para o formato esperado pelo backend
            const backendTaskData = {
              title: taskData.title,
              description: taskData.description,
              status: taskData.status,
              priority: taskData.priority,
              // Conversão de nomes:
              dueDate: taskData.due_date,  // backend espera dueDate, frontend usa due_date
              assignedTo: taskData.assigned_to,  // backend espera assignedTo, frontend usa assigned_to
              estimatedHours: taskData.estimated_hours,  // backend espera estimatedHours
              parentTaskId: taskData.parent_task_id  // backend espera parentTaskId
            };
            
            return api.post(`/projects/${projectId}/tasks`, backendTaskData);
          })
        );
      }
      
      // Se houver membros iniciais (além do criador), adiciona cada um deles
      if (data.initialMembers && data.initialMembers.length > 0) {
        console.log(`Adicionando ${data.initialMembers.length} membros iniciais ao projeto ${projectId}`);
        
        // Adicionamos os membros em paralelo
        await Promise.all(
          data.initialMembers.map(userId => 
            api.post(`/projects/${projectId}/members`, {
              userId,
              role: 'developer' // Por padrão, novos membros são desenvolvedores
            })
          )
        );
      }
      
      // Retorna o projeto criado (potencialmente desatualizado, sem as tarefas/membros adicionados)
      return newProject;
    } catch (error: any) {
      console.error('Erro ao criar projeto:', error);
      throw new Error(error.message || 'Erro ao criar projeto');
    }
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      const response = await api.get<Project[]>('/projects');
      // Sempre retornar um array, mesmo que vazio
      return response.data || [];
    } catch (error: any) {
      console.error('Erro ao buscar projetos:', error);
      if (error.response?.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
      throw new Error('Erro ao carregar projetos. Tente novamente.');
    }
  }

  async getProjectById(id: number): Promise<Project> {
    try {
      const response = await api.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao buscar projeto ${id}:`, error);
      throw new Error(error.message || 'Erro ao buscar projeto');
    }
  }

  async updateProject(id: number, data: ProjectData): Promise<Project> {
    try {
      const response = await api.put<Project>(`/projects/${id}`, {
        name: data.name,
        description: data.description
      });
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao atualizar projeto ${id}:`, error);
      throw new Error(error.message || 'Erro ao atualizar projeto');
    }
  }

  async deleteProject(id: number): Promise<void> {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error: any) {
      console.error(`Erro ao excluir projeto ${id}:`, error);
      throw new Error(error.message || 'Erro ao excluir projeto');
    }
  }

  async getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    try {
      const response = await api.get<ProjectMember[]>(`/projects/${projectId}/members`);
      return response.data || [];
    } catch (error: any) {
      console.error(`Erro ao buscar membros do projeto ${projectId}:`, error);
      throw new Error(error.message || 'Erro ao buscar membros do projeto');
    }
  }

  async addMember(projectId: number, data: MemberData): Promise<ProjectMember> {
    try {
      const response = await api.post<ProjectMember>(`/projects/${projectId}/members`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Erro ao adicionar membro ao projeto ${projectId}:`, error);
      throw new Error(error.message || 'Erro ao adicionar membro ao projeto');
    }
  }

  async removeMember(projectId: number, userId: number): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
    } catch (error: any) {
      console.error(`Erro ao remover membro do projeto ${projectId}:`, error);
      throw new Error(error.message || 'Erro ao remover membro do projeto');
    }
  }

  async addProjectMember(projectId: number, userId: number): Promise<void> {
    await api.post(`/projects/${projectId}/members`, { user_id: userId });
  }
}

export default new ProjectService(); 