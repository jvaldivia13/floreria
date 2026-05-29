const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header
 * Attaches user data to req.user if token is valid
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header is required',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authorization format. Use: Bearer <token>',
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Middleware to verify that user is admin
 * Must be used after verifyToken
 */
function verifyAdmin(req, res, next) {
  // First verify the token
  verifyToken(req, res, () => {
    // Then check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin role required',
      });
    }
    next();
  });
}

module.exports = {
  verifyToken,
  verifyAdmin,
};
