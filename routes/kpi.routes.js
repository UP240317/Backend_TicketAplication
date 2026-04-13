const express = require('express');
const router = express.Router();
const controller = require('../controllers/kpi.controller');

router.get('/tickets/status', controller.ticketsByStatus);
router.get('/tickets/avg-time', controller.avgResolutionTime);

module.exports = router;