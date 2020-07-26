const dgram = require('dgram');
const server = dgram.createSocket('udp4');

let PORT = 5683;
let HOST; //  = '127.0.0.1';

server.on('listening', () => {
    let address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);

    server.setMulticastLoopback(true);
    server.addMembership('224.0.1.187');
});

server.on('message', (message, remote) => {
    let  today = new Date();
    console.log(today.toISOString() + ' - ' + remote.address + ':' + remote.port + ' - ' + message.toString('ascii'));
});

server.bind(PORT, HOST);

