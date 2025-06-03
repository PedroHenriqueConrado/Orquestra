const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DashboardService {
    async getProjectStatistics(projectId) {
        const [
            taskStats,
            memberCount,
            documentCount,
            messageCount
        ] = await Promise.all([
            // Estatísticas de tarefas
            prisma.task.groupBy({
                by: ['status'],
                where: {
                    project_id: Number(projectId)
                },
                _count: true
            }),
            // Contagem de membros
            prisma.projectMember.count({
                where: {
                    project_id: Number(projectId)
                }
            }),
            // Contagem de documentos
            prisma.document.count({
                where: {
                    project_id: Number(projectId)
                }
            }),
            // Contagem de mensagens
            prisma.chatMessage.count({
                where: {
                    project_id: Number(projectId)
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

        return {
            tasks: taskStatistics,
            members: memberCount,
            documents: documentCount,
            messages: messageCount
        };
    }

    async getProjectTimeline(projectId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [tasks, documents, messages] = await Promise.all([
            // Atividade de tarefas
            prisma.task.findMany({
                where: {
                    project_id: Number(projectId),
                    created_at: {
                        gte: startDate
                    }
                },
                select: {
                    created_at: true,
                    status: true
                },
                orderBy: {
                    created_at: 'asc'
                }
            }),
            // Atividade de documentos
            prisma.document.findMany({
                where: {
                    project_id: Number(projectId),
                    created_at: {
                        gte: startDate
                    }
                },
                select: {
                    created_at: true
                },
                orderBy: {
                    created_at: 'asc'
                }
            }),
            // Atividade de mensagens
            prisma.chatMessage.findMany({
                where: {
                    project_id: Number(projectId),
                    created_at: {
                        gte: startDate
                    }
                },
                select: {
                    created_at: true
                },
                orderBy: {
                    created_at: 'asc'
                }
            })
        ]);

        return {
            tasks,
            documents,
            messages
        };
    }

    async getMemberPerformance(projectId) {
        const members = await prisma.projectMember.findMany({
            where: {
                project_id: Number(projectId)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                // Incluir tarefas associadas ao membro
                user: {
                    include: {
                        tasks: {
                            where: {
                                project_id: Number(projectId)
                            },
                            select: {
                                status: true
                            }
                        },
                        chatMessages: {
                            where: {
                                project_id: Number(projectId)
                            },
                            select: {
                                id: true
                            }
                        },
                        documentVersions: {
                            where: {
                                document: {
                                    project_id: Number(projectId)
                                }
                            },
                            select: {
                                id: true
                            }
                        }
                    }
                }
            }
        });

        return members.map(member => ({
            user: {
                id: member.user.id,
                name: member.user.name,
                email: member.user.email
            },
            role: member.role,
            performance: {
                tasks: {
                    total: member.user.tasks.length,
                    completed: member.user.tasks.filter(t => t.status === 'completed').length,
                    in_progress: member.user.tasks.filter(t => t.status === 'in_progress').length,
                    pending: member.user.tasks.filter(t => t.status === 'pending').length
                },
                messages: member.user.chatMessages.length,
                documents: member.user.documentVersions.length
            }
        }));
    }

    async getOverallStatistics() {
        const [
            projectCount,
            userCount,
            taskStats,
            documentCount
        ] = await Promise.all([
            // Total de projetos
            prisma.project.count(),
            // Total de usuários
            prisma.user.count(),
            // Estatísticas gerais de tarefas
            prisma.task.groupBy({
                by: ['status'],
                _count: true
            }),
            // Total de documentos
            prisma.document.count()
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

        return {
            projects: projectCount,
            users: userCount,
            tasks: taskStatistics,
            documents: documentCount
        };
    }

    async getProjectProgress(projectId) {
        const tasks = await prisma.task.findMany({
            where: {
                project_id: Number(projectId)
            },
            select: {
                status: true,
                created_at: true,
                due_date: true
            }
        });

        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const overdue = tasks.filter(t => {
            if (!t.due_date) return false;
            return new Date(t.due_date) < new Date() && t.status !== 'completed';
        }).length;

        return {
            total,
            completed,
            progress: total > 0 ? (completed / total) * 100 : 0,
            overdue
        };
    }
}

module.exports = new DashboardService(); 