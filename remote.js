var http = require('http');
var static = require('node-static');
var file = new(static.Server)('.');

// Connection handler
var clientCount = 0;
var tcpClients = [];

function AddTcpClient(c) {
  c.uniqueId = clientCount;
  c.opStatus = 'active';
  clientCount++;
  tcpClients.push(c);
  console.log('TCP client connected, assigned ID:',c.uniqueId);
}

function removeTcpClient(c) {
  for (i in tcpClients) {
    var client = tcpClients[i];
    if (client.uniqueId === c.uniqueId) {
      var removed = tcpClients.splice(i,1);
      console.log('Removing TCP client ID:',client.uniqueId);
    }
  }
}

// HTTP static files.
var httpPort = 1337;
var serv = http.createServer(function (req, res) {
    console.log('Processing a HTTP request',req.method,req.url);
    req.addListener('end', function () {
    // Serve files!
        file.serve(req, res);
    });
    console.log('Returning a HTTP response',res.statusCode);
}).listen(httpPort);
console.log('HTTP Server on ',httpPort);

// Socket.io
var io = require('socket.io').listen(serv);
console.log('socket.io running`');
io.sockets.on('connection', function(socket) {
  socket.on('button',function(data) {
    console.log('socket.io event: button',data);
    for (socket in tcpClients) {
      var id = tcpClients[socket].uniqueId;
      console.log('Writing data to TCP client ID:',id,' data:',data);
      tcpClients[socket].write(JSON.stringify(data));
    }
  });
});

// TCP Server
var net = require('net'),
  tcpPort = 8124;
var server = net.createServer(function(c) { //'connection' listener
  c.on('end', function() {
    console.log('TCP client ID:',c.uniqueId,'disconnected');
    removeTcpClient(c);
  });
  AddTcpClient(c);
}).listen(tcpPort, function() { //'listening' listener
  console.log('TCP Server on 8124');
});
