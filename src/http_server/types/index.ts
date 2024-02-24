import { WebSocket } from 'ws';
export type RequestWs = {
    type: string,
    data: {
        name?: string,
        index?: number,
        error?: boolean,
        errorText?: string
    },
    id: number
}

type Ship = {
    position:{
        x: number,
        y: number
    },
    direction:boolean,
    length:number,
    type:"small"|"medium"|"large"|"huge"
}

export type User = {
    index:string,
    name: string,
    password?: string,
    ships?:Ship[],
    ready?:boolean
}

export type Socket = {
    ws:string | undefined
}

type  RoomSession = {
    ws:WebSocket
}

export type Room = {
    roomId:string,
    roomUsers:User[],
    sessions:WebSocket[]
}