// results.js
var express = require('express');
var router = new express.Router();
var Result = require('../models/resultmodel.js');

var REGEX_NAME = /\*\s|\#\s/g;
var REGEX_TIME = /^00:00:|^00:/;

router.get('/', function(req, res) {
	res.send({
		results : state.sort(function(a, b) { return a.pos - b.pos; })
	});
});

router.get('/:startat/:count?', function(req, res) {
	var startat = parseInt(req.params.startat);
	var count = parseInt(req.params.count);
	
	res.send(returnResults(startat, count));
	res.end();
});

function returnResults(startpos, count) {
	if(isNaN(count)) {
		count = 9999;
	}
	
	var ret = [], sorted = state.sort(function(a, b) {
		return a.pos - b.pos;
	});
	
	sorted.forEach(function(r) {
		if(r.pos >= startpos && ret.length < count) {
			ret.push(r);
		}
	});
	
	return {
		results : ret
	};
}

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
module.exports.reset = function() {
	state = [];
}