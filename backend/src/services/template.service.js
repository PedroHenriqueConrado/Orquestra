const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

class TemplateService {
    /**
     * Criar template a partir de projeto existente
     */
    async createFromProject(projectId, userId, templateData) {
        try {
            logger.debug('TemplateService.createFromProject: Criando template a partir de projeto', {
                projectId,
                userId,
                templateName: templateData.name
            });

            // Verificar se o usuário tem acesso ao projeto
            const projectMember = await prisma.projectMember.findFirst({
                where: {
                    project_id: Number(projectId),
                    user_id: Number(userId)
                }
            });

            if (!projectMember) {
                throw new Error('Usuário não tem acesso a este projeto');
            }

            // Buscar projeto e suas tarefas
            const project = await prisma.project.findUnique({
                where: { id: Number(projectId) },
                include: {
                    tasks: {
                        orderBy: { created_at: 'asc' }
                    },
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

            if (!project) {
                throw new Error('Projeto não encontrado');
            }

            // Criar template com tarefas e membros
            const template = await prisma.$transaction(async (tx) => {
                // Criar o template
                const newTemplate = await tx.projectTemplate.create({
                    data: {
                        name: templateData.name,
                        description: templateData.description || project.description,
                        category: templateData.category,
                        created_by: Number(userId),
                        is_public: templateData.is_public || false
                    }
                });

                // Criar tarefas do template
                const templateTasks = project.tasks.map((task, index) => ({
                    template_id: newTemplate.id,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    estimated_hours: task.estimated_hours,
                    order_index: index
                }));

                if (templateTasks.length > 0) {
                    await tx.templateTask.createMany({
                        data: templateTasks
                    });
                }

                // Criar membros do template
                const templateMembers = project.members.map(member => ({
                    template_id: newTemplate.id,
                    user_id: member.user_id,
                    role: member.role
                }));

                if (templateMembers.length > 0) {
                    await tx.templateMember.createMany({
                        data: templateMembers
                    });
                }

                return newTemplate;
            });

            logger.success('TemplateService.createFromProject: Template criado com sucesso', {
                templateId: template.id,
                projectId,
                userId
            });

            return template;

        } catch (error) {
            logger.error('TemplateService.createFromProject: Erro ao criar template', {
                error: error.message,
                stack: error.stack,
                projectId,
                userId
            });
            throw error;
        }
    }

    /**
     * Listar templates disponíveis para o usuário
     */
    async getTemplates(userId, filters = {}) {
        try {
            logger.debug('TemplateService.getTemplates: Buscando templates', {
                userId,
                filters
            });

            const where = {
                OR: [
                    { is_public: true },
                    { created_by: Number(userId) }
                ]
            };

            // Aplicar filtros
            if (filters.category) {
                where.category = filters.category;
            }

            if (filters.search) {
                where.OR.push(
                    { name: { contains: filters.search } },
                    { description: { contains: filters.search } }
                );
            }

            const templates = await prisma.projectTemplate.findMany({
                where,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    tasks: {
                        orderBy: { order_index: 'asc' }
                    },
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
                    },
                    _count: {
                        select: {
                            tasks: true,
                            members: true
                        }
                    }
                },
                orderBy: [
                    { created_at: 'desc' }
                ]
            });

            logger.success('TemplateService.getTemplates: Templates encontrados', {
                userId,
                count: templates.length
            });

            return templates;

        } catch (error) {
            logger.error('TemplateService.getTemplates: Erro ao buscar templates', {
                error: error.message,
                stack: error.stack,
                userId
            });
            throw error;
        }
    }

    /**
     * Buscar template por ID
     */
    async getTemplateById(templateId, userId) {
        try {
            logger.debug('TemplateService.getTemplateById: Buscando template', {
                templateId,
                userId
            });

            const template = await prisma.projectTemplate.findFirst({
                where: {
                    id: Number(templateId),
                    OR: [
                        { is_public: true },
                        { created_by: Number(userId) }
                    ]
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    tasks: {
                        orderBy: { order_index: 'asc' }
                    },
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

            if (!template) {
                throw new Error('Template não encontrado ou acesso negado');
            }

            logger.success('TemplateService.getTemplateById: Template encontrado', {
                templateId
            });

            return template;

        } catch (error) {
            logger.error('TemplateService.getTemplateById: Erro ao buscar template', {
                error: error.message,
                stack: error.stack,
                templateId,
                userId
            });
            throw error;
        }
    }

    /**
     * Criar projeto a partir de template
     */
    async createProjectFromTemplate(templateId, userId, projectData) {
        try {
            logger.debug('TemplateService.createProjectFromTemplate: Criando projeto a partir de template', {
                templateId,
                userId,
                projectName: projectData.name
            });

            // Buscar template
            const template = await this.getTemplateById(templateId, userId);

            // Criar projeto com tarefas e membros
            const project = await prisma.$transaction(async (tx) => {
                // Criar o projeto
                const newProject = await tx.project.create({
                    data: {
                        name: projectData.name,
                        description: projectData.description || template.description
                    }
                });

                // Adicionar criador como membro
                await tx.projectMember.create({
                    data: {
                        project_id: newProject.id,
                        user_id: Number(userId),
                        role: 'project_manager'
                    }
                });

                // Criar tarefas do template
                const projectTasks = template.tasks.map(task => ({
                    project_id: newProject.id,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    estimated_hours: task.estimated_hours
                }));

                if (projectTasks.length > 0) {
                    await tx.task.createMany({
                        data: projectTasks
                    });
                }

                // Adicionar membros selecionados
                if (projectData.members && projectData.members.length > 0) {
                    const projectMembers = projectData.members.map(memberId => ({
                        project_id: newProject.id,
                        user_id: Number(memberId),
                        role: 'developer'
                    }));

                    await tx.projectMember.createMany({
                        data: projectMembers
                    });
                }

                return newProject;
            });

            logger.success('TemplateService.createProjectFromTemplate: Projeto criado com sucesso', {
                projectId: project.id,
                templateId,
                userId
            });

            return project;

        } catch (error) {
            logger.error('TemplateService.createProjectFromTemplate: Erro ao criar projeto', {
                error: error.message,
                stack: error.stack,
                templateId,
                userId
            });
            throw error;
        }
    }

    /**
     * Deletar template
     */
    async deleteTemplate(templateId, userId) {
        try {
            logger.debug('TemplateService.deleteTemplate: Deletando template', {
                templateId,
                userId
            });

            const template = await prisma.projectTemplate.findFirst({
                where: {
                    id: Number(templateId),
                    created_by: Number(userId)
                }
            });

            if (!template) {
                throw new Error('Template não encontrado ou acesso negado');
            }

            await prisma.projectTemplate.delete({
                where: { id: Number(templateId) }
            });

            logger.success('TemplateService.deleteTemplate: Template deletado com sucesso', {
                templateId,
                userId
            });

            return { success: true };

        } catch (error) {
            logger.error('TemplateService.deleteTemplate: Erro ao deletar template', {
                error: error.message,
                stack: error.stack,
                templateId,
                userId
            });
            throw error;
        }
    }

    /**
     * Buscar categorias disponíveis
     */
    async getCategories() {
        try {
            const categories = await prisma.projectTemplate.findMany({
                where: {
                    OR: [
                        { is_public: true },
                        { category: { not: null } }
                    ]
                },
                select: {
                    category: true
                },
                distinct: ['category']
            });

            return categories
                .map(c => c.category)
                .filter(c => c !== null)
                .sort();
        } catch (error) {
            logger.error('TemplateService.getCategories: Erro ao buscar categorias', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

module.exports = new TemplateService(); 