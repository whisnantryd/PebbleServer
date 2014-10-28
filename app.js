var fs = require('fs');
var errlog = './logs/error.log';

fs.exists(errlog, function(istrue) {
	if(istrue) {
		// delete the existing log
		fs.unlinkSync(errlog);
	}
});

function logErr(err) {
	var timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var msg = timestamp + ' >> ' + err.toString() + '\r\n';
	
	fs.appendFile(errlog, msg, function(err) {
		if(err == null)
			return;
			
		// couldn't write to file
	});
}

process.on('uncaughtException', function(err) {
	logErr('unhandled exception - ' + err);
});

logErr('initializing...');

var net = require('net');

var host = process.argv[2];
var port = process.argv[3];
var client = new net.Socket();
var recieved = "";

client.on('error', function(err) {
	logErr('client error - ' + err);
});

client.on('close', function() {
	// set reconnect timer
	setTimeout(connect, 120000);
});

client.on('data', function(data) {
	recieved += data.toString();
	
	if(recieved.slice(-1) == '\n' || recieved.slice(-1) == '\r'){
		var chunk = recieved;
		
		recieved = "";
		parse(chunk);
	}
});

client.on('connect', function() {
    // connected
});

function connect() {
    client.connect(port, host);
}

var hb;
var race;
var rs;

function Result() {
	this.pos = '';
	this.no = '';
	this.nm = '';
	this.lap = '';
	this.elp = '';
	this.bl = '';
	this.bt = '';
	this.lt = '';
	this.cls = -1;
}

function reset(){
	hb = {
		laps_remain : '---',
		time_remain : '---',
		time_ofday : '---',
		time_elapsed : '---',
		flag : '---'
	};

	race = {
		session : '---',
		track : {
			name : '---',
			length : '---'
		},
		classes : []
	};

	rs = {
		results : []
	};
}

reset();

function getResult(reg) {
	var obj = rs.results.filter(function(r) {
		return r.no == reg;
	});
	
	if(obj && obj.length == 1) {
		obj = obj[0];
	} else {
		obj = new Result();
		obj.no = reg;
		obj.pos = rs.results.length + 1;
		rs.results.push(obj);
	}
	
	return obj;
}

function parse(data) {
	var records = data.toString().replace(/\"|\r/g, '').split('\n');
	
	for(i=0;i < records.length;i++) {
		var rec = records[i].toString().split(',');

		if(rec.length > 1) {		
			switch(rec[0]) {
				case '$F':
					if((hb.flag == 'None' || hb.flag == '') && !(hb.flag == rec[5].trim()))
						rs.results = [];

					hb.laps_remain = parseInt(rec[1]);
					hb.time_remain = rec[2];
					hb.time_ofday = rec[3];
					hb.time_elapsed = rec[4];
					hb.flag = rec[5].trim();

					break;
				case '$A':
					var obj = getResult(rec[2]);
					
					var fname = rec[4].replace(/\*|\#/g, '');
					var lname = rec[5].replace(/\*|\#/g, '');
					
					obj.nm = rec[4].substring(0, 1) + '. ' + rec[5];
					obj.cls = parseInt(rec[7]);
					
					break;
				case '$G':
					var obj = getResult(rec[2]);
	
					obj.pos = isNaN(parseInt(rec[1])) ? 0 : parseInt(rec[1]);
					obj.lap = parseInt(rec[3]);
					obj.elp = rec[4].replace('00:', '');
					
					break;
				case '$H':
					var obj = getResult(rec[2]);
					
					obj.bl = parseInt(rec[3]);
					obj.bt = rec[4].replace('00:', '');
					
					break;
				case '$J':
					var obj = getResult(rec[1]);
					
					obj.lt = rec[2].replace('00:', '');
				
					break;
				case '$B':					
					race.session = rec[2].trim();	
					break;
				case '$C':
					if(race.classes.indexOf(rec[1]) == -1) {
						race.classes[rec[1]] = rec[2];
					}
					break;
				case '$E':
					if(rec[1] == 'TRACKNAME')
						race.track.name = rec[2].trim();
					else
						race.track.length = rec[2].trim();
					break;
				case '$I':
					reset();
					break;
			}
		}
	}
}

connect();

var app = require('express')();

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});

app.get('/', function(req, res){
	res.send({
		time : new Date().toJSON(),
		ver : '0.0.0.72'
	});
});

app.get('/runstate', function(req, res){
	res.send(hb);
});

app.get('/runinfo', function(req, res){
	res.send(race);
});

app.get('/results/:limit?', function(req, res){
	var limit = req.params.limit;
	
	if(limit) {
		var ret = rs.results.filter(function(r) {
			return (r.pos != "" && r.pos <= limit && r.pos > 0);
		});
		
		res.send({
			results : ret
		})
	} else {
		res.send(rs);
	}
});

app.listen(80, function(){
	logErr('server started');
});
