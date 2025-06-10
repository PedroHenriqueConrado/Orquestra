import api from './api.service';

export interface EventAttendee {
  event_id: number;
  user_id: number;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  user: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface Event {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  color?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  attendees?: EventAttendee[];
  creator?: {
    id: number;
    name: string;
  };
  project?: {
    id: number;
    name: string;
  };
}

export interface CreateEventData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  location?: string;
  color?: string;
  attendees?: number[];
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  all_day?: boolean;
  location?: string;
  color?: string;
  attendees?: number[];
}

export interface CalendarResponse {
  events: Event[];
  tasks: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    all_day: boolean;
    isTask: boolean;
    status: string;
    priority: string;
    project: {
      id: number;
      name: string;
    };
  }[];
}

/**
 * Serviço para gerenciar eventos
 */
const eventService = {
  /**
   * Cria um novo evento
   */
  async createEvent(projectId: number, data: CreateEventData): Promise<Event> {
    const response = await api.post(`/api/projects/${projectId}/events`, data);
    return response.data;
  },

  /**
   * Obtém todos os eventos de um projeto
   */
  async getProjectEvents(projectId: number, startDate?: string, endDate?: string): Promise<Event[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/api/projects/${projectId}/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtém detalhes de um evento específico
   */
  async getEvent(projectId: number, eventId: number): Promise<Event> {
    const response = await api.get(`/api/projects/${projectId}/events/${eventId}`);
    return response.data;
  },

  /**
   * Atualiza um evento existente
   */
  async updateEvent(projectId: number, eventId: number, data: UpdateEventData): Promise<Event> {
    const response = await api.put(`/api/projects/${projectId}/events/${eventId}`, data);
    return response.data;
  },

  /**
   * Exclui um evento
   */
  async deleteEvent(projectId: number, eventId: number): Promise<void> {
    await api.delete(`/api/projects/${projectId}/events/${eventId}`);
  },

  /**
   * Obtém eventos de todos os projetos do usuário para o calendário
   */
  async getUserCalendar(startDate?: string, endDate?: string): Promise<CalendarResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/api/calendar/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Responde a um convite de evento
   */
  async respondToEventInvite(eventId: number, status: 'accepted' | 'declined' | 'tentative'): Promise<void> {
    await api.put(`/api/calendar/events/${eventId}/respond`, { status });
  }
};

export default eventService;
