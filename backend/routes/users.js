const router = require('express').Router();
const {
  updateUser,
  currentUser,
} = require('../controllers/users');

const { validationUpdateUser } = require('../utils/celebrate');

router.get('/me', currentUser);
router.patch('/me', validationUpdateUser, updateUser);

module.exports = router;
