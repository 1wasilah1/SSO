// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const { getToken } = require('../helpers/getToken');

// --- LOGIN ---
exports.login = async (req, res) => {
  const { username, password, app_id } = req.body;

  try {
    const user = await UserModel.findByUsername(username);

    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.PASSWORD);

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const tokenVersion = await UserModel.getTokenVersion(user.ID);

    const payload = {
      id: user.ID,
      username: user.USERNAME,
      tokenVersion: tokenVersion
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // 🔥 Tambahan ini! Setelah login sukses, add app_id ke active apps
    if (app_id) {
      await UserModel.addActiveApp(user.ID, app_id);
    }

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000 // 15 menit
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
    });

    res.json({ message: 'Login successful' });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// --- ADD APP TO ACTIVE ---
exports.addAppToActive = async (req, res) => {
  const { app_id } = req.body;
  const userId = req.user.id;

  try {
    await UserModel.addActiveApp(userId, app_id);
    const activeApps = await UserModel.getActiveApps(userId);

    res.json({
      message: 'App added to active',
      activeApps
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- REMOVE APP FROM ACTIVE ---
exports.removeAppFromActive = async (req, res) => {
  const { app_id } = req.body;
  const userId = req.user.id;

  try {
    await UserModel.removeActiveApp(userId, app_id);
    const activeApps = await UserModel.getActiveApps(userId);

    res.json({
      message: 'App removed from active',
      activeApps
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- GET ACTIVE APPS ---
exports.getActiveApps = async (req, res) => {
  const userId = req.user.id;

  try {
    const activeApps = await UserModel.getActiveApps(userId);
    res.json({ activeApps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- REFRESH TOKEN ---
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    console.log('Payload berhasil:', payload); // 🔥 Tambahkan ini!

    const currentTokenVersion = await UserModel.getTokenVersion(payload.id);
    if (payload.tokenVersion !== currentTokenVersion) {
      return res.status(401).json({ error: 'Invalid refresh token. Please login again.' });
    }

    const newAccessToken = jwt.sign(
      { id: payload.id, username: payload.username, tokenVersion: currentTokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Error refreshing token:', err); // 🔥 Log error asli
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};


// --- ME (USER INFO) ---

exports.me = async (req, res) => {
  const { app_id } = req.body;
  const token = getToken(req); // 🔥 pakai helper

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (!app_id) {
    return res.status(400).json({ error: 'App ID is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const currentTokenVersion = await UserModel.getTokenVersion(decoded.id);
    if (decoded.tokenVersion !== currentTokenVersion) {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    const activeApps = await UserModel.getActiveApps(decoded.id);
    if (!activeApps.includes(app_id)) {
      return res.status(403).json({ error: 'You are not active in this app. Please login again.' });
    }

    const roleResult = await UserModel.getUserRole(decoded.id);
    const roleName = roleResult?.ROLE_NAME || 'user';

    res.json({
      id: decoded.id,
      username: decoded.username,
      role: roleName
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};



// --- LOGOUT ---
exports.logout = async (req, res) => {
  const { app_id } = req.body;
  const token = getToken(req); // 🔥 pakai helper

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (!app_id) {
    return res.status(400).json({ error: 'App ID is required to logout from an app' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    await UserModel.removeActiveApp(userId, app_id);

    const activeApps = await UserModel.getActiveApps(userId);

    if (activeApps.length === 0) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
    }

    res.json({ message: 'Logged out successfully from app' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

