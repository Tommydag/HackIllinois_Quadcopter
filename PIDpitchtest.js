//PID PARAMETERS
//Pitch
var P_pitch = .8;
var I_pitch = .1;
var D_pitch = .1;
//Roll
var P_roll = .8;
var I_roll = .1;
var D_roll = .1;

//set desired pitch and roll values
var MV_pitch = 0;
var MV_roll = 0;

//VARIABLES: PID
//stores all pitch values
var total_pitch_error = 0;
var total_roll_error = 0;

//FUNCTIONS: PID
//Create error variables function: pitch and roll
function Error_PID(MV,PV){
	return MV-PV;}
//PID function
function PID(MV,pitch_c,roll_c,count){
	//P
	//calculate error from set pitch to current pitch
	var error_pitch_c=Error_PID(MV_pitch,pitch_c);
	var error_roll_c=Error_PID(MV_roll,roll_c);

	//I
	//Sum of previous pitches
	total_pitch_error=total_pitch_error+error_pitch_c;
	total_roll_error=total_roll_error+error_roll_c;

	//D
	//Change from previous pitch
	if(count==0){var error_pitch_p = error_pitch_c;}
	else{
	var delta_pitch_error=error_pitch_c-error_pitch_p;}
	if(count==0){var error_roll_p = error_roll_c;}
	else{
	var delta_roll_error=error_roll_c-error_roll_p;}

	//Compute MV
	MV_pitch_out=P_pitch*(error_pitch_c)+I_pitch*(total_pitch_error)+D_pitch*(delta_pitch_error);
	MV_roll_out=P_roll*(error_roll_c)+I_roll*(total_roll_error)+D_roll*(delta_roll_error);

	//sets current pitch_n to pitch_(n-1), current pitch to previous pitch
	error_pitch_p = error_pitch_c;
	error_roll_p = error_roll_c;

	//gives drone new pitch value
	client.front(-MV_pitch_out);
	client.right(-MV_roll_out);
	count++
}
	
//FLYING DRONE
//connect to drone
var ardrone = require('ar-drone');
var client = ardrone.createClient();
//Hovermode
var count = 0;
//begin hovermode
client.on('navdata', console.log);
if(ardrone.demo){
client.on('navdata', function(datalog){
	//Get values for current pitch, p
	var pitch_c = datalog.demo.rotation.pitch;
	var roll_c = datalong.demo.roation.roll;
	PID(MV,pitch_c,roll_c,count);
	
});}


//key control
var control = ardrone.createUdpControl();

var stdin = process.stdin;

var keypress = require('keypress');
keypress(process.stdin);
require('tty').setRawMode(true);

process.stdin.on('keypress',function(chunk,key) {
	if(key == '5' || chunk == 'x') client.stop();
	else if(chunk == 'c') {
		client.calibrate(0);
	}
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