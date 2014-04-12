var ardrone = require('ar-drone');
var client = ardrone.createClient({'frameRate': 5});

var stdin = process.stdin;

var keypress = require('keypress');
keypress(process.stdin);
require('tty').setRawMode(true);

var lowerhue = 100;
var upperhue = 130;

process.stdin.on('keypress',function(chunk,key) {
	if(chunk == 'q') {
		process.kill();
	} else if(chunk == '0') {
		client.land();
	} else if(chunk == '.') {
		client.takeoff();
	} else if(chunk == 'i') lower++;
	else if(chunk == 'k') lower--;
	else if(chunk == 'o') upper++;
	else if(chunk == 'l') upper--;

	console.log('lower = ' + lower + ', upper = ' + upper);
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
		var track_mat = mat.copy();

		track_mat.convertHSVscale();
		track_mat.convertGrayscale();
		track_mat.inRange([lowerhue],[upperhue]);

		contours = track_mat.findContours();
		var maxarea = 0, maxi = 0;
		for(var i = 0; i < contours.size(); i++) {
			if(contours.moments(i).m00 > maxarea) {
				maxarea = contours.moments(i).m00;
				maxi = i;
			}
		}

		if(contours.size() > 0) {
			var moments = contours.moments(maxi);
			var centerx = moments.m10/moments.m00;
			var centery = moments.m01/moments.m00;
			mat.drawContour(contours,maxi,[0,255,0]);
			mat.line([centerx - 5,centery],[centerx + 5,centery]);
			mat.line([centerx,centery - 5],[centerx,centery + 5]);
		}

		image = mat.toBuffer();
	};

	return this;
})();

server.server.listen(7000);

var imstream = new cv.ImageStream();
imstream.on('data',server.processMatrix);

client.config('video:video_channel',3);
client.getPngStream().pipe(imstream);

