var ardrone = require('ar-drone');
var client = ardrone.createClient({'frameRate': 10});

var http = require('http');
var fs = require('fs');

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

	this.setImage = function(_image) {
		image = _image;
	};

	return this;
})();

server.server.listen(7000);

client.config('video:video_channel',3);
var pngstream = client.getPngStream();
pngstream.on('data',function(data) { server.setImage(data); });

