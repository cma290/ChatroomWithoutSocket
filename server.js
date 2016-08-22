var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');

var recentMsgs = [];

app.use(express.static('public'));
app.use(bodyParser.json());
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.post('/api/upload-newmsg', function(req, res){
  if(recentMsgs.length == 10) {
    recentMsgs.shift();
  }
  recentMsgs.push(req.body);
  console.log(recentMsgs.length + " msg on server");
});

app.post('/api/msgs-since-last', function(req, res){
  var results = [];
  if(recentMsgs&&recentMsgs.length>0){
    for (var i = recentMsgs.length - 1; i >=0; --i){
      if (recentMsgs[i].time > req.body.time - req.body.interval) {
        results.push(recentMsgs[i]);
      } else {
        break;
      }
    }
  }
  res.send(results);
});

app.get('/api/history', function(req, res){
  res.send(recentMsgs);
})

// http.on('connection', function(socket){
// 	console.log('a user connected');
// 	socket.on('end', function(){
// 		console.log('user disconnected');
// 	})
// })

http.listen(3000, function(){
	console.log('listening on port : 3000');
});
 
/*
// Load the TCP Library
net = require('net');

// Keep track of the chat clients
var clients = [];

// Start a TCP Server
net.createServer(function (socket) {

  // Identify this client
  socket.name = socket.remoteAddress + ":" + socket.remotePort 

  // Put this new client in the list
  clients.push(socket);

  // Send a welcome message and announce
  socket.write("Welcome " + socket.name + "\n");
  broadcast(socket.name + " joined the chat\n", socket);

  // Handle incoming messages from clients.
  socket.on('data', function (data) {
    broadcast(socket.name + "> " + socket);
    // broadcast(socket.name + "> " + data, socket);
  });

  // Remove the client from the list when it leaves
  socket.on('end', function () {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + " left the chat.\n");
  });
  
  // Send a message to all clients
  function broadcast(message, sender) {
    clients.forEach(function (client) {
      // Don't want to send it to sender
      if (client === sender) return;
      client.write(message);
    });
    // Log it to the server output too
    process.stdout.write(message)
  }

}).listen(3000);

// Put a friendly message on the terminal of the server.
console.log("Chat server running at port 3000\n"); */