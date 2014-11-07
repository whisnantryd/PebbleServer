// runstate.js
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	res.send(state);
});

module.exports = router;

var state = {
	laps_remain : '---',
	time_remain : '---',
	time_ofday : '---',
	time_elapsed : '---',
	flag : '---'
};