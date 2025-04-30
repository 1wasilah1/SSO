const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');

exports.getAllUsers = async (req, res) => {
  try {
    // Mengambil daftar users
    const users = await UserModel.findAll();
    
    // Menambahkan activeApps ke setiap user
    for (let user of users) {
      const activeApps = await UserModel.getActiveApps(user.id); // Ambil aplikasi yang aktif untuk setiap user
      console.log('Active apps for user ' + user.id, activeApps); // Pastikan activeApps sudah benar
      user.activeApps = activeApps; // Menambahkan properti activeApps
    }

    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};



exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userId = await UserModel.create(req.body, hashedPassword);
    res.status(201).json({ message: 'User created', userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { password, role_id } = req.body;

  try {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const userUpdateData = {
      password: hashedPassword,
      role_id
    };

    await UserModel.update(req.params.id, userUpdateData);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await UserModel.delete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
