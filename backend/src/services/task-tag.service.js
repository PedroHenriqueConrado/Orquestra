const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TaskTagService {
    async createTag(projectId, data) {
        return await prisma.taskTag.create({
            data: {
                name: data.name,
                color: data.color,
                project_id: Number(projectId)
            }
        });
    }

    async getProjectTags(projectId) {
        return await prisma.taskTag.findMany({
            where: {
                project_id: Number(projectId)
            },
            include: {
                _count: {
                    select: {
                        tasks: true
                    }
                }
            }
        });
    }

    async updateTag(tagId, projectId, data) {
        return await prisma.taskTag.update({
            where: {
                id: Number(tagId),
                project_id: Number(projectId)
            },
            data: {
                name: data.name,
                color: data.color
            }
        });
    }

    async deleteTag(tagId, projectId) {
        return await prisma.taskTag.delete({
            where: {
                id: Number(tagId),
                project_id: Number(projectId)
            }
        });
    }

    async addTagToTask(taskId, tagId) {
        return await prisma.taskToTag.create({
            data: {
                task_id: Number(taskId),
                tag_id: Number(tagId)
            }
        });
    }

    async removeTagFromTask(taskId, tagId) {
        return await prisma.taskToTag.delete({
            where: {
                task_id_tag_id: {
                    task_id: Number(taskId),
                    tag_id: Number(tagId)
                }
            }
        });
    }

    async getTaskTags(taskId) {
        const task = await prisma.task.findUnique({
            where: {
                id: Number(taskId)
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });
        return task.tags.map(tt => tt.tag);
    }
}

module.exports = new TaskTagService(); 