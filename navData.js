var ardrone = require('ar-drone');
var client = ardrone.createClient();
client.on('navdata', console.log);