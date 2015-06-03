// filelogger.js
var fs = require('fs');
var errlog = './logs/error.log';

fs.truncate(errlog, 0, function() {
	logErr("init...");
});

var logErr = function(err) {
	var timestamp = new Date().toISOString().replace(/T|\..+/g, ' ');
	var msg = timestamp + ' >> ' + err.toString() + '\r\n';
	
	fs.appendFile(errlog, msg, function(err) {
		if(err == null)
			return;
			
		// couldn't write to file
		console.log(err);
	});
};

module.exports.log = logErr;

