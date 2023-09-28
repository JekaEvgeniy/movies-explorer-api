const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  updateCurrentUser, getCurrentUser,
} = require('../controllers/users');

// Пути суммируются /users/users см. внимательно index.js

// возвращает информацию о пользователе(email и имя)
router.get('/me', getCurrentUser);

// обновляет информацию о пользователе (email и имя)
router.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
    }),
  }),
  updateCurrentUser,
);

module.exports = router;
