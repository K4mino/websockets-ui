import { Cell,Room,Ship } from "../types";

export const getSurroundCells = (shipPosition: { x: number, y: number }, shipDirection: boolean, shipLength: number) => {
    const cells = [];

    for (let i = -1; i <= shipLength; i++) {
        if (shipDirection && i !== 0) {
            cells.push({ x: shipPosition.x - 1, y: shipPosition.y + i });
            cells.push({ x: shipPosition.x, y: shipPosition.y + i });
            cells.push({ x: shipPosition.x + 1, y: shipPosition.y + i });
        } 
        
        if(!shipDirection && i !== 0) {
            cells.push({ x: shipPosition.x + i, y: shipPosition.y - 1 });
            cells.push({ x: shipPosition.x + i, y: shipPosition.y });
            cells.push({ x: shipPosition.x + i, y: shipPosition.y + 1 });
        }
    }

    return cells.filter((cell, index, self) =>
        index === self.findIndex((t) => (
            t.x === cell.x && t.y === cell.y
        ))
    );
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
                        currentPlayer: userId,
                        status:"miss"
                    }),
                    id: 0,
                })
            )
        }
    }
}


export const isHit = (x:number,y:number,ships:Ship[]) =>{
    const hitShip = ships.find(ship =>(
        (ship.direction && ship.position.x === x && y >= ship.position.y && y < ship.position.y + ship.length) 
        ||
        (!ship.direction && ship.position.y === y && x >= ship.position.x && x < ship.position.x + ship.length)
    ));


    return hitShip
}