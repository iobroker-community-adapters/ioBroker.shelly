var PORT = 5683;
var HOST; // = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);

    server.setMulticastLoopback(true);
    server.addMembership('224.0.1.187');
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message.toString('ascii'));
});
console.log(HOST);
server.bind(PORT, HOST);

