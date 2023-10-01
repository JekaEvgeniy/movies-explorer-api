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
      next(new BadRequestError('Ошибка при получении списка фильмов', err));
    });
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  })
    .then((movie) => res.status(codeSuccess.created).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Введены некорректные данные'));
      } else {
        next('Ошибка добавления фильма', err);
      }
    });
};

const removeMovie = (req, res, next) => {
  // Movie.findByIdAndRemove(req.params.movieId)
  Movie.findById(req.params.movieId)
    .orFail(() => new NotFoundError('Фильм с указанным id не найден'))
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        throw new ForbiddenError('Вы не можете удалить чужой фильм');
      } else {
        return Movie.deleteOne(movie)
          .then(() => res.send(movie));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Передан некорректный id фильма'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getMovies, createMovie, removeMovie,
};
