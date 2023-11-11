const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // за 1 минуту
  max: 200, // можно совершить максимум 100 запросов с одного IP
});

module.exports = limiter;
