const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

class SearchService {
    /**
     * Busca global em projetos, tarefas e documentos
     * @param {number} userId - ID do usuário
     * @param {string} query - Termo de busca
     * @param {string} type - Tipo de busca (all, projects, tasks, documents)
     * @param {number} limit - Limite de resultados
     * @returns {Object} Resultados da busca
     */
    async globalSearch(userId, query, type = 'all', limit = 20) {
        try {
            logger.debug('SearchService.globalSearch: Iniciando busca global', {
                userId,
                query,
                type,
                limit
            });

            // Obter projetos que o usuário tem acesso
            const userProjects = await prisma.projectMember.findMany({
                where: { user_id: Number(userId) },
                select: { project_id: true }
            });

            const projectIds = userProjects.map(p => p.project_id);

            if (projectIds.length === 0) {
                return {
                    projects: [],
                    tasks: [],
                    documents: [],
                    total: 0
                };
            }

            const results = {};

            // Buscar projetos
            if (type === 'all' || type === 'projects') {
                results.projects = await this.searchProjects(projectIds, query, limit);
            }

            // Buscar tarefas
            if (type === 'all' || type === 'tasks') {
                results.tasks = await this.searchTasks(projectIds, query, limit);
            }

            // Buscar documentos
            if (type === 'all' || type === 'documents') {
                results.documents = await this.searchDocuments(projectIds, query, limit);
            }

            const total = (results.projects?.length || 0) + 
                         (results.tasks?.length || 0) + 
                         (results.documents?.length || 0);

            logger.success('SearchService.globalSearch: Busca concluída', {
                userId,
                query,
                total
            });

            return {
                ...results,
                total
            };

        } catch (error) {
            logger.error('SearchService.globalSearch: Erro na busca global', {
                error: error.message,
                stack: error.stack,
                userId,
                query
            });
            throw error;
        }
    }

    /**
     * Busca em projetos
     */
    async searchProjects(projectIds, query, limit) {
        return await prisma.project.findMany({
            where: {
                id: { in: projectIds },
                OR: [
                    { name: { contains: query } },
                    { description: { contains: query } }
                ]
            },
            select: {
                id: true,
                name: true,
                description: true,
                created_at: true,
                _count: {
                    select: {
                        tasks: true,
                        members: true
                    }
                }
            },
            orderBy: [
                { name: 'asc' }
            ],
            take: limit
        });
    }

    /**
     * Busca em tarefas
     */
    async searchTasks(projectIds, query, limit) {
        return await prisma.task.findMany({
            where: {
                project_id: { in: projectIds },
                OR: [
                    { title: { contains: query } },
                    { description: { contains: query } }
                ]
            },
            select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                due_date: true,
                created_at: true,
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                assignedUser: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: [
                { due_date: 'asc' },
                { created_at: 'desc' }
            ],
            take: limit
        });
    }

    /**
     * Busca em documentos
     */
    async searchDocuments(projectIds, query, limit) {
        return await prisma.document.findMany({
            where: {
                project_id: { in: projectIds },
                OR: [
                    { title: { contains: query } }
                ]
            },
            select: {
                id: true,
                title: true,
                created_at: true,
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
                },
                versions: {
                    select: {
                        id: true,
                        version_number: true,
                        original_name: true,
                        uploaded_at: true
                    },
                    orderBy: {
                        version_number: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: [
                { created_at: 'desc' }
            ],
            take: limit
        });
    }

    /**
     * Busca rápida para autocomplete
     */
    async quickSearch(userId, query, limit = 5) {
        try {
            logger.debug('SearchService.quickSearch: Iniciando busca rápida', {
                userId,
                query,
                limit
            });

            const userProjects = await prisma.projectMember.findMany({
                where: { user_id: Number(userId) },
                select: { project_id: true }
            });

            const projectIds = userProjects.map(p => p.project_id);

            if (projectIds.length === 0) {
                return [];
            }

            // Buscar apenas projetos e tarefas para autocomplete
            const [projects, tasks] = await Promise.all([
                this.searchProjects(projectIds, query, Math.floor(limit / 2)),
                this.searchTasks(projectIds, query, Math.floor(limit / 2))
            ]);

            const results = [
                ...projects.map(p => ({ ...p, type: 'project' })),
                ...tasks.map(t => ({ ...t, type: 'task' }))
            ];

            logger.success('SearchService.quickSearch: Busca rápida concluída', {
                userId,
                query,
                resultsCount: results.length
            });

            return results.slice(0, limit);

        } catch (error) {
            logger.error('SearchService.quickSearch: Erro na busca rápida', {
                error: error.message,
                stack: error.stack,
                userId,
                query
            });
            throw error;
        }
    }
}

module.exports = new SearchService(); 