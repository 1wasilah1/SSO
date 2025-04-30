const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyAccessToken } = require('../middleware/authMiddleware');

// Endpoint yang butuh token
router.post('/me', verifyAccessToken, authController.me);
router.post('/logout', verifyAccessToken, authController.logout);
router.post('/add-app', verifyAccessToken, authController.addAppToActive);
router.post('/remove-app', verifyAccessToken, authController.removeAppFromActive);
router.get('/active-apps', verifyAccessToken, authController.getActiveApps);

// Endpoint yang tidak butuh token
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
