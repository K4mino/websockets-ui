import { WebSocket } from 'ws';
export type RequestWs = {
    type: string,
    data: string,
    id: number
}

export type Ship = {
    position:{
        x: number,
        y: number
    },
    direction:boolean,
    length:number,
    type:"small"|"medium"|"large"|"huge",
    hits?:number,
    killed?:boolean
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

export type Room = {
    roomId:string,
    roomUsers:User[],
    sessions:WebSocket[]
}

export type Cell = {
    x:number,
    y:number
}

export type CustomRequestWs = {
    type: string,
    data:string,
    id: number
}