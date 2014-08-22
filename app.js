var fs = require('fs');

function logErr(err) {
	var timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	var msg = timestamp + ' >> ' + err.toString() + '\r\n+-------------';
	
	fs.writeFile("/logs/error.log", msg + , function(err) {
		//couldn't write to file
	});
}

process.on('uncaughtException', function(err) {
	logErr('Unhandled exception - ' + err);
});

var net = require('net');

var host = process.argv[2];
var port = process.argv[3];
var client = new net.Socket();

client.on('error', function(err){
	logErr('Client error - ' + err);
});

client.on('close', function(){
    //console.log('closed');
	logErr('Connection closed');
	setTimeout(connect, 60000);
});

client.on('data', function(data){
	parse(data);
});

client.on('connect', function(){
    //console.log('connected');
});

function connect(){
    //console.log('connecting to ' + host + ' on port ' + port + '...');
    client.connect(port, host);
}

Array.prototype.Having = function (key, val) {
	var arr = this;

	if (arr == undefined)
		return;

    var ret = [];

	for (rrrr = 0; rrrr < arr.length; rrrr++) {
		var obj = arr[rrrr];

		if (obj != undefined && obj[key] == val) {
			ret.push(obj);
		}
	}

    return ret;
}

var hb;
var race;
var rs;

function Result() {
	this.pos = '';
	this.no = '';
	this.lap = '';
	this.elp = '';
	this.bl = '';
	this.bt = '';
	this.lt = '';
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
		}
	};

	rs = {
		results : []
	};
}

reset();

function getResult(reg){
	var obj = rs.results.Having('no', reg);

	if(obj && obj.length == 1)
		obj = obj[0];
	else{
		obj = new Result();
		obj.no = reg;
		rs.results.push(obj);
	}
	
	return obj;
}

function parse(data) {
	var records = data.toString().replace(/\"/g, '').replace(/\r/g, '').split('\n');
	//.replace(/\"/g, '')
	//.replace(/\r/g)
	
	for(i=0;i < records.length;i++) {
		var rec = records[i].toString().split(',');

		if(rec.length > 1) {		
			switch(rec[0]) {
				case '$F':
					if((hb.flag == 'None' || hb.flag == '') && hb.flag != rec[5].trim())
						rs.results = [];

					hb.laps_remain = parseInt(rec[1]);
					hb.time_remain = rec[2];
					hb.time_ofday = rec[3];
					hb.time_elapsed = rec[4];
					hb.flag = rec[5].trim();

					break;
				case '$G':
					var obj = getResult(rec[2]);
	
					obj.pos = parseInt(rec[1]);
					obj.lap = parseInt(rec[3]);
					obj.elp = rec[4];
					
					break;
				case '$H':
					var obj = getResult(rec[2]);
					
					obj.bl = parseInt(rec[3]);
					obj.bt = rec[4];
					
					break;
				case '$J':
					var obj = getResult(rec[1]);
					
					obj.lt = rec[2]
				
					break;
				case '$B':					
					race.session = rec[2].trim();	
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

app.get('/', function(req, res){
	res.send({
		time : new Date().toJSON(),
		ver : '0.0.0.21'
	});
});

app.get('/runstate', function(req, res){
	res.send(hb);
});

app.get('/runinfo', function(req, res){
	res.send(race);
});

app.get('/results', function(req, res){
	res.send(rs);
});

app.listen(80, function(){
	//console.log('server started');
});
