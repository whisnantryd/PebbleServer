// runstate.js
var express = require('express');
var router = new express.Router();

router.get('/', function(req, res) {
	res.send(state);
});

var parse = function(rec) {
	switch(rec[0]) {
		case '$F':
			if((state.flag == 'None' || state.flag == '') && !(state.flag == rec[5].trim()))
				module.exports.onNewFlag();
			
			state.laps_remain = parseInt(rec[1]);
			state.time_remain = rec[2];
			state.time_ofday = rec[3];
			state.time_elapsed = rec[4];
			state.flag = rec[5].trim();
			
			if(parseInt(state.laps_complete) && state.laps_remain < 900) {
				state.laps = state.laps_complete + state.laps_remain;
			} else { state.laps = '---'; state.laps_complete = '---'; }
			
			break;
		case '$G':
			var pos = isNaN(parseInt(rec[1])) ? 0 : parseInt(rec[1]);
			
			if(pos == 1) {
				state.laps_complete = parseInt(rec[3]);
			}
			
			break;
		case '$I':
			reset();
			break;
	}
}

var state = {
	laps : '---',
	laps_complete : '---',
	laps_remain : '---',
	time_remain : '---',
	time_ofday : '---',
	time_elapsed : '---',
	flag : '---'
};

var reset = function() {
	state = {
		laps : '---',
		laps_complete : '---',
		laps_remain : '---',
		time_remain : '---',
		time_ofday : '---',
		time_elapsed : '---',
		flag : '---'
	};
}

module.exports.parse = parse;
module.exports.router = router;
module.exports.onNewFlag = function() {};