// runinfo.js
var express = require('express');
var router = new express.Router();

router.get('/', function(req, res) {
	res.send(state);
});

var parse = function(rec) {
	switch(rec[0]) {
		case '$B':
			state.session = rec[2].trim();
			break;
		case '$C':
			if(state.classes.indexOf(rec[1]) == -1) {
				state.classes[rec[1]] = rec[2];
			}
			break;
		case '$E':
			if(rec[1] == 'TRACKNAME')
				state.track.name = rec[2].trim();
			else
				state.track.length = rec[2].trim();
			break;
		case '$I':
			reset();
			break;
	}
};

var state = {
	session: "---",
	track: {
		name: "---",
		length: "---"
	},
	classes: []
};

var reset = function() {
	state = {
		session: "---",
		track: {
			name: "---",
			length: "---"
		},
		classes: []
	};
};

module.exports.parse = parse;
module.exports.router = router;
