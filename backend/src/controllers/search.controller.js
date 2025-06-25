const searchService = require('../services/search.service');
const logger = require('../utils/logger');

class SearchController {
    /**
     * Busca global
     */
    async globalSearch(req, res) {
        try {
            logger.request(req, 'Search.globalSearch');
            
            const { query, type = 'all', limit = 20 } = req.query;
            const userId = req.user.id;

            if (!query || query.trim().length < 2) {
                return res.status(400).json({
                    error: 'Query inválida',
                    details: 'O termo de busca deve ter pelo menos 2 caracteres'
                });
            }

            const results = await searchService.globalSearch(
                userId,
                query.trim(),
                type,
                Number(limit)
            );

            logger.success('Search.globalSearch: Busca realizada com sucesso', {
                userId,
                query,
                total: results.total
            });

            res.json(results);

        } catch (error) {
            logger.error('Search.globalSearch: Erro na busca global', {
                error: error.message,
                stack: error.stack,
                userId: req.user.id,
                query: req.query.query
            });

            res.status(500).json({
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao realizar a busca'
            });
        }
    }

    /**
     * Busca rápida para autocomplete
     */
    async quickSearch(req, res) {
        try {
            logger.request(req, 'Search.quickSearch');
            
            const { query, limit = 5 } = req.query;
            const userId = req.user.id;

            if (!query || query.trim().length < 1) {
                return res.json([]);
            }

            const results = await searchService.quickSearch(
                userId,
                query.trim(),
                Number(limit)
            );

            logger.success('Search.quickSearch: Busca rápida realizada com sucesso', {
                userId,
                query,
                resultsCount: results.length
            });

            res.json(results);

        } catch (error) {
            logger.error('Search.quickSearch: Erro na busca rápida', {
                error: error.message,
                stack: error.stack,
                userId: req.user.id,
                query: req.query.query
            });

            res.status(500).json({
                error: 'Erro interno do servidor',
                details: 'Ocorreu um erro ao realizar a busca rápida'
            });
        }
    }
}

module.exports = new SearchController(); 