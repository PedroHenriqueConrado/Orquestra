const dashboardService = require('../services/dashboard.service');
const { z } = require('zod');

const timelineSchema = z.object({
    days: z.string().regex(/^\d+$/).transform(Number).optional()
});

class DashboardController {
    async getProjectStatistics(req, res) {
        try {
            const { projectId } = req.params;
            const statistics = await dashboardService.getProjectStatistics(projectId);
            res.json(statistics);
        } catch (error) {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getProjectTimeline(req, res) {
        try {
            const { projectId } = req.params;
            const { days } = timelineSchema.parse(req.query);
            const timeline = await dashboardService.getProjectTimeline(projectId, days);
            res.json(timeline);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getMemberPerformance(req, res) {
        try {
            const { projectId } = req.params;
            const performance = await dashboardService.getMemberPerformance(projectId);
            res.json(performance);
        } catch (error) {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getOverallStatistics(req, res) {
        try {
            const statistics = await dashboardService.getOverallStatistics();
            res.json(statistics);
        } catch (error) {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async getProjectProgress(req, res) {
        try {
            const { projectId } = req.params;
            const progress = await dashboardService.getProjectProgress(projectId);
            res.json(progress);
        } catch (error) {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}

module.exports = new DashboardController(); 