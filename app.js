var flog = require('./midware/filelogger.js');
var net = require('net');

var runstate = require('./routes/runstate.js');
var runinfo = require('./routes/runinfo.js');
var results = require('./routes/results.js');
var update = require('./routes/update.js');

var host = process.argv[2];
var port = process.argv[3];

var client = new net.Socket();
client.connected = false;
var recieved = "";

runstate.onNewFlag = results.reset;

client.on('error', function (err) {
	flog.log('client error - ' + err);
});

client.on('close', function () {
	setTimeout(connect, 10000);
	
	if(client.connected) {
		client.connected = false;
		flog.log('lost connection');
	}
});

client.on('data', function (data) {
	recieved += data.toString();

	var lastchar = recieved.slice(-1);

	if (lastchar == '\n' || lastchar == '\r') {
		var chunk = recieved;

		recieved = "";
		parse(chunk);
	}
});

client.on('connection', function () {
	client.connected = true;
	flog.log('connected to ' + host);
});

function connect() {
    client.connect(port, host);
}

function parse(data) {
	var records = data.toString().replace(/\"|\r/g, '').split('\n');

	var i = 0;

	for (i = 0; i < records.length; i++) {
		var rec = records[i].toString().split(',');

		if (rec.length > 1) {
			runstate.parse(rec);
			runinfo.parse(rec);
			results.parse(rec);
		}
	}
}

connect();

var app = require('express')();

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
});

app.get('/', function (req, res) {
	res.send({
		time: new Date().toJSON(),
		ver: '0.0.1.8'
	});
});

app.get('/race', function (req, res) {
	res.send({
		status: "null"
	});
});

app.get('/restart', function(req, res) {
	if(client.connected == false) {
		connect();
		
		res.send({
			status: "connecting..."
		});
	} else {
		res.send({
			status: "running"
		});
	}
});

app.use('/runstate', runstate.router);
app.use('/runinfo', runinfo.router);
app.use('/results', results.router);
app.use('/update', update.router);

app.listen(80, function () {
	flog.log('server started');
});
