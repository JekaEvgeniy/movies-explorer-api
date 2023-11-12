const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { codeErrors, codeSuccess } = require('../vars/data');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
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

// const createUser = (req, res, next) => {
//   // console.log('POST /signup >>> users.js > createUser');
//   console.log('req.body', req.body);

//   const {
//     name, email,
//   } = req.body;

//   bcrypt.hash(String(req.body.password), 10)
//     .then((hash) => {
//       User.create({
//         name, email, password: hash,
//       })
//         .then(() => {
//           // res.status(codeSuccess.created).send(data);
//           res.status(codeSuccess.created).send({
//             data: {
//               name, email,
//             },
//           });
//         })
//         .catch((err) => {
//           if (err.name === 'ValidationError') {
//             next(new BadRequestError(`Введены некорректные данные, ${err}`));
//           }
//           if (err.code === 11000) {
//             next(new ConflictError('Пользователь с таким email уже существует'));
//           }
//           next(err);
//         });
//     });
// };

// const createUser = (req, res, next) => {
//   // console.log('POST /signup >>> users.js > createUser');

//   if (!req.body) {
//     next(new BadRequestError('Введены некорректные данные'));
//   }

//   const {
//     name, email, password,
//   } = req.body;
//   if (!email && !password && !name) {
//     next(new BadRequestError('Все поля обязательны для заполнения'));
//   }

//   bcrypt.hash(String(req.body.password), 10)
//     .then((hash) => {
//       User.create({
//         name, email, password: hash,
//       })
//         .then(() => {
//           // res.status(codeSuccess.created).send(data);
//           res.status(codeSuccess.created).send({
//             data: {
//               name, email,
//             },
//           });
//         })
//         .catch((err) => {
//           if (err.name === 'ValidationError') {
//             next(new BadRequestError('Введены некорректные данные'));
//           }
//           if (err.code === 11000) {
//             next(new ConflictError('Пользователь с таким email уже существует'));
//           }
//           next(err);
//         });
//     });
// };

const createUser = (req, res, next) => {
  const { email, password, name } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({ email, name, password: hash }))
    .then((user) => res.send(user.toJSON()))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введены некорректные данные'));
      } else if (err.name === 'MongoError' && err.code === 11000) {
        next(new ConflictError('Пользователь с таким email уже существует'));
      } else {
        next(err);
      }
    });
};



const updateCurrentUser = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
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
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      }
      if (err.code === 11000) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  // console.log('POST /login');
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'my-secret-code', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(() => {
      next(new UnauthorizedError('Неправильный логин/пароль'));
    });
};

// Токен будет хранится в localStorage
// const logout = (req, res) => {
//   const token = localStorage.getItem('jwt');
//   if (token) {
//     localStorage.removeItem('jwt');
//     res.send({ message: 'Вы вышли из системы' });
//   }
// };

module.exports = {
  // logout,
  createUser, updateCurrentUser, login, getCurrentUser,
};
