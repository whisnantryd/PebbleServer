// update.js
var express = require('express');
var router = new express.Router();
//var auth = require('../midware/auth.js');
var exec = require('child_process').exec;

//console.log(process.env.HOME);

//router.use('/', auth);

router.get('/', function(req, res) {
	/*
	setTimeout(function() {
		var child = exec('$HOME/../home/ubuntu/start_pebble',
			function(err, stdout, stderr) {
				if(err !== null) {
					console.log(err);
				} else {
					process.exit();
				}
			},
			{
				encoding: 'utf8',
				timeout: 15000,
				maxBuffer: 1*1024,
				killSignal: 'SIGTERM',
				cwd: null,
				env: null
			}
		);
	}, 3000);
	*/
	
	res.send({ update : 'disabled' });
	res.end();
});

module.exports.router = router;