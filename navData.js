var ardrone = require('ar-drone');
var client = ardrone.createClient();
var countPitch = 0;
var countRoll = 0;
var correctionX = 0;
var correctionY = 0;
var pitchVal = 0;
var rollVal = 0;
// var xVel = 0;
// var yVel = 0;
var collect = true;
//client.on('navdata', console.log);
if(ardrone.demo){
client.on('navdata', function(datalog){
	// xVel = datalog.demo.xVelocity;
	// yVel = datalog.demo.yVelocity;
	if(collect){
		pitchVal = datalog.demo.rotation.pitch;
		rollVal = datalog.demo.rotation.roll;
	if(datalog.demo.altitude < .8) { //Altitude in meters
		client.up(1);
	}
	else if (datalog.demo.altitude > 1) {
		client.down(0.1);
	}
	else { // altitude between 0.5 and 1 meters
		client.up(0.1);
	}
	// if(xVel < -10) {
	// 	correctionX = .1; // Add to right, subtract from left
	// } else if (xVel > 10) {
	// 	correctionX = -.1;
	// }

	// if(yVel < -10) {
	// 	correctionY = .1; // Add to front, subtract from back
	// } else if (yVel > 10) {
	// 	correctionY = -.1;
	// }

	console.log(pitchVal + "   " + rollVal);
	var power = 0.1-countPitch*.01;
	var powerR = 0.1-countRoll*.01;
	// if(datalog.demo.rotation.yaw != 0) {
	// 	client.up(.5);
	// }
		if (power < 0){
			power = 0.1;
			countPitch = 0;
		}
		if (powerR < 0){
			powerR = 0.1;
			countRoll = 0;
		}
	if(pitchVal < -1) {
		client.back(power + .1 + correctionY);
		countPitch++;
	}
	else if(pitchVal > 1) {
		client.front(power - .1 - correctionY);
		countPitch++;
	}
	if(rollVal < -1) {
		client.right(powerR - .1 + correctionX);
		countRoll++;
	}
	else if(rollVal > 1) {
		client.left(powerR + .15 - correctionX);
		countRoll++;
	}}
	// collect = !collect;
});
}

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
