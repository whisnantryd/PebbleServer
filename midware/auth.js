// auth.js
var express = require('express');
var router = new express.Router();
var users = require('../users.js');

function unauthorized(res) {
	res.statusCode = 401;
	res.setHeader('WWW-Authenticate', 'Basic realm="Authorization Required"');
	res.end('Unauthorized');
};

module.exports = function(req, res, next) {
	if(!req.headers.authorization)
		return unauthorized(res);

	var authhead = req.headers.authorization;
	var parts = authhead.split(' ');

    if (parts.length !== 2) return unauthorized(res);

    var scheme = parts[0];
	var credentials = new Buffer(parts[1], 'base64').toString();
	var index = credentials.indexOf(':');

    if (scheme != 'Basic' || index < 0)
		return unauthorized(res);

    var user = credentials.slice(0, index)
    var pass = credentials.slice(index + 1);
	
	var authuser = users[user];
	
	if(authuser && authuser.pass == pass && authuser.auth)
		next();
	else
		unauthorized(res);
}