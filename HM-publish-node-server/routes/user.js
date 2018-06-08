var express = require('express');
var router = express.Router();
var userC = require('../controllers/user')
const passport = require('passport');

require('../passport')(passport);

/**
 * 登陆
 *
 * */
router.post('/login', userC.login);

router.get('/info',passport.authenticate('bearer', { session: false }), userC.info);

module.exports = router;
