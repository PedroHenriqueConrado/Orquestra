const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

class AdvancedDashboardService {
    async getAdvancedMetrics(userId, filters = {}) {
        try {
            logger.debug('AdvancedDashboardService.getAdvancedMetrics: Buscando métricas avançadas', {
                userId,
                filters
            });

            const {
                dateRange = '30d',
                projects = [],
                users = [],
                status = [],
                priority = []
            } = filters;

            // Calcular período baseado no filtro de data
            const startDate = this.calculateStartDate(dateRange);

            // Construir filtros para as consultas
            const whereClause = {
                created_at: {
                    gte: startDate
                }
            };

            // Aplicar filtros adicionais
            if (projects.length > 0) {
                whereClause.project_id = { in: projects.map(Number) };
            }

            if (status.length > 0) {
                whereClause.status = { in: status };
            }

            if (priority.length > 0) {
                whereClause.priority = { in: priority };
            }

            // Buscar dados em paralelo
            const [
                totalProjects,
                totalTasks,
                totalUsers,
                taskStats,
                priorityStats,
                activityByDay,
                performanceByUser,
                overdueTasks
            ] = await Promise.all([
                // Total de projetos
                prisma.project.count({
                    where: projects.length > 0 ? { id: { in: projects.map(Number) } } : {}
                }),
                
                // Total de tarefas
                prisma.task.count({ where: whereClause }),
                
                // Total de usuários únicos
                prisma.user.count({
                    where: users.length > 0 ? { id: { in: users.map(Number) } } : {}
                }),
                
                // Estatísticas de tarefas por status
                prisma.task.groupBy({
                    by: ['status'],
                    where: whereClause,
                    _count: true
                }),
                
                // Estatísticas de tarefas por prioridade
                prisma.task.groupBy({
                    by: ['priority'],
                    where: whereClause,
                    _count: true
                }),
                
                // Atividade por dia
                this.getActivityByDay(startDate, whereClause),
                
                // Performance por usuário
                this.getPerformanceByUser(startDate, whereClause),
                
                // Tarefas atrasadas
                prisma.task.count({
                    where: {
                        ...whereClause,
                        due_date: {
                            lt: new Date()
                        },
                        status: {
                            not: 'completed'
                        }
                    }
                })
            ]);

            // Formatar estatísticas de tarefas
            const taskStatistics = {
                total: taskStats.reduce((acc, curr) => acc + curr._count, 0),
                pending: 0,
                in_progress: 0,
                completed: 0
            };

            taskStats.forEach(stat => {
                taskStatistics[stat.status] = stat._count;
            });

            // Formatar tarefas por prioridade
            const priorityStatistics = priorityStats.map(stat => ({
                priority: this.formatPriority(stat.priority),
                count: stat._count
            }));

            logger.success('AdvancedDashboardService.getAdvancedMetrics: Métricas calculadas com sucesso', {
                userId,
                totalProjects,
                totalTasks,
                totalUsers
            });

            return {
                metrics: {
                    totalProjects,
                    totalTasks,
                    totalUsers,
                    completedTasks: taskStatistics.completed,
                    pendingTasks: taskStatistics.pending,
                    inProgressTasks: taskStatistics.in_progress,
                    overdueTasks
                },
                trends: {
                    tasksByStatus: [
                        { status: 'Pendente', count: taskStatistics.pending },
                        { status: 'Em Progresso', count: taskStatistics.in_progress },
                        { status: 'Concluída', count: taskStatistics.completed }
                    ],
                    tasksByPriority: priorityStatistics,
                    activityByDay,
                    performanceByUser
                }
            };

        } catch (error) {
            logger.error('AdvancedDashboardService.getAdvancedMetrics: Erro ao buscar métricas avançadas', {
                error: error.message,
                stack: error.stack,
                userId
            });
            throw error;
        }
    }

    async getActivityByDay(startDate, whereClause) {
        try {
            // Buscar atividades dos últimos 7 dias
            const days = 7;
            const activities = [];
            
            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const startOfDay = new Date(date.setHours(0, 0, 0, 0));
                const endOfDay = new Date(date.setHours(23, 59, 59, 999));

                const [tasks, documents, messages] = await Promise.all([
                    prisma.task.count({
                        where: {
                            ...whereClause,
                            created_at: {
                                gte: startOfDay,
                                lte: endOfDay
                            }
                        }
                    }),
                    prisma.document.count({
                        where: {
                            created_at: {
                                gte: startOfDay,
                                lte: endOfDay
                            }
                        }
                    }),
                    prisma.chatMessage.count({
                        where: {
                            created_at: {
                                gte: startOfDay,
                                lte: endOfDay
                            }
                        }
                    })
                ]);

                activities.unshift({
                    date: startOfDay.toISOString().split('T')[0],
                    count: tasks + documents + messages
                });
            }

            return activities;
        } catch (error) {
            logger.error('AdvancedDashboardService.getActivityByDay: Erro ao buscar atividade por dia', {
                error: error.message,
                stack: error.stack
            });
            return [];
        }
    }

    async getPerformanceByUser(startDate, whereClause) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    tasks: {
                        where: whereClause,
                        select: {
                            status: true
                        }
                    }
                }
            });

            return users.map(user => {
                const total = user.tasks.length;
                const completed = user.tasks.filter(t => t.status === 'completed').length;
                
                return {
                    user: user.name,
                    completed,
                    total
                };
            }).filter(u => u.total > 0); // Apenas usuários com tarefas
        } catch (error) {
            logger.error('AdvancedDashboardService.getPerformanceByUser: Erro ao buscar performance por usuário', {
                error: error.message,
                stack: error.stack
            });
            return [];
        }
    }

    calculateStartDate(dateRange) {
        const now = new Date();
        switch (dateRange) {
            case '7d':
                return new Date(now.setDate(now.getDate() - 7));
            case '30d':
                return new Date(now.setDate(now.getDate() - 30));
            case '90d':
                return new Date(now.setDate(now.getDate() - 90));
            case '1y':
                return new Date(now.setFullYear(now.getFullYear() - 1));
            default:
                return new Date(now.setDate(now.getDate() - 30));
        }
    }

    formatPriority(priority) {
        const priorityMap = {
            'low': 'Baixa',
            'medium': 'Média',
            'high': 'Alta',
            'urgent': 'Urgente'
        };
        return priorityMap[priority] || priority;
    }

    async getProjectAnalytics(projectId, filters = {}) {
        try {
            logger.debug('AdvancedDashboardService.getProjectAnalytics: Buscando análises do projeto', {
                projectId,
                filters
            });

            const startDate = this.calculateStartDate(filters.dateRange || '30d');

            const [
                taskMetrics,
                memberPerformance,
                timelineData,
                riskAnalysis
            ] = await Promise.all([
                this.getProjectTaskMetrics(projectId, startDate),
                this.getProjectMemberPerformance(projectId, startDate),
                this.getProjectTimeline(projectId, startDate),
                this.getProjectRiskAnalysis(projectId)
            ]);

            return {
                taskMetrics,
                memberPerformance,
                timelineData,
                riskAnalysis
            };

        } catch (error) {
            logger.error('AdvancedDashboardService.getProjectAnalytics: Erro ao buscar análises do projeto', {
                error: error.message,
                stack: error.stack,
                projectId
            });
            throw error;
        }
    }

    async getProjectTaskMetrics(projectId, startDate) {
        const tasks = await prisma.task.findMany({
            where: {
                project_id: Number(projectId),
                created_at: { gte: startDate }
            },
            select: {
                status: true,
                priority: true,
                estimated_hours: true,
                actual_hours: true,
                due_date: true,
                created_at: true
            }
        });

        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const overdue = tasks.filter(t => {
            if (!t.due_date) return false;
            return new Date(t.due_date) < new Date() && t.status !== 'completed';
        }).length;

        const estimatedHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
        const actualHours = tasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0);

        return {
            total,
            completed,
            overdue,
            completionRate: total > 0 ? (completed / total) * 100 : 0,
            estimatedHours,
            actualHours,
            efficiency: estimatedHours > 0 ? (actualHours / estimatedHours) * 100 : 0
        };
    }

    async getProjectMemberPerformance(projectId, startDate) {
        const members = await prisma.projectMember.findMany({
            where: { project_id: Number(projectId) },
            include: {
                user: {
                    include: {
                        tasks: {
                            where: {
                                project_id: Number(projectId),
                                created_at: { gte: startDate }
                            },
                            select: {
                                status: true,
                                created_at: true,
                                due_date: true
                            }
                        }
                    }
                }
            }
        });

        return members.map(member => {
            const tasks = member.user.tasks;
            const total = tasks.length;
            const completed = tasks.filter(t => t.status === 'completed').length;
            const overdue = tasks.filter(t => {
                if (!t.due_date) return false;
                return new Date(t.due_date) < new Date() && t.status !== 'completed';
            }).length;

            return {
                user: member.user.name,
                role: member.role,
                total,
                completed,
                overdue,
                completionRate: total > 0 ? (completed / total) * 100 : 0
            };
        });
    }

    async getProjectTimeline(projectId, startDate) {
        const tasks = await prisma.task.findMany({
            where: {
                project_id: Number(projectId),
                created_at: { gte: startDate }
            },
            select: {
                created_at: true,
                status: true,
                priority: true
            },
            orderBy: { created_at: 'asc' }
        });

        // Agrupar por dia
        const timeline = {};
        tasks.forEach(task => {
            const date = task.created_at.toISOString().split('T')[0];
            if (!timeline[date]) {
                timeline[date] = { created: 0, completed: 0 };
            }
            timeline[date].created++;
            if (task.status === 'completed') {
                timeline[date].completed++;
            }
        });

        return Object.entries(timeline).map(([date, data]) => ({
            date,
            created: data.created,
            completed: data.completed
        }));
    }

    async getProjectRiskAnalysis(projectId) {
        const tasks = await prisma.task.findMany({
            where: { project_id: Number(projectId) },
            select: {
                status: true,
                priority: true,
                due_date: true,
                estimated_hours: true,
                actual_hours: true
            }
        });

        const overdue = tasks.filter(t => {
            if (!t.due_date) return false;
            return new Date(t.due_date) < new Date() && t.status !== 'completed';
        }).length;

        const highPriority = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;
        const pending = tasks.filter(t => t.status === 'pending').length;

        return {
            riskLevel: this.calculateRiskLevel(overdue, highPriority, pending, tasks.length),
            overdueTasks: overdue,
            highPriorityTasks: highPriority,
            pendingTasks: pending,
            recommendations: this.generateRecommendations(overdue, highPriority, pending)
        };
    }

    calculateRiskLevel(overdue, highPriority, pending, total) {
        const riskScore = (overdue * 3) + (highPriority * 2) + (pending * 1);
        const maxScore = total * 3;
        const percentage = (riskScore / maxScore) * 100;

        if (percentage > 70) return 'Alto';
        if (percentage > 40) return 'Médio';
        return 'Baixo';
    }

    generateRecommendations(overdue, highPriority, pending) {
        const recommendations = [];
        
        if (overdue > 0) {
            recommendations.push(`Priorizar ${overdue} tarefa(s) atrasada(s)`);
        }
        
        if (highPriority > 0) {
            recommendations.push(`Revisar ${highPriority} tarefa(s) de alta prioridade`);
        }
        
        if (pending > 10) {
            recommendations.push(`Considerar distribuir ${pending} tarefa(s) pendentes`);
        }

        return recommendations.length > 0 ? recommendations : ['Projeto em boa situação'];
    }
}

module.exports = new AdvancedDashboardService(); 