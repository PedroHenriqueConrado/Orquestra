const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const notificationService = require('./notification.service');

class ProjectService {
    async createProject(data, creatorId) {
        const project = await prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
                members: {
                    create: {
                        user_id: creatorId,
                        role: 'project_manager'
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        return project;
    }

    async getAllProjects() {
        return await prisma.project.findMany({
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
    }

    async getProjectById(id) {
        return await prisma.project.findUnique({
            where: { id: Number(id) },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
    }

    async updateProject(id, data) {
        return await prisma.project.update({
            where: { id: Number(id) },
            data: {
                name: data.name,
                description: data.description,
                updated_at: new Date()
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
    }

    async deleteProject(id) {
        try {
            const projectId = Number(id);
            logger.debug('ProjectService.deleteProject: Iniciando exclusão do projeto', { projectId });
            
            // 1. Primeiro, buscar todas as tarefas do projeto para excluir seus relacionamentos
            const tasks = await prisma.task.findMany({
                where: { project_id: projectId },
                select: { id: true }
            });
            
            logger.debug(`ProjectService.deleteProject: Encontradas ${tasks.length} tarefas para excluir`, { projectId });
            
            // 2. Para cada tarefa, excluir seus relacionamentos
            for (const task of tasks) {
                // Excluir comentários das tarefas
                await prisma.taskComment.deleteMany({
                    where: { task_id: task.id }
                });
                
                // Excluir histórico das tarefas
                await prisma.taskHistory.deleteMany({
                    where: { task_id: task.id }
                });
                
                // Excluir tags associadas às tarefas
                await prisma.taskToTag.deleteMany({
                    where: { task_id: task.id }
                });
            }
            
            // 3. Excluir todas as tarefas do projeto
            await prisma.task.deleteMany({
                where: { project_id: projectId }
            });
            
            // 4. Excluir todas as tags do projeto
            await prisma.taskTag.deleteMany({
                where: { project_id: projectId }
            });
            
            // 5. Excluir todos os documentos e suas versões
            const documents = await prisma.document.findMany({
                where: { project_id: projectId },
                select: { id: true }
            });
            
            logger.debug(`ProjectService.deleteProject: Encontrados ${documents.length} documentos para excluir`, { projectId });
            
            for (const doc of documents) {
                // Excluir versões do documento
                await prisma.documentVersion.deleteMany({
                    where: { document_id: doc.id }
                });
            }
            
            // Excluir documentos
            await prisma.document.deleteMany({
                where: { project_id: projectId }
            });
            
            // 6. Excluir mensagens de chat
            await prisma.chatMessage.deleteMany({
                where: { project_id: projectId }
            });
            
            // 7. Excluir todos os membros do projeto
            await prisma.projectMember.deleteMany({
                where: { project_id: projectId }
            });
            
            // 8. Finalmente, excluir o projeto
            const result = await prisma.project.delete({
                where: { id: projectId }
            });
            
            logger.success('ProjectService.deleteProject: Projeto excluído com sucesso', { projectId });
            
            return result;
        } catch (error) {
            logger.error('ProjectService.deleteProject: Erro ao excluir projeto', {
                projectId: id,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async addMember(projectId, userId, role) {
        try {
            logger.debug('ProjectService.addMember: Adicionando membro ao projeto', {
                projectId,
                userId,
                role
            });
            
            // Verificar se o membro já existe
            const existingMember = await prisma.projectMember.findUnique({
                where: {
                    uq_project_user: {
                        project_id: Number(projectId),
                        user_id: Number(userId)
                    }
                }
            });
            
            if (existingMember) {
                logger.warn('ProjectService.addMember: Membro já existe no projeto', {
                    projectId,
                    userId,
                    existingRole: existingMember.role
                });
                
                // Se o papel for diferente, atualiza
                if (existingMember.role !== role) {
                    return await prisma.projectMember.update({
                        where: {
                            uq_project_user: {
                                project_id: Number(projectId),
                                user_id: Number(userId)
                            }
                        },
                        data: {
                            role: role
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    });
                }
                
                return existingMember;
            }
            
            // Criar novo membro
            const member = await prisma.projectMember.create({
                data: {
                    project_id: Number(projectId),
                    user_id: Number(userId),
                    role: role
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
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
            
            // Notificar o usuário sobre a adição ao projeto
            try {
                await notificationService.notifyProjectAddition(
                    userId,
                    projectId,
                    member.project.name
                );
                logger.debug('ProjectService.addMember: Notificação de adição ao projeto criada', {
                    userId,
                    projectId
                });
            } catch (notifyError) {
                // Apenas logamos o erro, mas não interrompemos o fluxo principal
                logger.error('ProjectService.addMember: Erro ao criar notificação', {
                    error: notifyError.message,
                    stack: notifyError.stack,
                    userId,
                    projectId
                });
            }
            
            logger.success('ProjectService.addMember: Membro adicionado com sucesso', {
                projectId,
                userId,
                role
            });
            
            return member;
        } catch (error) {
            logger.error('ProjectService.addMember: Erro ao adicionar membro', {
                projectId,
                userId,
                role,
                error: error.message
            });
            throw error;
        }
    }

    async removeMember(projectId, userId) {
        return await prisma.projectMember.delete({
            where: {
                uq_project_user: {
                    project_id: Number(projectId),
                    user_id: Number(userId)
                }
            }
        });
    }

    async getProjectMembers(projectId) {
        try {
            const numericProjectId = Number(projectId);
            
            logger.debug('ProjectService.getProjectMembers: Buscando membros do projeto', {
                projectId: numericProjectId
            });
            
            if (isNaN(numericProjectId)) {
                logger.warn('ProjectService.getProjectMembers: ID de projeto inválido', {
                    projectId,
                    numericProjectId
                });
                throw new Error('ID de projeto inválido');
            }
            
            const members = await prisma.projectMember.findMany({
                where: {
                    project_id: numericProjectId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            
            logger.debug(`ProjectService.getProjectMembers: Encontrados ${members.length} membros para o projeto ${numericProjectId}`);
            
            return members;
        } catch (error) {
            logger.error('ProjectService.getProjectMembers: Erro ao buscar membros do projeto', {
                projectId,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async isProjectMember(projectId, userId) {
        try {
            const numericProjectId = Number(projectId);
            const numericUserId = Number(userId);
            
            logger.debug('ProjectService.isProjectMember: Verificando se o usuário é membro do projeto', {
                projectId: numericProjectId,
                userId: numericUserId
            });
            
            if (isNaN(numericProjectId) || isNaN(numericUserId)) {
                logger.warn('ProjectService.isProjectMember: IDs inválidos', {
                    projectId,
                    userId,
                    numericProjectId,
                    numericUserId
                });
                return false;
            }
            
            // Usando findFirst em vez de findUnique para evitar problemas com nomes de chaves compostas
            const member = await prisma.projectMember.findFirst({
                where: {
                    AND: [
                        { project_id: numericProjectId },
                        { user_id: numericUserId }
                    ]
                }
            });
            
            const isMember = !!member;
            
            if (isMember) {
                logger.debug('ProjectService.isProjectMember: Usuário é membro do projeto', {
                    projectId: numericProjectId,
                    userId: numericUserId,
                    role: member.role
                });
            } else {
                logger.debug('ProjectService.isProjectMember: Usuário NÃO é membro do projeto', {
                    projectId: numericProjectId,
                    userId: numericUserId
                });
            }
            
            return isMember;
        } catch (error) {
            logger.error('ProjectService.isProjectMember: Erro ao verificar se o usuário é membro do projeto', {
                projectId,
                userId,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

module.exports = new ProjectService(); 