import { Cell,Room,Ship } from "../types";

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

export const isAllShipsKilled = (ships:Ship[]) => {
    return ships.every(ship => ship.killed);
}

export const getShipCells = (shipPosition: { x: number, y: number }, shipDirection: boolean, shipLength: number): { x: number, y: number }[] => {
    const occupiedCells = [];

    if (shipDirection) { 
        for (let i = shipPosition.y; i < shipPosition.y + shipLength; i++) {
            occupiedCells.push({ x: shipPosition.x, y: i });
        }
    } else { 
        for (let i = shipPosition.x; i < shipPosition.x + shipLength; i++) {
            occupiedCells.push({ x: i, y: shipPosition.y });
        }
    }

    return occupiedCells;
};

export const getSurroundCells = (shipPosition: { x: number, y: number }, shipDirection: boolean, shipLength: number): { x: number, y: number }[] => {
    const surroundCells: { x: number, y: number }[] = [];
    const occupiedCells = getShipCells(shipPosition, shipDirection, shipLength);
    for (const cell of occupiedCells) {
        for (let i = cell.x - 1; i <= cell.x + 1; i++) {
            for (let j = cell.y - 1; j <= cell.y + 1; j++) {
                if (!surroundCells.some(surroundCell => surroundCell.x === i && surroundCell.y === j)) {
                    surroundCells.push({ x: i, y: j });
                }
            }
        }
    }
   
    return surroundCells.filter(cell => !occupiedCells.some(occupiedCell => occupiedCell.x === cell.x && occupiedCell.y === cell.y));
}