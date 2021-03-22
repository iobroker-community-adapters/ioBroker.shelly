const { CoIoTServer, CoIoTClient } = require('coiot-coap');

// Listen to ALL messages in your network
const server = new CoIoTServer();

server.on('status', (status) => console.log(status));
setTimeout(async () => await server.listen(), 0);

// Query devices directly
/*
const client = new CoIoTClient({ host: '192.168.25.116' });
setTimeout(async () => {
    const status = await client.getStatus();
    const description = await client.getDescription();
}, 0);
*/
