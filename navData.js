var ardrone = require('ar-drone');
var client = ardrone.createClient();
var countPitch = 0;
var countRoll = 0;
var collect = true;
client.on('navdata', function(datalog){
	var pitchVal = datalog.demo.rotation.pitch;
	var rollVal = datalog.demo.rotation.roll;
	if(collect){
	console.log(pitchVal + "   " + rollVal);
	var power = 0.1-countPitch*.01;
	var powerR = 0.1-countRoll*.01;
	if(datalog.demo.rotation.yaw != 0) {
		client.up(.5);
	}
		if (power < 0){
			power = 0.1;
			countPitch = 0;
		}
		if (powerR < 0){
			powerR = 0.1;
			countRoll = 0;
		}
	if(pitchVal < -1) {
		client.back(power + .15);
		countPitch++;
	}
	else if(pitchVal > 1) {
		client.front(power - .1);
		countPitch++;
	}
	if(rollVal < -1) {
		client.right(powerR - .1);
		countRoll++;
	}
	else if(rollVal > 1) {
		client.left(powerR + .1);
		countRoll++;
	}}
	collect = !collect;
});
var control = ardrone.createUdpControl();

var stdin = process.stdin;

var keypress = require('keypress');
keypress(process.stdin);
require('tty').setRawMode(true);

process.stdin.on('keypress',function(chunk,key) {
	if(key == '5' || chunk == 'x') client.stop();
	else if(chunk == '4' || chunk == 'a') {
		client.stop();
		client.left(0.1);
	} else if(chunk == '6' || chunk == 'd') {
		client.stop();
		client.right(0.1);
	} else if(chunk == '8' || chunk == 'w') {
		client.stop();
		client.front(0.1);
	} else if(chunk == '2' || chunk == 's') {
		client.stop();
		client.back(0.1);
	} else if(chunk == '+' || chunk == 'j') {
		client.stop();
		client.up(1);
	} else if(chunk == '-' || chunk == 'k') {
		client.stop();
		client.down(0.2);
	} else if(chunk == '0' || chunk == 'i') {
		client.land();
	} else if(chunk == '.' || chunk == '.') {
		client.takeoff();
	} else if(chunk == 'q') {
		client.stop();
		process.kill();
	} else if(chunk == 'f') {
		client.stop();
		client.animate('flipAhead',15);
	}
	else if(chunk == 'y') {
		client.land();
		control.ref({fly: true, emergency: true});
	}
});
