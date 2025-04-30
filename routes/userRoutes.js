const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Pastikan file ini ada dan berfungsi dengan baik
const { createUserValidator, updateUserValidator } = require('../validators/userValidator'); // Pastikan validator ini ada

// Untuk mengambil semua user
router.get('/', userController.getAllUsers);

// Untuk membuat user baru
router.post('/', createUserValidator, userController.createUser);

// Untuk update user, pastikan updateUserValidator dan userController.updateUser ada dan terdefinisi dengan benar
router.put('/:id', updateUserValidator, userController.updateUser);

// Untuk menghapus user
router.delete('/:id', userController.deleteUser);

module.exports = router;
