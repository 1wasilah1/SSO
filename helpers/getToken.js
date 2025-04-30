// helpers/getToken.js
exports.getToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    if (req.cookies && req.cookies.accessToken) {
      return req.cookies.accessToken;
    }
    return null;
  };
  