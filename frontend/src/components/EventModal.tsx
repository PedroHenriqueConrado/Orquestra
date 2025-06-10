import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import ColorPicker from './ui/ColorPicker';
import MemberSelector from './MemberSelector';
import { Project } from '../services/project.service';
import { CreateEventData, UpdateEventData } from '../services/event.service';
import projectService from '../services/project.service';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: CreateEventData | UpdateEventData, projectId: number) => Promise<void>;
  event?: any;
  mode: 'create' | 'edit';
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, event, mode }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('09:00');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [color, setColor] = useState('#3174ad');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [attendees, setAttendees] = useState<number[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProjects();
  }, []);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      
      const startDateTime = event.start ? new Date(event.start) : new Date();
      setStartDate(formatDate(startDateTime));
      setStartTime(formatTime(startDateTime));
      
      const endDateTime = event.end ? new Date(event.end) : new Date(startDateTime.getTime() + 60 * 60 * 1000);
      setEndDate(formatDate(endDateTime));
      setEndTime(formatTime(endDateTime));
      
      setAllDay(event.allDay || false);
      setLocation(event.location || '');
      setColor(event.resource?.color || '#3174ad');
      
      if (event.resource?.project?.id) {
        setProjectId(event.resource.project.id);
        fetchProjectMembers(event.resource.project.id);
      }
      
      if (event.attendees) {
        setAttendees(event.attendees.map((a: any) => a.user_id));
      }
    }
  }, [event]);

  useEffect(() => {
    if (projectId) {
      fetchProjectMembers(projectId);
    }
  }, [projectId]);

  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getUserProjects();
      setProjects(response);
      
      if (response.length > 0 && !projectId) {
        setProjectId(response[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      setError('Não foi possível carregar seus projetos.');
      setLoading(false);
    }
  };

  const fetchProjectMembers = async (pid: number) => {
    try {
      setLoading(true);
      const response = await projectService.getProjectMembers(pid);
      setProjectMembers(response);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar membros do projeto:', error);
      setError('Não foi possível carregar os membros do projeto.');
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (date: Date) => {
    return date.toTimeString().substring(0, 5);
  };

  const handleSubmit = async () => {
    if (!projectId) {
      setError('Por favor, selecione um projeto.');
      return;
    }

    if (!title.trim()) {
      setError('Por favor, informe um título para o evento.');
      return;
    }

    if (!startDate) {
      setError('Por favor, informe a data de início.');
      return;
    }

    if (!endDate) {
      setError('Por favor, informe a data de término.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const startDateTime = new Date(`${startDate}T${allDay ? '00:00' : startTime}`);
      const endDateTime = new Date(`${endDate}T${allDay ? '23:59' : endTime}`);
      
      // Verificar se a data de término é posterior à data de início
      if (endDateTime <= startDateTime) {
        setError('A data/hora de término deve ser posterior à data/hora de início.');
        setLoading(false);
        return;
      }
      
      const eventData = {
        id: mode === 'edit' ? event.id : undefined,
        project_id: projectId,
        title,
        description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        all_day: allDay,
        location,
        color,
        attendees
      };
      
      await onSave(eventData, projectId);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      setError('Ocorreu um erro ao salvar o evento. Por favor, tente novamente.');
      setLoading(false);
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>
          
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 my-8">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                    {mode === 'create' ? 'Criar Novo Evento' : 'Editar Evento'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                    onClick={onClose}
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {error && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Projeto</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      value={projectId || ''}
                      onChange={(e) => setProjectId(Number(e.target.value))}
                      disabled={loading}
                      required
                    >
                      <option value="">Selecione um projeto</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={loading}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allDay"
                      checked={allDay}
                      onChange={(e) => setAllDay(e.target.checked)}
                      className="h-4 w-4 text-blue-600 dark:text-blue-500 rounded border-gray-300 dark:border-gray-600"
                      disabled={loading}
                    />
                    <label htmlFor="allDay" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Evento de dia inteiro
                    </label>
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Início</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    {!allDay && (
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora Início</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          disabled={loading}
                          required={!allDay}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Fim</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    {!allDay && (
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hora Fim</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          disabled={loading}
                          required={!allDay}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Local</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor do Evento</label>
                    <ColorPicker
                      color={color}
                      onChange={setColor}
                      presetColors={[
                        '#3174ad', '#4CAF50', '#F44336', '#9C27B0', 
                        '#FF9800', '#795548', '#607D8B', '#FFEB3B'
                      ]}
                    />
                  </div>
                  
                  {projectId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Participantes</label>
                      <MemberSelector
                        projectId={projectId}
                        selectedMembers={attendees}
                        onChange={setAttendees}
                        members={projectMembers}
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : mode === 'create' ? 'Criar Evento' : 'Salvar Alterações'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EventModal;

