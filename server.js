var express = require('express'),
	app 	= express(),
	server 	= require('http').createServer(app),
	io 		= require('socket.io').listen(server);

server.listen(1337);

// sending static files
app.use('/public', express.static(__dirname + '/public'));

// routes
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

// socket.io events
io.sockets.on('connection', function(socket) {
	socket.on('mousemove', function(data) {
		socket.broadcast.emit('moving', data);
	});
});