// routes/appRoutes.js
const express = require('express');
const {
  createApp,
  getAllApps,
  getAppById,
  updateApp,
  deleteApp
} = require('../controllers/appController');
const router = express.Router();

router.post('/', createApp);
router.get('/', getAllApps);
router.get('/:id', getAppById);
router.put('/:id', updateApp);
router.delete('/:id', deleteApp);

module.exports = router;
