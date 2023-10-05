const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const userRoutes = require('./users');
const movieRoutes = require('./movies');
const { createUser, login, logout } = require('../controllers/users');
const auth = require('../widdlewares/auth');
const NotFoundError = require('../errors/NotFoundError');

// https://regex101.com/
// ТЗ: ПР15. Поле password не ограничено в длину, так как пароль хранится в виде хеша
router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      password: Joi.string().required(),
      email: Joi.string().email().required(),
      name: Joi.string().min(2).max(30).required(),
    }),
  }),
  createUser,
);

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

router.use(auth);

router.use('/users', userRoutes);
router.use('/movies', movieRoutes);
// router.use('/signout', logout);

router.use('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемой страницы нет!'));
});

module.exports = router;
