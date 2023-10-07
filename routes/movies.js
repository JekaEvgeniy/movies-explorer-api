const router = require('express').Router();

const {
  getMovies, createMovie, removeMovie,
} = require('../controllers/movies');

const { validateCreateMovie, validateDeleteMovie } = require('../widdlewares/validation');

router.get('/', getMovies);

router.post(
  '/',
  validateCreateMovie,
  createMovie,
);

router.delete(
  '/:movieId',
  validateDeleteMovie,
  removeMovie,
);

module.exports = router;
