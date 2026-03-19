// server/middleware/authMiddleware.js
const { verifyToken } = require('../utils/jwt');

function extractToken(req) {
  const bearer = req.headers.authorization || '';
  return bearer.split(' ')[1];
}

exports.protectAdmin = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') throw new Error();
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.protectFreelancer = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = verifyToken(token);
    if (decoded.role !== 'freelancer') throw new Error();
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.protectClient = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== 'client') throw new Error();
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.protectAny = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};