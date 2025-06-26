const advancedDashboardService = require('../services/advanced-dashboard.service');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AdvancedDashboardController {
    async getAdvancedMetrics(req, res) {
        try {
            const userId = req.user.id;
            
            // Processar filtros da query string
            const filters = {
                dateRange: req.query.dateRange,
                projects: req.query.projects ? req.query.projects.split(',').map(Number) : [],
                users: req.query.users ? req.query.users.split(',').map(Number) : [],
                status: req.query.status ? req.query.status.split(',') : [],
                priority: req.query.priority ? req.query.priority.split(',') : []
            };

            logger.debug('AdvancedDashboardController.getAdvancedMetrics: Processando requisição', {
                userId,
                filters
            });

            const metrics = await advancedDashboardService.getAdvancedMetrics(userId, filters);
            
            logger.success('AdvancedDashboardController.getAdvancedMetrics: Métricas retornadas com sucesso', {
                userId,
                metricsCount: Object.keys(metrics).length
            });
            
            res.json(metrics);
        } catch (error) {
            logger.error('AdvancedDashboardController.getAdvancedMetrics: Erro no controller', {
                error: error.message,
                stack: error.stack,
                userId: req.user?.id
            });
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getProjectAnalytics(req, res) {
        try {
            const { projectId } = req.params;
            const userId = req.user.id;
            
            // Processar filtros da query string
            const filters = {
                dateRange: req.query.dateRange,
                status: req.query.status ? req.query.status.split(',') : [],
                priority: req.query.priority ? req.query.priority.split(',') : []
            };

            logger.debug('AdvancedDashboardController.getProjectAnalytics: Processando requisição', {
                userId,
                projectId,
                filters
            });

            const analytics = await advancedDashboardService.getProjectAnalytics(projectId, filters);
            
            logger.success('AdvancedDashboardController.getProjectAnalytics: Análises retornadas com sucesso', {
                userId,
                projectId
            });
            
            res.json(analytics);
        } catch (error) {
            logger.error('AdvancedDashboardController.getProjectAnalytics: Erro no controller', {
                error: error.message,
                stack: error.stack,
                userId: req.user?.id,
                projectId: req.params?.projectId
            });
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getProjectsList(req, res) {
        try {
            const userId = req.user.id;
            
            logger.debug('AdvancedDashboardController.getProjectsList: Buscando lista de projetos', {
                userId
            });

            // Buscar projetos do usuário
            const projects = await prisma.project.findMany({
                where: {
                    members: {
                        some: {
                            user_id: userId
                        }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    created_at: true
                },
                orderBy: {
                    name: 'asc'
                }
            });

            logger.success('AdvancedDashboardController.getProjectsList: Projetos retornados com sucesso', {
                userId,
                projectsCount: projects.length
            });
            
            res.json(projects);
        } catch (error) {
            logger.error('AdvancedDashboardController.getProjectsList: Erro no controller', {
                error: error.message,
                stack: error.stack,
                userId: req.user?.id
            });
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getUsersList(req, res) {
        try {
            const userId = req.user.id;
            
            logger.debug('AdvancedDashboardController.getUsersList: Buscando lista de usuários', {
                userId
            });

            // Buscar usuários ativos
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                },
                orderBy: {
                    name: 'asc'
                }
            });

            logger.success('AdvancedDashboardController.getUsersList: Usuários retornados com sucesso', {
                userId,
                usersCount: users.length
            });
            
            res.json(users);
        } catch (error) {
            logger.error('AdvancedDashboardController.getUsersList: Erro no controller', {
                error: error.message,
                stack: error.stack,
                userId: req.user?.id
            });
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}

module.exports = new AdvancedDashboardController(); 