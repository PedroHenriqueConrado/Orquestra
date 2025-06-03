const projectService = require('../services/project.service');
const { z } = require('zod');

const projectSchema = z.object({
    name: z.string().min(3).max(150),
    description: z.string().optional()
});

const memberSchema = z.object({
    userId: z.number().int().positive(),
    role: z.enum(['developer', 'supervisor', 'tutor', 'project_manager', 'team_leader'])
});

class ProjectController {
    async create(req, res) {
        try {
            const validatedData = projectSchema.parse(req.body);
            const project = await projectService.createProject(validatedData, req.user.id);
            res.status(201).json(project);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getAll(req, res) {
        try {
            const projects = await projectService.getAllProjects();
            res.json(projects);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getById(req, res) {
        try {
            const project = await projectService.getProjectById(req.params.id);
            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.json(project);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async update(req, res) {
        try {
            const validatedData = projectSchema.parse(req.body);
            const project = await projectService.updateProject(req.params.id, validatedData);
            res.json(project);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async delete(req, res) {
        try {
            await projectService.deleteProject(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async addMember(req, res) {
        try {
            const validatedData = memberSchema.parse(req.body);
            const member = await projectService.addMember(
                req.params.id,
                validatedData.userId,
                validatedData.role
            );
            res.status(201).json(member);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async removeMember(req, res) {
        try {
            await projectService.removeMember(req.params.id, req.params.userId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getMembers(req, res) {
        try {
            const members = await projectService.getProjectMembers(req.params.id);
            res.json(members);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new ProjectController(); 