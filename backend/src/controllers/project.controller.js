const projectService = require('../services/project.service');
const { z } = require('zod');
const logger = require('../utils/logger');

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
            logger.debug('Controller Project.getAll: Buscando todos os projetos');
            
            const projects = await projectService.getAllProjects();
            logger.info(`Controller Project.getAll: ${projects.length} projetos encontrados`);
            
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
            const { id } = req.params;
            logger.debug(`Controller Project.getById: Buscando projeto ${id}`);
            
            const project = await projectService.getProjectById(id);
            
            if (!project) {
                logger.warn(`Controller Project.getById: Projeto ${id} não encontrado`);
                return res.status(404).json({ message: 'Projeto não encontrado' });
            }
            
            logger.info(`Controller Project.getById: Projeto ${id} encontrado`);
            res.json(project);
        } catch (error) {
            logger.error(`Controller Project.getById: Erro ao buscar projeto ${req.params.id}`, error);
            
            res.status(500).json({ 
                message: 'Erro ao buscar projeto', 
                error: error.message 
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            logger.debug(`Controller Project.update: Atualizando projeto ${id}`, req.body);
            
            try {
                const validatedData = projectSchema.parse(req.body);
                const project = await projectService.updateProject(id, validatedData);
                
                logger.success(`Controller Project.update: Projeto ${id} atualizado com sucesso`);
                res.json(project);
            } catch (zodError) {
                logger.warn(`Controller Project.update: Erro de validação`, zodError.errors);
                
                return res.status(400).json({ 
                    message: 'Dados inválidos para atualização do projeto',
                    errors: zodError.errors 
                });
            }
        } catch (error) {
            logger.error(`Controller Project.update: Erro ao atualizar projeto ${req.params.id}`, error);
            
            res.status(500).json({ 
                message: 'Erro ao atualizar projeto', 
                error: error.message 
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            logger.debug(`Controller Project.delete: Excluindo projeto ${id}`);
            
            await projectService.deleteProject(id);
            
            logger.success(`Controller Project.delete: Projeto ${id} excluído com sucesso`);
            res.status(204).send();
        } catch (error) {
            logger.error(`Controller Project.delete: Erro ao excluir projeto ${req.params.id}`, error);
            
            res.status(500).json({ 
                message: 'Erro ao excluir projeto', 
                error: error.message 
            });
        }
    }

    async addMember(req, res) {
        try {
            const { id } = req.params;
            logger.debug(`Controller Project.addMember: Adicionando membro ao projeto ${id}`, req.body);
            
            try {
                const validatedData = memberSchema.parse(req.body);
                
                const member = await projectService.addMember(
                    id,
                    validatedData.userId,
                    validatedData.role
                );
                
                logger.success(`Controller Project.addMember: Membro adicionado ao projeto ${id} com sucesso`, { 
                    projectId: id, 
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
            logger.error(`Controller Project.addMember: Erro ao adicionar membro ao projeto ${req.params.id}`, error);
            
            res.status(500).json({ 
                message: 'Erro ao adicionar membro ao projeto', 
                error: error.message 
            });
        }
    }

    async removeMember(req, res) {
        try {
            const { id, userId } = req.params;
            logger.debug(`Controller Project.removeMember: Removendo membro ${userId} do projeto ${id}`);
            
            await projectService.removeMember(id, userId);
            
            logger.success(`Controller Project.removeMember: Membro ${userId} removido do projeto ${id} com sucesso`);
            res.status(204).send();
        } catch (error) {
            logger.error(`Controller Project.removeMember: Erro ao remover membro ${req.params.userId} do projeto ${req.params.id}`, error);
            
            res.status(500).json({ 
                message: 'Erro ao remover membro do projeto', 
                error: error.message 
            });
        }
    }

    async getMembers(req, res) {
        try {
            const { id } = req.params;
            logger.debug(`Controller Project.getMembers: Buscando membros do projeto ${id}`);
            
            const members = await projectService.getProjectMembers(id);
            
            logger.info(`Controller Project.getMembers: ${members.length} membros encontrados para o projeto ${id}`);
            res.json(members);
        } catch (error) {
            logger.error(`Controller Project.getMembers: Erro ao buscar membros do projeto ${req.params.id}`, error);
            
            res.status(500).json({ 
                message: 'Erro ao buscar membros do projeto', 
                error: error.message 
            });
        }
    }
}

module.exports = new ProjectController(); 