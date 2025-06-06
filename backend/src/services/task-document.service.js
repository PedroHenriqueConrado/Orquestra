const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const documentService = require('./document.service');
const uploadService = require('./upload.service');

class TaskDocumentService {
    /**
     * Associa um documento existente a uma tarefa
     * @param {number} taskId - ID da tarefa
     * @param {number} documentId - ID do documento
     * @param {number} userId - ID do usuário que está fazendo a associação
     * @returns {Promise<Object>} - Objeto com os dados da associação
     */
    async associateDocument(taskId, documentId, userId) {
        // Verifica se a tarefa e o documento existem e pertencem ao mesmo projeto
        const task = await prisma.task.findUnique({
            where: { id: Number(taskId) },
            select: { project_id: true }
        });

        const document = await prisma.document.findUnique({
            where: { id: Number(documentId) },
            select: { project_id: true }
        });

        if (!task || !document) {
            throw new Error('Tarefa ou documento não encontrado');
        }

        if (task.project_id !== document.project_id) {
            throw new Error('Documento e tarefa precisam pertencer ao mesmo projeto');
        }

        // Cria a associação
        return await prisma.taskDocument.create({
            data: {
                task_id: Number(taskId),
                document_id: Number(documentId),
                added_by: Number(userId)
            },
            include: {
                document: {
                    include: {
                        versions: {
                            orderBy: {
                                version_number: 'desc'
                            },
                            include: {
                                uploader: {
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
                                name: true,
                                email: true
                            }
                        }
                    }
                },
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

    /**
     * Cria um novo documento e o associa a uma tarefa
     * @param {number} taskId - ID da tarefa
     * @param {number} projectId - ID do projeto
     * @param {number} userId - ID do usuário
     * @param {string} title - Título do documento
     * @param {Object} file - Arquivo enviado
     * @returns {Promise<Object>} - Objeto com os dados da associação
     */
    async createAndAssociateDocument(taskId, projectId, userId, title, file) {
        // Verifica se a tarefa existe e pertence ao projeto
        const task = await prisma.task.findFirst({
            where: {
                id: Number(taskId),
                project_id: Number(projectId)
            }
        });

        if (!task) {
            throw new Error('Tarefa não encontrada ou não pertence ao projeto especificado');
        }

        // Cria o documento
        const document = await documentService.createDocument(
            projectId,
            userId,
            title,
            file
        );

        // Cria a associação
        return await prisma.taskDocument.create({
            data: {
                task_id: Number(taskId),
                document_id: document.id,
                added_by: Number(userId)
            },
            include: {
                document: {
                    include: {
                        versions: {
                            orderBy: {
                                version_number: 'desc'
                            },
                            include: {
                                uploader: {
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
                                name: true,
                                email: true
                            }
                        }
                    }
                },
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

    /**
     * Remove a associação entre uma tarefa e um documento
     * @param {number} taskId - ID da tarefa
     * @param {number} documentId - ID do documento
     * @returns {Promise<Object>} - Objeto com os dados da associação removida
     */
    async removeAssociation(taskId, documentId) {
        return await prisma.taskDocument.delete({
            where: {
                task_id_document_id: {
                    task_id: Number(taskId),
                    document_id: Number(documentId)
                }
            }
        });
    }

    /**
     * Obtém todos os documentos associados a uma tarefa
     * @param {number} taskId - ID da tarefa
     * @returns {Promise<Array>} - Lista de documentos associados à tarefa
     */
    async getTaskDocuments(taskId) {
        return await prisma.taskDocument.findMany({
            where: {
                task_id: Number(taskId)
            },
            include: {
                document: {
                    include: {
                        versions: {
                            orderBy: {
                                version_number: 'desc'
                            },
                            include: {
                                uploader: {
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
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                added_at: 'desc'
            }
        });
    }

    /**
     * Verifica se um documento já está associado a uma tarefa
     * @param {number} taskId - ID da tarefa
     * @param {number} documentId - ID do documento
     * @returns {Promise<boolean>} - true se o documento já está associado, false caso contrário
     */
    async isDocumentAssociated(taskId, documentId) {
        const association = await prisma.taskDocument.findUnique({
            where: {
                task_id_document_id: {
                    task_id: Number(taskId),
                    document_id: Number(documentId)
                }
            }
        });
        return !!association;
    }
}

module.exports = new TaskDocumentService(); 