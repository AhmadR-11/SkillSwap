// server/utils/hash.js
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

exports.hashPassword = (plain) =>
  bcrypt.hash(plain, SALT_ROUNDS);

exports.comparePassword = (plain, hash) =>
  bcrypt.compare(plain, hash);
