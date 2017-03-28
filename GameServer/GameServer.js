roomsHolder = [];
users = [];

module.exports = function(io){
    // Send updated data to rooms 
    // TOOO: Use forks or workers to handle different channels
    
    io.on('connection', function(socket) {
      console.log('Connection');
      findRoom((playerNumber, room)=>{
        console.log('PlayerNumber: '+playerNumber);
        var user = new User(socket.id, room.id, playerNumber);
        users.push(user);
        socket.emit('creationResponse', {'user':user, 'startingBallDirection': room.startingDirection})
      });

      socket.on('positionUpdate', function(clientData){
        otherPlayerSocket = getOtherPlayerId(clientData.user.room, clientData.user.playerNumber);
        io.to(otherPlayerSocket).emit('positionUpdate', clientData.position);
      });
        
      // TODO: handle room deletion and send info to client 
      socket.on('disconnect', function(socket){
          console.log('A user disconnected.');
      });
    });
}

 function findRoom(callback){
  console.log('Finding room');
  if(roomsHolder.length == 0){
    return createRoom(function(id){
      callback(1, roomsHolder.find(room => room.id == id));
    });
  }
  for(var room in roomsHolder){
    if(roomsHolder[room].players == 1){
      roomsHolder[room].players++;
      return callback(2, roomsHolder.find(room => room.id == id));
    }
  }
  return createRoom(function(id){
    callback(1,  roomsHolder.find(room => room.id == id)) ;
  });
}

function Room(id, startingDirection){
  this.id = id;
  this.players = 0;
  this.startingDirection = startingDirection;
}

function User(userId, roomId = 0, playerNumber){
  this.id = userId;
  this.playerNumber = playerNumber;
  this.room = roomId;
}

function createRoom(callback){
  console.log('Creating room');
  id = new Date().getTime();
  createRandomBallDirection(function(direction){
    var room = new Room(id, direction);
    roomsHolder.push(room);
    room.players++;
    callback(id);
  })
}

function getOtherPlayerId(roomId, playerNumber){
  for(userNumber in users){
    if(users[userNumber].room == roomId && users[userNumber].playerNumber !== playerNumber){
      return users[userNumber].id;
    }
  }
} 

// TODO: make something reusable for when ball is reset
// TODO: Check periodically to sync ball position
function createRandomBallDirection(callback){
    xDirection = Math.random() - 0.5;
    yDirection=  (Math.random() * (1 - 0.2) + 0.2);   
    yScale = Math.random() > 0.5 ? -1 : 1;
    if(xDirection > 0 ){
        xDirection = 1;
    }else{
        xDirection = -1;
    }
    callback({'x':xDirection, 'y': yDirection*yScale});
}