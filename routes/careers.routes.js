const express = require('express');
const router = express.Router();
const controller = require('../controllers/careers.controller');

router.get('/', controller.getAllCareers);
router.get('/filter', controller.filterCareers);
router.post('/', controller.createCareer);
router.put('/:id', controller.updateCareer);
router.delete('/:id', controller.deleteCareer);

module.exports = router;