import { WebSocket } from 'ws';
export type RequestWs = {
    type: string,
    data: {
        indexRoom?: string,
        name?: string,
        index?: number,
        error?: boolean,
        errorText?: string
    },
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
    hits?:number
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
    data: {
        x: number,
        y: number
        currentPlayer: string
    },
    id: number
}