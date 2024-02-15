import { WebSocket } from 'ws';
import { RequestWs } from '../types/index';
export const handleRequest = (ws: WebSocket, request: RequestWs) => {
  
    switch (request.type) {
        case "reg":
            handleRegistration(ws, request);
            break;
        default:
            console.error('Unknown request type:', request.type);
            break;
    }
}


export function handleRegistration(ws:WebSocket, request:RequestWs) {
    const {name} = JSON.parse(request.data)
    
    const responseData = {
        type: "reg",
        data: JSON.stringify({
            name,
            index: 1,
            error: false, 
            errorText: "" 
        }),
        id: 0
    };
    ws.send(JSON.stringify(responseData));
}