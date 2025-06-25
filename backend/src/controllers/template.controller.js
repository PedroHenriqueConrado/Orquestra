const templateService = require('../services/template.service');
const logger = require('../utils/logger');

class TemplateController {
    /**
     * Criar template a partir de projeto existente
     */
    async createFromProject(req, res) {
        try {
            const { projectId } = req.params;
            const { name, description, category, is_public } = req.body;
            const userId = req.user.id;

            logger.debug('TemplateController.createFromProject: Requisição recebida', {
                projectId,
                userId,
                templateData: { name, description, category, is_public }
            });

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome do template é obrigatório'
                });
            }

            const template = await templateService.createFromProject(projectId, userId, {
                name,
                description,
                category,
                is_public
            });

            res.status(201).json({
                success: true,
                data: template,
                message: 'Template criado com sucesso'
            });

        } catch (error) {
            logger.error('TemplateController.createFromProject: Erro na requisição', {
                error: error.message,
                stack: error.stack
            });

            res.status(500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }

    /**
     * Listar templates disponíveis
     */
    async getTemplates(req, res) {
        try {
            const userId = req.user.id;
            const { category, search } = req.query;

            logger.debug('TemplateController.getTemplates: Requisição recebida', {
                userId,
                filters: { category, search }
            });

            const templates = await templateService.getTemplates(userId, {
                category,
                search
            });

            res.json({
                success: true,
                data: templates
            });

        } catch (error) {
            logger.error('TemplateController.getTemplates: Erro na requisição', {
                error: error.message,
                stack: error.stack
            });

            res.status(500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }

    /**
     * Buscar template por ID
     */
    async getTemplateById(req, res) {
        try {
            const { templateId } = req.params;
            const userId = req.user.id;

            logger.debug('TemplateController.getTemplateById: Requisição recebida', {
                templateId,
                userId
            });

            const template = await templateService.getTemplateById(templateId, userId);

            res.json({
                success: true,
                data: template
            });

        } catch (error) {
            logger.error('TemplateController.getTemplateById: Erro na requisição', {
                error: error.message,
                stack: error.stack
            });

            if (error.message.includes('não encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }

    /**
     * Criar projeto a partir de template
     */
    async createProjectFromTemplate(req, res) {
        console.log('[TEMPLATE] Início - user:', req.user?.id, 'templateId:', req.params.templateId, 'body:', req.body);
        try {
            const { templateId } = req.params;
            const { name, description, members } = req.body;
            const userId = req.user.id;

            logger.debug('TemplateController.createProjectFromTemplate: Requisição recebida', {
                templateId,
                userId,
                projectData: { name, description, members }
            });

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome do projeto é obrigatório'
                });
            }

            const project = await templateService.createProjectFromTemplate(templateId, userId, {
                name,
                description,
                members
            });

            console.log('[TEMPLATE] Sucesso - Projeto criado:', project.id);
            res.status(201).json({
                success: true,
                data: project,
                message: 'Projeto criado com sucesso a partir do template'
            });

        } catch (error) {
            console.log('[TEMPLATE] ERRO:', error.message, error.stack);
            logger.error('TemplateController.createProjectFromTemplate: Erro na requisição', {
                error: error.message,
                stack: error.stack
            });

            res.status(500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }

    /**
     * Deletar template
     */
    async deleteTemplate(req, res) {
        try {
            const { templateId } = req.params;
            const userId = req.user.id;

            logger.debug('TemplateController.deleteTemplate: Requisição recebida', {
                templateId,
                userId
            });

            await templateService.deleteTemplate(templateId, userId);

            res.json({
                success: true,
                message: 'Template deletado com sucesso'
            });

        } catch (error) {
            logger.error('TemplateController.deleteTemplate: Erro na requisição', {
                error: error.message,
                stack: error.stack
            });

            if (error.message.includes('não encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }

    /**
     * Buscar categorias disponíveis
     */
    async getCategories(req, res) {
        try {
            logger.debug('TemplateController.getCategories: Requisição recebida');

            const categories = await templateService.getCategories();

            res.json({
                success: true,
                data: categories
            });

        } catch (error) {
            logger.error('TemplateController.getCategories: Erro na requisição', {
                error: error.message,
                stack: error.stack
            });

            res.status(500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }
}

module.exports = new TemplateController(); 