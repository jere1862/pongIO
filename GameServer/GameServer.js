roomsHolder = [];
users = [];

module.exports = function(io){
  
    // Send updated data to rooms 
    // TOOO: Use forks or workers to handle different channels
    updateClients(io);
    
    io.on('connection', function(socket) {
        findRoom((playerNumber, roomId)=>{
        var user = new User(socket.id, roomId, playerNumber);
        users.push(user);
        socket.emit('creationResponse', user)
        });
    });

    io.on('disconnect', function(socket){
        console.log('A user disconnected.');
    })
}

 function findRoom(callback){
  for(var room in roomsHolder){
    if(roomsHolder[room].players < 2){
      roomsHolder[room].players++;
      return callback(2, roomsHolder[room].id);
    }
  }
  createRoom(function(id){
    return callback(1, id);
  });
}

function Room(id){
  this.id = id;
  this.players = 0;
}

function User(userId, roomId = 0, playerNumber){
  this.id = userId;
  this.playerNumber = playerNumber;
  this.room = roomId;
}

function createRoom(callback){
  id = new Date().getTime();
  var room = new Room(id);
  roomsHolder.push(room);
  room.players++;
  return callback(id);
}

function updateClients(io){
   setInterval(function() {
    var sockets = Object.keys(io.sockets.sockets);
    for(socketId in sockets){
      //io.to(sockets[socketId]).emit('update', {x:  });
    }
  }, 10 );
}