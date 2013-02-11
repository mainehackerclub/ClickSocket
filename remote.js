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
  //console.log('AddTcpClients: ',tcpClients);
}

function removeTcpClient(c) {
  for (i in tcpClients) {
    var client = tcpClients[i];
    if (client.uniqueId === c.uniqueId) {
      var removed = tcpClients.splice(i,1);
      //console.log('removed client ',client.uniqueId);
    }
  }
}

// HTTP static files.
var httpPort = 1337;
var serv = http.createServer(function (req, res) {
    console.log('A Connection!');
    req.addListener('end', function () {
    // Serve files!
        file.serve(req, res);
    });
}).listen(httpPort);
console.log('HTTP Server on ',httpPort);

// Socket.io
var io = require('socket.io').listen(serv);
console.log('socket.io running`');
io.sockets.on('connection', function(socket) {
  socket.on('button',function(data) {
    console.log('button',data);
    for (socket in tcpClients) {
      console.log('socket ',socket);
      console.log('data',data);
      tcpClients[socket].write(JSON.stringify(data));
    }
  });
});

// TCP Server
var net = require('net'),
  tcpPort = 8124;
var server = net.createServer(function(c) { //'connection' listener
  console.log('client connected');
  c.on('end', function() {
    console.log('client disconnected',c.uniqueId);
    removeTcpClient(c);
  });
  AddTcpClient(c);
}).listen(tcpPort, function() { //'listening' listener
  console.log('TCP Server on 8124');
});
