import { User, Room } from "./types"
import { WebSocket } from 'ws';

export const db ={
    users: <User[]>[],
    rooms: <Room[]>[],
}

export const sockets = new Map<WebSocket, string>()