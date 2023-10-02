module.exports = class ValidationError extends Error {
  constructor(err) {
    super(err);
    this.statusCode = 400;
  }
};
