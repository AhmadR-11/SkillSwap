// server/utils/jwt.js
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config');

exports.signToken = (payload, expiresIn = '1h') =>
  jwt.sign(payload, jwtSecret, { expiresIn });

exports.verifyToken = (token) =>
  jwt.verify(token, jwtSecret);
