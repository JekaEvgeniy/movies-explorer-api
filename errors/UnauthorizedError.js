module.exports = class UnauthorizedError extends Error {
  constructor(err) {
    super(err);
    this.statusCode = 401;
  }
};
// Example: throw new UnauthorizedError('Необходима авторизация');
