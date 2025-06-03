const { PrismaClient } = require('@prisma/client');
const uploadService = require('./upload.service');
const prisma = new PrismaClient();

class DocumentService {
    async createDocument(projectId, userId, title, file) {
        const uploadResult = await uploadService.saveFile(file);

        const document = await prisma.$transaction(async (tx) => {
            // Criar o documento
            const doc = await tx.document.create({
                data: {
                    title,
                    project_id: Number(projectId),
                    created_by: Number(userId)
                }
            });

            // Criar a primeira versão
            const version = await tx.documentVersion.create({
                data: {
                    document_id: doc.id,
                    version_number: 1,
                    file_path: uploadResult.fileName,
                    uploaded_by: Number(userId),
                    original_name: uploadResult.originalName,
                    mime_type: uploadResult.mimeType,
                    size: uploadResult.size,
                    is_compressed: uploadResult.compressed
                }
            });

            return { ...doc, currentVersion: version };
        });

        return document;
    }

    async createMultipleDocuments(projectId, userId, files) {
        const uploadResults = await uploadService.saveMultipleFiles(files);
        
        const documents = await prisma.$transaction(async (tx) => {
            const results = [];
            
            for (const uploadResult of uploadResults) {
                // Criar o documento
                const doc = await tx.document.create({
                    data: {
                        title: uploadResult.originalName, // Usa o nome original como título
                        project_id: Number(projectId),
                        created_by: Number(userId)
                    }
                });

                // Criar a primeira versão
                const version = await tx.documentVersion.create({
                    data: {
                        document_id: doc.id,
                        version_number: 1,
                        file_path: uploadResult.fileName,
                        uploaded_by: Number(userId),
                        original_name: uploadResult.originalName,
                        mime_type: uploadResult.mimeType,
                        size: uploadResult.size,
                        is_compressed: uploadResult.compressed
                    }
                });

                results.push({ ...doc, currentVersion: version });
            }

            return results;
        });

        return documents;
    }

    async getAllProjectDocuments(projectId) {
        return await prisma.document.findMany({
            where: {
                project_id: Number(projectId)
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                versions: {
                    orderBy: {
                        version_number: 'desc'
                    },
                    take: 1,
                    include: {
                        uploader: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    async getDocumentById(documentId, projectId) {
        return await prisma.document.findFirst({
            where: {
                id: Number(documentId),
                project_id: Number(projectId)
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
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
                }
            }
        });
    }

    async updateDocument(documentId, projectId, title) {
        return await prisma.document.update({
            where: {
                id: Number(documentId),
                project_id: Number(projectId)
            },
            data: { title },
            include: {
                versions: {
                    orderBy: {
                        version_number: 'desc'
                    },
                    take: 1
                }
            }
        });
    }

    async uploadNewVersion(documentId, projectId, userId, file) {
        const uploadResult = await uploadService.saveFile(file);

        const document = await prisma.$transaction(async (tx) => {
            // Encontrar a última versão
            const lastVersion = await tx.documentVersion.findFirst({
                where: { document_id: Number(documentId) },
                orderBy: { version_number: 'desc' }
            });

            const newVersionNumber = (lastVersion?.version_number || 0) + 1;

            // Criar nova versão
            const version = await tx.documentVersion.create({
                data: {
                    document_id: Number(documentId),
                    version_number: newVersionNumber,
                    file_path: uploadResult.fileName,
                    uploaded_by: Number(userId),
                    original_name: uploadResult.originalName,
                    mime_type: uploadResult.mimeType,
                    size: uploadResult.size,
                    is_compressed: uploadResult.compressed
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
            });

            return version;
        });

        return document;
    }

    async deleteDocument(documentId, projectId) {
        const document = await prisma.document.findUnique({
            where: { id: Number(documentId) },
            include: { versions: true }
        });

        if (!document) return null;

        // Deletar arquivos físicos
        for (const version of document.versions) {
            await uploadService.deleteFile(version.file_path);
        }

        // Deletar registro do banco
        await prisma.document.delete({
            where: { id: Number(documentId) }
        });

        return document;
    }

    async getDocumentVersion(documentId, versionNumber) {
        return await prisma.documentVersion.findFirst({
            where: {
                document_id: Number(documentId),
                version_number: Number(versionNumber)
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
        });
    }

    async isDocumentInProject(documentId, projectId) {
        const document = await prisma.document.findFirst({
            where: {
                id: Number(documentId),
                project_id: Number(projectId)
            }
        });
        return !!document;
    }

    getFilePath(version) {
        return uploadService.getFilePath(version.file_path);
    }
}

module.exports = new DocumentService(); 