const AppsActiveModel = require('../models/appsActiveModel');

// Menambahkan aplikasi yang sedang diakses oleh pengguna
exports.addAppToActive = async (req, res) => {
  const { app_id } = req.body;
  const userId = req.user.id; // Mengambil user_id dari session/auth token

  try {
    await AppsActiveModel.addAppToActive(userId, app_id);
    res.json({ message: 'App added to active' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Menghapus aplikasi yang tidak lagi diakses oleh pengguna
exports.removeAppFromActive = async (req, res) => {
  const { app_id } = req.body;
  const userId = req.user.id; // Mengambil user_id dari session/auth token

  try {
    await AppsActiveModel.removeAppFromActive(userId, app_id);
    res.json({ message: 'App removed from active' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mendapatkan daftar aplikasi yang sedang diakses oleh pengguna
exports.getUserActiveApps = async (req, res) => {
  const userId = req.user.id; // Mengambil user_id dari session/auth token

  try {
    const activeApps = await AppsActiveModel.getUserActiveApps(userId);
    res.json({ activeApps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
