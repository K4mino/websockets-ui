import { WebSocket } from "ws";
import { RequestWs,Room, User,CustomRequestWs } from "../types/index";
import crypto from "crypto";
import { db, sockets } from "../db";
import { attackSurroundCells, getSurroundCells, isHit } from "../utils";
export const handleRequest = (ws: WebSocket, request: RequestWs) => {
  switch (request.type) {
    case "reg":
      handleRegistration(ws, request);
      break;
    case "create_room":
      handleCreateRoom(ws, request);
      break;
    case "add_user_to_room":
      handleAddUserToRoom(ws, request);
      break;
    case "add_ships":
      handleAddShips(ws, request);
      break;
    case "attack":
      handleTurn(ws, request);
      break;
    case "randomAttack":
      handleRandomAttack(ws, request);
    default:
      console.error("Unknown request type:", request.type);
      break;
  }
};

function handleRegistration(ws: WebSocket, request: RequestWs) {
  if (typeof request.data === "string") {
    const { name, password } = JSON.parse(request.data);
    const index = crypto.randomUUID();
    sockets.set(ws, index);

    const responseData = {
      type: "reg",
      data: JSON.stringify({
        name,
        index,
        error: false,
        errorText: "",
      }),
      id: 0,
    };

    ws.send(JSON.stringify(responseData));

    db.users.push({
      index,
      name,
      password,
    });
    for (const socket of sockets.keys()) {
      socket.send(
        JSON.stringify({
          type: "update_room",
          data: JSON.stringify(db.rooms),
          id: 0,
        })
      );
      socket.send(
        JSON.stringify({
          type: "update_winners",
          data: JSON.stringify([]),
          id: 0,
        })
      );
    }
  }
}

function handleCreateRoom(ws: WebSocket, request: RequestWs) {
  const roomId = crypto.randomUUID();

  for(const socket of sockets.keys()) {
    socket.send(
        JSON.stringify({
          type: "update_room",
          data: JSON.stringify([
            {
              roomId,
              roomUsers: [],
            },
          ]),
          id: 0,
        })
      );
  }

  db.rooms.push({
    roomId,
    roomUsers: [],
    sessions: [],
  });
}

function handleAddUserToRoom(ws: WebSocket, request: RequestWs) {
  const userId = sockets.get(ws);
  const { indexRoom } =  JSON.parse(request.data);
  const { index, name } = db.users?.find((user) => user.index === userId);

  const room = db.rooms.find(
    (room: { roomId: string }) => room.roomId === indexRoom
  );
  const userInRoom = room?.roomUsers.find(
    (user: User) => user.index === userId
  );

  if (userInRoom) {
    return;
  }

  if (!room) {
    return;
  }

  room.roomUsers.push({
    name,
    index
  });

  room.sessions.push(ws)
  console.log('rooms',db.rooms)
  for(const socket of sockets.keys()) {
    socket.send(
      JSON.stringify({
        type: "update_room",
        data: JSON.stringify(db.rooms),
        id: 0,
      })
    );
  }

  if (room.roomUsers.length === 2) {
    handleCreateGame(room,ws);
  }
}

function handleCreateGame( room: Room,ws: WebSocket) {
  //const userId = sockets.get(ws);

  for (const socket of room.sessions) {
    const userId = sockets.get(socket);
    socket.send(
      JSON.stringify({
        type: "create_game",
        data: JSON.stringify({
          idGame:room.roomId,
          idPlayer: userId,
        }),
        id: 0,
      })
    );
  }
}


function handleAddShips(ws: WebSocket, request: RequestWs) {
  const userId = sockets.get(ws);
  const reqData = JSON.parse(request.data);
  const user = db.users.find((user) => user.index === userId);
  const reqShips = reqData.ships;
  
  if(user) {
    user.ships = reqShips
  }

  const room = db.rooms.find((room) => room.roomUsers.some((user) => user.index === userId));
  if (!room) {
    return; 
  }

  const userInRoom = room.roomUsers.find((user) => user.index === userId);
  if(userInRoom){
    userInRoom.ready = true;
  }

  const allPlayersReady = room.roomUsers.every((user) => user.ready);

  if (allPlayersReady && userId) {
    handleStartGame(room,userId);
  }
}

function handleStartGame(room: Room, secondUserId:string) {
  for (const socket of room.sessions) {
    const userId = sockets.get(socket);
    const user = db.users.find((user) => user.index === userId);
    socket.send(
      JSON.stringify({
        type: "start_game",
        data: JSON.stringify({
          ships: user?.ships,
          currentPlayerIndex: secondUserId
        }),
        id: 0,
      })
    );

    socket.send(JSON.stringify(
      {
        type: "turn",
        data:
            {
                currentPlayer: userId, 
            },
        id: 0,
    }
    ))
  }
}


function handleTurn(ws: WebSocket, request: RequestWs | CustomRequestWs) {
  const { indexPlayer,x,y,gameId } = JSON.parse(request.data);
  const room = db.rooms.find((room) => room.roomId === gameId);
  const opponentUser = room?.roomUsers.find(user => user.index !== indexPlayer);
  const opponentData = db.users.find(user => user.index === opponentUser?.index);
  const hitShip =  isHit(x,y,opponentData.ships);

  if(hitShip){
    
    hitShip.hits = hitShip.hits ? hitShip.hits + 1 : 1;
    if(hitShip.hits == hitShip.length){

      const cells = getSurroundCells(hitShip.position, hitShip.direction, hitShip.length);

      attackSurroundCells(cells,indexPlayer,room);

      for(const socket of room?.sessions){
        socket.send(
          JSON.stringify({
            type: "attack",
            data: JSON.stringify({
              position:{
                x,
                y
              },
              currentPlayer: indexPlayer,
              status:"killed"
            }),
            id: 0,
          })
        );
      }

    }

    for(const socket of room?.sessions){
      socket.send(
        JSON.stringify({
          type: "attack",
          data: JSON.stringify({
            position:{
              x,
              y
            },
            currentPlayer: indexPlayer,
            status:"shot"
          }),
          id: 0,
        })
      );

      socket.send(JSON.stringify(
        {
          type: "turn",
          data:JSON.stringify({
          currentPlayer: indexPlayer,
          }),
          id:0
        }
      ))
    }
  }else{
    console.log('MISS')
    for(const socket of room?.sessions){
      socket.send(
        JSON.stringify({
          type: "attack",
          data: JSON.stringify({
            position:{
              x,
              y
            },
            currentPlayer:indexPlayer,
            status:"miss"
          }),
          id: 0,
        })
      );

      socket.send(JSON.stringify(
        {
          type: "turn",
          data:JSON.stringify({
          currentPlayer: opponentUser?.index,
          }),
          id:0
        }
      ))
    }
  }
}


function handleRandomAttack(ws:WebSocket,request:RequestWs){
  console.log(JSON.parse(request.data));
  const {indexPlayer,gameId} = JSON.parse(request.data);
  const randomXCell = Math.floor(Math.random() * 10);
  const randomYCell = Math.floor(Math.random() * 10);
  const room = db.rooms.find((room) => room.roomId === gameId);
  const opponentUser = room?.roomUsers.find(user => user.index !== indexPlayer);
  
  handleTurn(ws, {
    type: "attack",
    data: JSON.stringify({
      gameId,
      x:randomXCell,
      y:randomYCell,
      indexPlayer
    }),
    id: 0
  })
}