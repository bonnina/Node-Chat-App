var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render(process.cwd() + '/views/index', {title: 'Hello!', message: 'Please login'});
});

module.exports = router;
