// results.js
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	res.send(state);
});

module.exports = router;

var state = {
	results : []
};