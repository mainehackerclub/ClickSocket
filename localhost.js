var net = require('net'),
  remoteHost = 'localhost',
  tcpPort = 8124;
var client = net.connect(
  {host:remoteHost,port:tcpPort},
  function() {//'connect' listener
    console.log('client connected');
});

client.on('data', function(data) {
  console.log('data.toString()',data.toString());
  var pData = JSON.parse(data.toString());
  console.log('pData.id',pData.id);
  console.log('pData.intensity',pData.intensity);
});
client.on('end',function() {
  console.log('client disconnected');
});
