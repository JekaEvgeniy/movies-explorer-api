const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  updateCurrentUser, getCurrentUser,
} = require('../controllers/users');
const { validateUpdateCurrentUser } = require('../widdlewares/validation');

// Пути суммируются /users/users см. внимательно index.js

// возвращает информацию о пользователе(email и имя)
router.get('/me', getCurrentUser);

// обновляет информацию о пользователе (email и имя)
router.patch(
  '/me',
  validateUpdateCurrentUser,
  updateCurrentUser,
);

module.exports = router;
