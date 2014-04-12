var ardrone = require('ar-drone');
var client = ardrone.createClient({'frameRate': 30});

var dstream = require('dronestream');

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

	var lastmat;

	this.processMatrix = function(mat) {
		if(lastmat == undefined) lastmat = mat;

		mat.detectObject(cv.FACE_CASCADE,{},function(err, faces) {
			if(faces.length > 0) {
				var face = faces[0];

				mat.ellipse(face.x + face.width/2,face.y + face.height/2,face.width/2,face.height/2);

				var maxpower = 0.1;

				if(face.x < 320) client.left((320 - face.x)/320*maxpower);
				else client.right((face.x - 320)/320*maxpower);

				if(face.y < 180) client.up((180 - face.y)/180*maxpower);
				else client.down((face.y - 180)/180*maxpower);

				if(face.width < 150) client.front((150 - face.width)/150*maxpower);
				else client.back(Math.min(face.width - 150,150)/150*maxpower);
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

