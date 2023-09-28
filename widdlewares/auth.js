const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

const auth = (req, res, next) => {
  if (!req.cookies) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  let payload;
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.split('Bearer ')[1];

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'my-secret-code');
  } catch (err) {
    next(new UnauthorizedError('Необходима авторизация'));
  }

  req.user = payload;
  return next();
};

module.exports = auth;
