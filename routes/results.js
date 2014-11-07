// results.js
var express = require('express');
var router = express.Router();
var Result = require('../models/resultmodel.js');

var REGEX_NAME = /\*\s|\#\s/g;
var REGEX_TIME = /^00:/g;

router.get('/', function(req, res) {
	res.send({
		results : state.sort(function(a, b) { return a.pos - b.pos; })
	});
});

router.get('/:limit?', function(req, res) {
	var limit = req.params.limit;
	
	if(limit) {
		var ret = state.filter(function(r) {
			return (r.pos != "" && r.pos <= limit && r.pos > 0);
		});
		
		res.send({
			results : ret
		})
	} else {
		res.send({
			results : state.sort(function(a, b) { return a.pos - b.pos; })
		});
	}
});

function getResult(reg) {
	var obj = state.filter(function(r) {
		return r.no == reg;
	});
	
	if(obj && obj.length == 1) {
		obj = obj[0];
	} else {
		obj = new Result();
		obj.no = reg;
		obj.pos = 0;
		state.push(obj);
	}
	
	return obj;
}

var parse = function(rec) {
	switch(rec[0]) {
		case '$A':
			var obj = getResult(rec[2]);
			
			var fname = rec[4].replace(REGEX_NAME, '');
			var lname = rec[5].replace(REGEX_NAME, '');
			
			obj.nm = fname.substring(0, 1) + '. ' + lname;
			obj.cls = parseInt(rec[7]);
			
			break;
		case '$G':
			var obj = getResult(rec[2]);

			obj.pos = isNaN(parseInt(rec[1])) ? 0 : parseInt(rec[1]);
			obj.lap = parseInt(rec[3]);
			obj.elp = rec[4].replace(REGEX_TIME, '');
			
			break;
		case '$H':
			var obj = getResult(rec[2]);
			
			obj.bl = parseInt(rec[3]);
			obj.bt = rec[4].replace(REGEX_TIME, '');
			
			break;
		case '$J':
			var obj = getResult(rec[1]);
			
			obj.lt = rec[2].replace(REGEX_TIME, '');

			break;
		case '$I':
			reset();
			break;
	}
}

var state = [];

var reset = function() {
	state = [];
}

module.exports.parse = parse;
module.exports.router = router;