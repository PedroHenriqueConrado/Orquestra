import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import eventService, { CreateEventData, Event } from '../services/event.service';
import AppLayout from '../layouts/AppLayout';
import EventModal from '../components/EventModal';

// Configurar o momento para português do Brasil
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Carregar eventos do calendário
  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Definir intervalo de datas para buscar (2 meses antes e depois do mês atual)
      const start = moment().startOf('month').subtract(1, 'month').format('YYYY-MM-DD');
      const end = moment().endOf('month').add(2, 'month').format('YYYY-MM-DD');
      
      const response = await eventService.getUserCalendar(start, end);
      
      // Formatar eventos para o formato esperado pelo react-big-calendar
      const formattedEvents = [
        ...response.events.map((event: Event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          allDay: event.all_day,
          resource: { 
            type: 'event',
            color: event.color || '#3174ad',
            project: event.project,
            description: event.description,
            location: event.location,
            event: event
          }
        })),
        ...response.tasks.map((task: any) => ({
          id: task.id,
          title: `[Tarefa] ${task.title}`,
          start: new Date(task.start_time),
          end: new Date(task.end_time),
          allDay: task.all_day,
          resource: { 
            type: 'task',
            color: getTaskPriorityColor(task.priority),
            project: task.project,
            status: task.status
          }
        }))
      ];
      
      setEvents(formattedEvents);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados do calendário:', error);
      setError('Não foi possível carregar os eventos do calendário.');
      setIsLoading(false);
    }
  };

  // Função para obter cor baseada na prioridade da tarefa
  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#8bc34a';
      case 'medium': return '#ffb74d';
      case 'high': return '#f44336';
      case 'urgent': return '#9c27b0';
      default: return '#2196f3';
    }
  };

  // Manipular clique em um evento
  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    
    if (event.resource.type === 'event') {
      setModalMode('edit');
      setShowModal(true);
    } else if (event.resource.type === 'task') {
      // Redirecionar para a página de detalhes da tarefa
      const taskId = event.id.replace('task-', '');
      navigate(`/projects/${event.resource.project.id}/tasks/${taskId}`);
    }
  };

  // Manipular seleção de slot (criar novo evento)
  const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
    setSelectedEvent({ 
      start, 
      end,
      title: '',
      description: '',
      allDay: false,
      location: '',
      color: '#3174ad',
      attendees: []
    });
    setModalMode('create');
    setShowModal(true);
  };

  // Manipular salvamento de evento
  const handleSaveEvent = async (eventData: CreateEventData, projectId: number) => {
    try {
      setIsLoading(true);
      
      if (modalMode === 'create') {
        await eventService.createEvent(projectId, eventData);
      } else {
        const eventId = selectedEvent.resource.event.id;
        await eventService.updateEvent(projectId, eventId, eventData);
      }
      
      setShowModal(false);
      await fetchCalendarData();
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      setIsLoading(false);
      throw error;
    }
  };

  // Componente para renderização personalizada de eventos
  const EventComponent = ({ event }: any) => {
    const { title, resource } = event;
    const backgroundColor = resource?.color || '#3174ad';
    
    return (
      <div
        style={{
          backgroundColor,
          color: 'white',
          borderRadius: '4px',
          padding: '2px 5px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          height: '100%'
        }}
      >
        {title}
        {resource?.type === 'task' && (
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              marginLeft: '5px',
              backgroundColor: resource.status === 'completed' ? '#4caf50' : '#f44336'
            }}
          />
        )}
      </div>
    );
  };

  // Personalizar mensagens do calendário
  const messages = {
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    today: 'Hoje',
    previous: 'Anterior',
    next: 'Próximo',
    agenda: 'Agenda',
    showMore: (total: number) => `+ ${total} mais`
  };

  return (
    <AppLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Calendário de Projetos</h1>
          <button
            onClick={() => {
              setSelectedEvent({
                start: new Date(),
                end: new Date(new Date().getTime() + 60 * 60 * 1000),
                title: '',
                allDay: false
              });
              setModalMode('create');
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Novo Evento
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md h-[700px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 650 }}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              popup
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              defaultView={Views.MONTH}
              components={{
                event: EventComponent
              }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: 'transparent',
                  border: 'none'
                }
              })}
              messages={messages}
            />
          </div>
        )}
        
        {showModal && (
          <EventModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveEvent}
            event={selectedEvent}
            mode={modalMode}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default CalendarView;

