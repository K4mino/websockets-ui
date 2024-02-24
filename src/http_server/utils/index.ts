import { Cell,Room } from "../types";

export const getSurroundCells =(shipPosition: { x: number, y: number }, shipDirection: boolean, shipLength: number) => {
    const cells = [];
    for (let i = 0; i < shipLength; i++) {
        if (shipDirection) {
            cells.push({ x: shipPosition.x + i, y: shipPosition.y });
        } else {
            cells.push({ x: shipPosition.x, y: shipPosition.y + i });
        }
    }
    return cells
}


export const attackSurroundCells = (cells:Cell[],userId:string,room:Room) => {
    for(const cell of cells){
        for(const socket of room.sessions){
            socket.send(
                JSON.stringify({
                    type: "attack",
                    data: JSON.stringify({
                        position:{
                            x:cell.x,
                            y:cell.y
                        },
                        currentPlayer: userId
                    }),
                    id: 0,
                })
            )
        }
    }
}