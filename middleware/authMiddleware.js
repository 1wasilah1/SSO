const jwt = require('jsonwebtoken');

exports.verifyAccessToken = (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // inject user info ke req.user
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
