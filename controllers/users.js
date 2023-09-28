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

const getUsers = (req, res, next) => {
  // console.log('GET /users');
  // console.log(111, req.user);//{ _id: '650323047e49e29bf8466e52', iat: 1694712469 }

  User.find({})
    .then((users) => res.status(codeSuccess.ok).send(users))
    .catch((err) => {
      next(err);
    });
};

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

const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => {
      const error = new Error('Not Found');
      error.statusCode = codeErrors.notFound;
      return error;
    })
    .then((user) => {
      if (user) {
        res.status(codeSuccess.ok).send(user);
        // res.status(codeSuccess.ok).send({ data: user });
      } else {
        throw NotFoundError('Пользователь с указанным _id не найден');
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
    name, about, avatar, email, password,
  } = req.body;
  if (!email && !password) {
    next(new BadRequestError('Поля email и password обязательны для заполнения'));
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
        name, about, avatar, email, password: hash,
      })
        .then(() => {
          // res.status(codeSuccess.created).send(data);
          res.status(codeSuccess.created).send({
            data: {
              name, about, avatar, email,
            },
          });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            next(new BadRequestError('Введены некорректные данные'));
          }
          if (err.code === 11000) {
            next(new ConflictError('Пользователь с таким email уже существует'));
          }
          next(err);
        });
    });
};

const updateCurrentUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
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

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
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
        next(new BadRequestError('Переданы некорректные данные при обновлении аватара'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  // console.log('POST /login');
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
  getUsers, getUserById, createUser, updateCurrentUser, updateAvatar, login, getCurrentUser,
};
