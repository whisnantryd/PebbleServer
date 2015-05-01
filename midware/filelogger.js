// filelogger.js
var fs = require('fs');
var errlog = '/logs/error.log';

fs.exists(errlog, function(istrue) {
	if(istrue) {
		// delete the existing log
		fs.unlinkSync(errlog);
	}
});

fs.mkdir('/logs/' ,function(e) {
    if(!e || (e && e.code === 'EEXIST')) {
        //do something with contents
    } else {
        //debug
        //console.log(e);
    }
});

var logErr = function(err) {
	var timestamp = new Date().toISOString().replace(/T|\..+/g, ' ');
	var msg = timestamp + ' >> ' + err.toString() + '\r\n';
	
	fs.appendFile(errlog, msg, function(err) {
		if(err == null)
			return;
			
		// couldn't write to file
		//console.log(err);
	});
}

logErr('initializing...');

module.exports.log = logErr;

