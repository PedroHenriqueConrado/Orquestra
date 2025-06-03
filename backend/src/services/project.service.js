const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        return await prisma.project.delete({
            where: { id: Number(id) }
        });
    }

    async addMember(projectId, userId, role) {
        return await prisma.projectMember.create({
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
                }
            }
        });
    }

    async removeMember(projectId, userId) {
        return await prisma.projectMember.delete({
            where: {
                project_id_user_id: {
                    project_id: Number(projectId),
                    user_id: Number(userId)
                }
            }
        });
    }

    async getProjectMembers(projectId) {
        return await prisma.projectMember.findMany({
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
                }
            }
        });
    }

    async isProjectMember(projectId, userId) {
        const member = await prisma.projectMember.findUnique({
            where: {
                project_id_user_id: {
                    project_id: Number(projectId),
                    user_id: Number(userId)
                }
            }
        });
        return !!member;
    }
}

module.exports = new ProjectService(); 