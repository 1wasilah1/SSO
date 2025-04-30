// controllers/appController.js
const AppModel = require('../models/appModel');

// Membuat aplikasi baru
exports.createApp = async (req, res) => {
  const { name, description } = req.body;

  try {
    const appId = await AppModel.create({ name, description });
    res.status(201).json({ message: 'App created', appId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mendapatkan semua aplikasi
exports.getAllApps = async (req, res) => {
  try {
    const apps = await AppModel.findAll();
    res.json({ apps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mendapatkan aplikasi berdasarkan ID
exports.getAppById = async (req, res) => {
  const { id } = req.params;

  try {
    const app = await AppModel.findById(id);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }
    res.json({ app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mengupdate aplikasi
exports.updateApp = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const success = await AppModel.update(id, { name, description });
    if (!success) {
      return res.status(404).json({ error: 'App not found or not updated' });
    }
    res.json({ message: 'App updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Menghapus aplikasi
exports.deleteApp = async (req, res) => {
  const { id } = req.params;

  try {
    const success = await AppModel.delete(id);
    if (!success) {
      return res.status(404).json({ error: 'App not found' });
    }
    res.json({ message: 'App deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
