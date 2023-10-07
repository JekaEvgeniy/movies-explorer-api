const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const userRoutes = require('./users');
const movieRoutes = require('./movies');
const { createUser, login } = require('../controllers/users');
const auth = require('../widdlewares/auth');
const NotFoundError = require('../errors/NotFoundError');
const { validateSignUp, validateSignIn } = require('../widdlewares/validation');

// https://regex101.com/
// ТЗ: ПР15. Поле password не ограничено в длину, так как пароль хранится в виде хеша
router.post(
  '/signup',
  validateSignUp,
  createUser,
);

router.post(
  '/signin',
  validateSignIn,
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
