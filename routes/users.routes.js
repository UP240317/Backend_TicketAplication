const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users.controller');

// USERS
router.post('/', usersController.createUser);
router.get('/', usersController.getAllUsers);
router.get('/filter', usersController.filterUsers);
router.get('/:id', usersController.getUserById);
router.patch('/:id/status', usersController.toggleUserStatus);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;