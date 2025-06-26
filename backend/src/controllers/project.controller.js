const projectService = require('../services/project.service');
const { z } = require('zod');
const logger = require('../utils/logger');
const { hasPermission } = require('../utils/permissions');

const projectSchema = z.object({
    name: z.string()
        .min(3, { message: 'O nome do projeto deve ter no mínimo 3 caracteres' })
        .max(150, { message: 'O nome do projeto deve ter no máximo 150 caracteres' }),
    description: z.string()
        .optional()
        .nullable()
        .transform(val => val === '' ? null : val)
        .refine(val => !val || val.length >= 10, {
            message: 'A descrição deve ter no mínimo 10 caracteres quando fornecida'
        })
        .refine(val => !val || val.length <= 1000, {
            message: 'A descrição deve ter no máximo 1000 caracteres'
        })
});

const memberSchema = z.object({
    userId: z.union([
        z.number().int().positive(),
        z.string().regex(/^\d+$/).transform(val => parseInt(val, 10))
    ]),
    role: z.enum(['developer', 'supervisor', 'tutor', 'project_manager', 'team_leader'])
});

class ProjectController {
    async create(req, res) {
        try {
            logger.request(req, 'Project.create');
            
            if (!req.user || !req.user.id) {
                logger.error('Controller Project.create: Usuário não autenticado');
                return res.status(401).json({ 
                    message: 'Usuário não autenticado',
                    errors: [{ path: ['auth'], message: 'É necessário estar autenticado para criar um projeto' }]
                });
            }

            // Verificar permissão para criar projetos
            if (!hasPermission(req.user.role, 'projects:create')) {
                logger.warn(`Controller Project.create: Usuário ${req.user.id} (${req.user.role}) tentou criar projeto sem permissão`);
                return res.status(403).json({
                    message: 'Você não tem permissão para criar projetos'
                });
            }
            
            const validatedData = projectSchema.parse(req.body);
            logger.debug('Controller Project.create: Dados validados com sucesso', validatedData);
            
            const project = await projectService.createProject(validatedData, req.user.id);
            logger.success('Controller Project.create: Projeto criado com sucesso', { projectId: project.id });
            
            res.status(201).json(project);
        } catch (error) {
            logger.error('Controller Project.create: Erro ao criar projeto', error);
            
            if (error instanceof z.ZodError) {
                logger.warn('Controller Project.create: Erro de validação Zod', error.errors);
                return res.status(400).json({ 
                    message: 'Dados inválidos para criação do projeto',
                    errors: error.errors 
                });
            }
            
            res.status(500).json({ 
                message: 'Erro interno do servidor', 
                error: error.message 
            });
        }
    }

    async getAll(req, res) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            
            logger.debug('Controller Project.getAll: Buscando projetos', { userId, userRole });
            
            let projects;
            
            // Se o usuário é admin, pode ver todos os projetos
            if (userRole === 'admin') {
                projects = await projectService.getAllProjectsForAdmin();
                logger.info(`Controller Project.getAll: Admin ${userId} - ${projects.length} projetos encontrados (todos)`);
            } else {
                // Usuários normais só veem projetos onde são membros
                projects = await projectService.getAllProjects(userId);
                logger.info(`Controller Project.getAll: Usuário ${userId} - ${projects.length} projetos encontrados (apenas membros)`);
            }
            
            res.json(projects);
        } catch (error) {
            logger.error('Controller Project.getAll: Erro ao buscar projetos', error);
            
            res.status(500).json({ 
                message: 'Erro ao buscar projetos', 
                error: error.message 
            });
        }
    }

    async getById(req, res) {
        try {
            const { projectId } = req.params;
            logger.debug(`Controller Project.getById: Buscando projeto ${projectId}`);
            
            const project = await projectService.getProjectById(projectId);
            
            if (!project) {
                logger.warn(`Controller Project.getById: Projeto ${projectId} não encontrado`);
                return res.status(404).json({ message: 'Projeto não encontrado' });
            }
            
            logger.info(`Controller Project.getById: Projeto ${projectId} encontrado`);
            res.json(project);
        } catch (error) {
            logger.error(`Controller Project.getById: Erro ao buscar projeto ${req.params.projectId}`, error);
            
            res.status(500).json({ 
                message: 'Erro ao buscar projeto', 
                error: error.message 
            });
        }
    }

    async update(req, res) {
        try {
            const { projectId } = req.params;
            logger.debug(`Controller Project.update: Atualizando projeto ${projectId}`, req.body);
            
            // Verificar permissão para editar projetos
            if (!hasPermission(req.user.role, 'projects:edit')) {
                logger.warn(`Controller Project.update: Usuário ${req.user.id} (${req.user.role}) tentou editar projeto ${projectId} sem permissão`);
                return res.status(403).json({
                    message: 'Você não tem permissão para editar projetos'
                });
            }
            
            try {
                const validatedData = projectSchema.parse(req.body);
                const project = await projectService.updateProject(projectId, validatedData);
                
                logger.success(`Controller Project.update: Projeto ${projectId} atualizado com sucesso`);
                res.json(project);
            } catch (zodError) {
                logger.warn(`Controller Project.update: Erro de validação`, zodError.errors);
                
                return res.status(400).json({ 
                    message: 'Dados inválidos para atualização do projeto',
                    errors: zodError.errors 
                });
            }
        } catch (error) {
            logger.error(`Controller Project.update: Erro ao atualizar projeto ${req.params.projectId}`, error);
            
            res.status(500).json({ 
                message: 'Erro ao atualizar projeto', 
                error: error.message 
            });
        }
    }

    async delete(req, res) {
        try {
            const { projectId } = req.params;
            logger.debug(`Controller Project.delete: Excluindo projeto ${projectId}`);
            
            // Verificar permissão para excluir projetos
            if (!hasPermission(req.user.role, 'projects:delete')) {
                logger.warn(`Controller Project.delete: Usuário ${req.user.id} (${req.user.role}) tentou excluir projeto ${projectId} sem permissão`);
                return res.status(403).json({
                    message: 'Você não tem permissão para excluir projetos'
                });
            }
            
            await projectService.deleteProject(projectId);
            
            logger.success(`Controller Project.delete: Projeto ${projectId} excluído com sucesso`);
            res.status(204).send();
        } catch (error) {
            logger.error(`Controller Project.delete: Erro ao excluir projeto ${req.params.projectId}`, error);
            
            res.status(500).json({ 
                message: 'Erro ao excluir projeto', 
                error: error.message 
            });
        }
    }

    async addMember(req, res) {
        try {
            const { projectId } = req.params;
            logger.debug(`Controller Project.addMember: Adicionando membro ao projeto ${projectId}`, req.body);
            
            // Verificar permissão para adicionar membros
            if (!hasPermission(req.user.role, 'projects:add_members')) {
                logger.warn(`Controller Project.addMember: Usuário ${req.user.id} (${req.user.role}) tentou adicionar membro ao projeto ${projectId} sem permissão`);
                return res.status(403).json({
                    message: 'Você não tem permissão para adicionar membros ao projeto'
                });
            }
            
            try {
                const validatedData = memberSchema.parse(req.body);
                
                const member = await projectService.addMember(
                    projectId,
                    validatedData.userId,
                    validatedData.role
                );
                
                logger.success(`Controller Project.addMember: Membro adicionado ao projeto ${projectId} com sucesso`, { 
                    projectId: projectId, 
                    userId: validatedData.userId, 
                    role: validatedData.role 
                });
                
                res.status(201).json(member);
            } catch (zodError) {
                logger.warn(`Controller Project.addMember: Erro de validação`, zodError.errors);
                
                return res.status(400).json({ 
                    message: 'Dados inválidos para adição de membro',
                    errors: zodError.errors 
                });
            }
        } catch (error) {
            logger.error(`Controller Project.addMember: Erro ao adicionar membro ao projeto ${req.params.projectId}`, error);
            
            res.status(500).json({ 
                message: 'Erro ao adicionar membro ao projeto', 
                error: error.message 
            });
        }
    }

    async removeMember(req, res) {
        try {
            const { projectId, memberId } = req.params;
            logger.debug(`Controller Project.removeMember: Removendo membro ${memberId} do projeto ${projectId}`);
            
            // Verificar permissão para remover membros
            if (!hasPermission(req.user.role, 'projects:remove_members')) {
                logger.warn(`Controller Project.removeMember: Usuário ${req.user.id} (${req.user.role}) tentou remover membro ${memberId} do projeto ${projectId} sem permissão`);
                return res.status(403).json({
                    message: 'Você não tem permissão para remover membros do projeto'
                });
            }
            
            await projectService.removeMember(projectId, memberId);
            
            logger.success(`Controller Project.removeMember: Membro ${memberId} removido do projeto ${projectId} com sucesso`);
            res.status(204).send();
        } catch (error) {
            logger.error(`Controller Project.removeMember: Erro ao remover membro ${req.params.memberId} do projeto ${req.params.projectId}`, error);
            
            res.status(500).json({ 
                message: 'Erro ao remover membro do projeto', 
                error: error.message 
            });
        }
    }

    async getMembers(req, res) {
        try {
            const { projectId } = req.params;
            logger.debug(`Controller Project.getMembers: Buscando membros do projeto ${projectId}`);
            
            const members = await projectService.getProjectMembers(projectId);
            
            logger.success(`Controller Project.getMembers: ${members.length} membros encontrados para o projeto ${projectId}`);
            res.json(members);
        } catch (error) {
            logger.error(`Controller Project.getMembers: Erro ao buscar membros do projeto ${req.params.projectId}`, error);
            
            res.status(500).json({ 
                message: 'Erro ao buscar membros do projeto', 
                error: error.message 
            });
        }
    }
}

module.exports = new ProjectController(); 