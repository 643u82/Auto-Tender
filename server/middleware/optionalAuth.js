const jwt = require('jsonwebtoken');

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_123');
      req.user = decoded; // The existing middleware sets req.admin, but here we set req.user to be general
      req.admin = decoded; // Keep compatibility
    } catch (error) {
      // Ignore token errors, user will just be treated as unauthenticated
    }
  }

  next();
};

module.exports = optionalAuthMiddleware;
