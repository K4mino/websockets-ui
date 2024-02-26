import { httpServer } from "./src/http_server/index.js";
import { WebSocketServer } from 'ws';
import { handleRequest } from "./src/http_server/controllers/index.js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: 3000 });



wss.on('connection', function connection(ws) {
  console.log('WebSocket URL:', wss.address());
  ws.on('error', console.error);

  ws.on('message', function message(msg) {
    try {
        console.log('received: %s', msg.toString());
        const request = JSON.parse(msg.toString());
        handleRequest(ws, request);
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }
  });

});

wss.on('close', () => {
  console.log('WebSocket connection closed.');
});