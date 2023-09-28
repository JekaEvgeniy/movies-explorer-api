const { codeSuccess } = require('../vars/data');
const Movie = require('../models/movies');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      res.send(movies);
    })
    .catch((err) => {
      next(err);
    });
};

const createMovie = (req, res, next) => {
  const { name, link } = req.body;

  Movie.create({ name, link, owner: req.user._id })
    .then((movie) => res.status(codeSuccess.created).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введены некорректные данные'));
      } else {
        next(err);
      }
    });
};

const removeMovie = (req, res, next) => {
  // Movie.findByIdAndRemove(req.params.movieId)
  Movie.findById(req.params.movieId)
    .orFail(() => new NotFoundError('Фильм с указанным _id не найден.'))
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        throw new ForbiddenError('Вы не можете удалить чужую карточку');
      } else {
        return Movie.deleteOne(movie)
          .then(() => res.send(movie));
      }
    })
    .catch(next);
};

const getMovieById = (req, res, next) => {
  Movie.findById(req.params.id)
    .orFail(() => next(new NotFoundError('Фильм с указанным _id не найден.')))
    .then((movie) => {
      if (movie) {
        res.status(codeSuccess.ok).send(movie);
      } else {
        next(new NotFoundError('Передан несуществующий _id карточки.'));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введены некорректные данные'));
      } else if (err.name === 'Not Found') {
        next(new NotFoundError('Фильм с указанным _id не найден.'));
      } else {
        next(err);
      }
    });
};

const likeMovie = (req, res, next) => {
  Movie.findByIdAndUpdate(
    req.params.movieId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((movie) => {
      if (movie) {
        res.status(codeSuccess.ok).send(movie);
      } else {
        throw new NotFoundError('Фильм с указанным _id не найден.');
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные для постановки лайка'));
      } else if (err.name === 'CastError') {
        next(new NotFoundError('Фильм с указанным _id не найден.'));
      } else {
        next(err);
      }
    });
};

const dislikeMovie = (req, res, next) => {
  Movie.findByIdAndUpdate(
    req.params.movieId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((movie) => {
      if (movie) {
        res.status(codeSuccess.ok).send(movie);
      } else {
        next(new NotFoundError('Фильм с указанным _id не найден.'));
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные для снятии лайка'));
      } else if (err.name === 'CastError') {
        next(new BadRequestError(`Переданы некорректные данные ${err.path}`));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getMovies, createMovie, removeMovie, getMovieById, likeMovie, dislikeMovie,
};
