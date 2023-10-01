const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { codeErrors, codeSuccess } = require('../vars/data');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const ForbiddenError = require('../errors/ForbiddenError');
const UnauthorizedError = require('../errors/UnauthorizedError');

const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFoundError('Пользователь не найден');
    })
    .then((user) => {
      if (user) {
        res.status(codeSuccess.ok).send(user);
        // res.status(codeSuccess.ok).send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else if (err.statusCode === codeErrors.notFound) {
        next(new NotFoundError('Пользователь с указанным _id не найден'));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  // console.log('POST /signup >>> users.js > createUser');

  if (!req.body) {
    next(new BadRequestError('Введены некорректные данные'));
  }

  const {
    name, email, password,
  } = req.body;

  if (!email && !password && !name) {
    // Делаем минимальную прповерку, т.к. все поля required
    next(new BadRequestError('Все поля обязательны для заполнения'));
  }

  // User.findOne({ email })
  //   .then((user) => {
  //     if (user) {
  //       next(new ConflictError('При регистрации указан email));
  //     }
  //   });

  bcrypt.hash(String(req.body.password), 10)
    .then((hash) => {
      User.create({
        name, email, password: hash,
      })
        .then(() => {
          // res.status(codeSuccess.created).send(data);
          res.status(codeSuccess.created).send({
            data: {
              name, email,
            },
          });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new BadRequestError(`Введены некорректные данные, ${err}`));
          }
          if (err.code === 11000) {
            next(new ConflictError('Пользователь с таким email уже существует'));
          }
          next(err);
        });
    });
};

const updateCurrentUser = (req, res, next) => {
  const { name } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (user) {
        // res.status(codeSuccess.ok).send(user);
        res.status(codeSuccess.ok).send({ data: user });
      } else {
        next(new NotFoundError('Пользователь с указанным _id не найден'));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  console.log('POST /login');
  if (!req.body) {
    throw new ForbiddenError('Неправильный логин/пароль');
  }

  const { email, password } = req.body;

  if (!email && !password) {
    next(new BadRequestError('Поля email и password обязательны для заполнения'));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // const token = jwt.sign({ _id: user._id }, JWT_SECRET);
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'my-secret-code', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(() => {
      next(new UnauthorizedError('Неправильный логин/пароль'));
    });
};

module.exports = {
  createUser, updateCurrentUser, login, getCurrentUser,
};
