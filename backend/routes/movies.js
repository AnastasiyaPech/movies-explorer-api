const router = require('express').Router();
const {
  createMovie,
  findMovie,
  deleteMovieId,
} = require('../controllers/movies');

const { validationCreateMovie, validationMovieId } = require('../utils/celebrate');

router.post('/', validationCreateMovie, createMovie);
router.get('/', findMovie);
router.delete('/_id', validationMovieId, deleteMovieId);

module.exports = router;
