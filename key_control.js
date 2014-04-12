var ardrone = require('ar-drone');
var client = ardrone.createClient();

var stdin = process.stdin;

var keypress = require('keypress');
keypress(process.stdin);
require('tty').setRawMode(true);

process.stdin.on('keypress',function(chunk,key) {
	if(key == '5') client.stop();
	else if(chunk == '4') {
		client.stop();
		client.left(0.1);
	} else if(chunk == '6') {
		client.stop();
		client.right(0.1);
	} else if(chunk == '8') {
		client.stop();
		client.front(0.1);
	} else if(chunk == '2') {
		client.stop();
		client.back(0.1);
	} else if(chunk == '+') {
		client.stop();
		client.up(0.1);
	} else if(chunk == '-') {
		client.stop();
		client.down(0.1);
	} else if(chunk == '0') {
		client.land();
	} else if(chunk == '.') {
		client.takeoff();
	} else if(chunk == 'q') {
		client.stop();
		process.kill();
	} else if(chunk == 'f') {
		client.stop();
		client.animate('flipAhead',1000);
	}
});

