var ardrone = require('ar-drone');
var client = ardrone.createClient({'frameRate': 5});
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
		client.down(0.1);
	} else if(chunk == '0') {
		console.log('landing');
		client.land();
	} else if(chunk == '.') {
		console.log('taking off');
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

var http = require('http');
var fs = require('fs');

var cv = require('opencv');

var server = (function() {
	var image;

	this.server = http.createServer(function(request, response) {
		if(request.url == "/") {
			response.writeHead(200, {"Content-Type": "text/html"});
			fs.readFile("index.html","utf8",function(err,data) {
				if(err) console.log(err);
				response.end(data);
			});
		} else if(/[^?]+/.exec(request.url)[0] == "/camera.png") {
			response.writeHead(200, {"Content-Type": "image/png"});
			response.end(image);
		} else console.log("no handler for '" + request.url + "'");
	});

	this.processMatrix = function(mat) {
		mat.detectObject(cv.FACE_CASCADE,{},function(err, faces) {
			if(faces.length > 0) {
				var face = faces[0];

				mat.ellipse(face.x + face.width/2,face.y + face.height/2,face.width/2,face.height/2);

				var maxpower = 0.1;

				control.pcmd({
					'front': Math.max(50 - face.width,-50)/50*maxpower,
					'left': 0,
					'up': (180 - face.y)/180*maxpower,
					'counterclockwise': (320 - face.x)/320*maxpower
				});
				control.flush();
			}

			image = mat.toBuffer();
		});
	};

	return this;
})();

server.server.listen(7000);

var imstream = new cv.ImageStream();
imstream.on('data',server.processMatrix);

client.config('video:video_channel',0);
client.getPngStream().pipe(imstream);

