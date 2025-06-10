const prisma = require('../prismaClient');
const logger = require('../utils/logger');

/**
 * Cria um novo evento
 */
exports.createEvent = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, start_time, end_time, all_day, location, color, attendees } = req.body;
  const userId = req.user.id;

  try {
    logger.debug('Criando novo evento', { projectId, title, userId });

    // Verificar se o usuário tem permissão no projeto
    const isMember = await prisma.projectMember.findFirst({
      where: {
        project_id: Number(projectId),
        user_id: userId
      }
    });

    if (!isMember) {
      logger.warn('Tentativa de criar evento em projeto sem permissão', { userId, projectId });
      return res.status(403).json({ error: 'Você não tem permissão para criar eventos neste projeto' });
    }

    // Criar o evento
    const event = await prisma.event.create({
      data: {
        title,
        description,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        all_day: all_day || false,
        location,
        color,
        project: { connect: { id: Number(projectId) } },
        creator: { connect: { id: userId } },
        attendees: {
          create: attendees?.map(attendeeId => ({
            user: { connect: { id: Number(attendeeId) } }
          })) || []
        }
      },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    logger.success('Evento criado com sucesso', { eventId: event.id });
    return res.status(201).json(event);
  } catch (error) {
    logger.error('Erro ao criar evento', error);
    return res.status(500).json({ error: 'Erro ao criar evento' });
  }
};

/**
 * Obtém eventos de um projeto
 */
exports.getProjectEvents = async (req, res) => {
  const { projectId } = req.params;
  const { startDate, endDate } = req.query;
  const userId = req.user.id;
  
  try {
    logger.debug('Buscando eventos do projeto', { projectId, startDate, endDate });
    
    // Verificar se o usuário tem permissão no projeto
    const isMember = await prisma.projectMember.findFirst({
      where: {
        project_id: Number(projectId),
        user_id: userId
      }
    });

    if (!isMember) {
      logger.warn('Tentativa de acessar eventos de projeto sem permissão', { userId, projectId });
      return res.status(403).json({ error: 'Você não tem permissão para acessar este projeto' });
    }
    
    const where = {
      project_id: Number(projectId)
    };
    
    if (startDate && endDate) {
      where.start_time = {
        gte: new Date(startDate)
      };
      where.end_time = {
        lte: new Date(endDate)
      };
    }
    
    const events = await prisma.event.findMany({
      where,
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        start_time: 'asc'
      }
    });
    
    logger.debug(`Encontrados ${events.length} eventos para o projeto`, { projectId });
    return res.json(events);
  } catch (error) {
    logger.error('Erro ao buscar eventos do projeto', error);
    return res.status(500).json({ error: 'Erro ao buscar eventos do projeto' });
  }
};

/**
 * Obtém detalhes de um evento específico
 */
exports.getEvent = async (req, res) => {
  const { projectId, eventId } = req.params;
  const userId = req.user.id;

  try {
    logger.debug('Buscando detalhes do evento', { projectId, eventId });

    // Verificar se o usuário tem permissão no projeto
    const isMember = await prisma.projectMember.findFirst({
      where: {
        project_id: Number(projectId),
        user_id: userId
      }
    });

    if (!isMember) {
      logger.warn('Tentativa de acessar evento sem permissão no projeto', { userId, projectId, eventId });
      return res.status(403).json({ error: 'Você não tem permissão para acessar este projeto' });
    }

    const event = await prisma.event.findUnique({
      where: {
        id: Number(eventId)
      },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!event) {
      logger.warn('Evento não encontrado', { eventId });
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (event.project_id !== Number(projectId)) {
      logger.warn('Evento não pertence ao projeto especificado', { eventId, projectId, actualProjectId: event.project_id });
      return res.status(404).json({ error: 'Evento não encontrado neste projeto' });
    }

    return res.json(event);
  } catch (error) {
    logger.error('Erro ao buscar detalhes do evento', error);
    return res.status(500).json({ error: 'Erro ao buscar detalhes do evento' });
  }
};

/**
 * Atualiza um evento existente
 */
exports.updateEvent = async (req, res) => {
  const { projectId, eventId } = req.params;
  const { title, description, start_time, end_time, all_day, location, color, attendees } = req.body;
  const userId = req.user.id;

  try {
    logger.debug('Atualizando evento', { projectId, eventId });

    // Buscar o evento para verificar permissões
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: Number(eventId)
      }
    });

    if (!existingEvent) {
      logger.warn('Evento não encontrado para atualização', { eventId });
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (existingEvent.project_id !== Number(projectId)) {
      logger.warn('Evento não pertence ao projeto especificado', { eventId, projectId });
      return res.status(404).json({ error: 'Evento não encontrado neste projeto' });
    }

    // Verificar se o usuário tem permissão no projeto
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        project_id: Number(projectId),
        user_id: userId
      }
    });

    // Apenas o criador do evento ou um administrador/gerente pode editar
    const isCreator = existingEvent.created_by === userId;
    const isProjectAdmin = projectMember && ['admin', 'project_manager', 'team_leader'].includes(projectMember.role);

    if (!isCreator && !isProjectAdmin) {
      logger.warn('Usuário sem permissão para editar evento', { userId, eventId });
      return res.status(403).json({ error: 'Você não tem permissão para editar este evento' });
    }

    // Atualizar o evento
    // Primeiro excluir todos os participantes existentes
    await prisma.eventAttendee.deleteMany({
      where: {
        event_id: Number(eventId)
      }
    });

    // Atualizar o evento com novos dados
    const updatedEvent = await prisma.event.update({
      where: {
        id: Number(eventId)
      },
      data: {
        title,
        description,
        start_time: start_time ? new Date(start_time) : undefined,
        end_time: end_time ? new Date(end_time) : undefined,
        all_day: all_day !== undefined ? all_day : undefined,
        location,
        color,
        attendees: {
          create: attendees?.map(attendeeId => ({
            user: { connect: { id: Number(attendeeId) } }
          })) || []
        }
      },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    logger.success('Evento atualizado com sucesso', { eventId });
    return res.json(updatedEvent);
  } catch (error) {
    logger.error('Erro ao atualizar evento', error);
    return res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
};

/**
 * Exclui um evento
 */
exports.deleteEvent = async (req, res) => {
  const { projectId, eventId } = req.params;
  const userId = req.user.id;

  try {
    logger.debug('Excluindo evento', { projectId, eventId });

    // Buscar o evento para verificar permissões
    const existingEvent = await prisma.event.findUnique({
      where: {
        id: Number(eventId)
      }
    });

    if (!existingEvent) {
      logger.warn('Evento não encontrado para exclusão', { eventId });
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (existingEvent.project_id !== Number(projectId)) {
      logger.warn('Evento não pertence ao projeto especificado', { eventId, projectId });
      return res.status(404).json({ error: 'Evento não encontrado neste projeto' });
    }

    // Verificar se o usuário tem permissão no projeto
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        project_id: Number(projectId),
        user_id: userId
      }
    });

    // Apenas o criador do evento ou um administrador/gerente pode excluir
    const isCreator = existingEvent.created_by === userId;
    const isProjectAdmin = projectMember && ['admin', 'project_manager', 'team_leader'].includes(projectMember.role);

    if (!isCreator && !isProjectAdmin) {
      logger.warn('Usuário sem permissão para excluir evento', { userId, eventId });
      return res.status(403).json({ error: 'Você não tem permissão para excluir este evento' });
    }

    // Excluir o evento
    await prisma.event.delete({
      where: {
        id: Number(eventId)
      }
    });

    logger.success('Evento excluído com sucesso', { eventId });
    return res.json({ message: 'Evento excluído com sucesso' });
  } catch (error) {
    logger.error('Erro ao excluir evento', error);
    return res.status(500).json({ error: 'Erro ao excluir evento' });
  }
};

/**
 * Obtém eventos de todos os projetos do usuário para o calendário
 */
exports.getUserCalendar = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;
  
  try {
    logger.debug('Buscando calendário do usuário', { userId, startDate, endDate });
    
    // Projetos que o usuário é membro
    const userProjects = await prisma.projectMember.findMany({
      where: { user_id: userId },
      select: { project_id: true }
    });
    
    const projectIds = userProjects.map(p => p.project_id);
    
    // Buscar eventos dos projetos do usuário
    const events = await prisma.event.findMany({
      where: {
        project_id: { in: projectIds },
        start_time: startDate ? { gte: new Date(startDate) } : undefined,
        end_time: endDate ? { lte: new Date(endDate) } : undefined
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Buscar tarefas com data de vencimento dos projetos do usuário
    const tasks = await prisma.task.findMany({
      where: {
        project_id: { in: projectIds },
        due_date: { not: null }
      },
      select: {
        id: true,
        title: true,
        due_date: true,
        status: true,
        priority: true,
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Formatar tarefas para exibição no calendário
    const formattedTasks = tasks.map(task => ({
      id: `task-${task.id}`,
      title: task.title,
      start_time: task.due_date,
      end_time: task.due_date,
      all_day: true,
      isTask: true,
      status: task.status,
      priority: task.priority,
      project: task.project
    }));
    
    logger.debug(`Encontrados ${events.length} eventos e ${tasks.length} tarefas para o calendário do usuário`, { userId });
    return res.json({
      events,
      tasks: formattedTasks
    });
  } catch (error) {
    logger.error('Erro ao buscar calendário do usuário', error);
    return res.status(500).json({ error: 'Erro ao buscar calendário do usuário' });
  }
};

/**
 * Responde a um convite de evento
 */
exports.respondToEventInvite = async (req, res) => {
  const { eventId } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  try {
    logger.debug('Respondendo a convite de evento', { eventId, userId, status });

    // Verificar se o usuário foi convidado para o evento
    const attendee = await prisma.eventAttendee.findUnique({
      where: {
        event_id_user_id: {
          event_id: Number(eventId),
          user_id: userId
        }
      }
    });

    if (!attendee) {
      logger.warn('Usuário não é participante do evento', { eventId, userId });
      return res.status(404).json({ error: 'Você não foi convidado para este evento' });
    }

    // Atualizar o status do participante
    const updatedAttendee = await prisma.eventAttendee.update({
      where: {
        event_id_user_id: {
          event_id: Number(eventId),
          user_id: userId
        }
      },
      data: {
        status
      }
    });

    logger.success('Status de participação atualizado com sucesso', { eventId, userId, status });
    return res.json(updatedAttendee);
  } catch (error) {
    logger.error('Erro ao responder convite de evento', error);
    return res.status(500).json({ error: 'Erro ao responder convite de evento' });
  }
};
 