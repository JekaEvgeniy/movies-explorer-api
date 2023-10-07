module.exports = class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.statusCode = 400;
  }
};
