const express = require('express');
const router = express.Router();
const controller = require('../controllers/tickets.controller');

router.post('/', controller.createTicket);
router.get('/', controller.filterTickets);
router.get('/:id', controller.getTicketById);
router.put('/:id', controller.updateTicket);
router.patch('/:id', controller.updateTicketStatus);
router.delete('/:id', controller.deleteTicket);
router.post('/assign', controller.assignTicket);

module.exports = router;