var _ = require('underscore');
var RoomHandler = require('./RoomHandler');
var roomHandler = new RoomHandler(2);

users = [];
var User = function(userId, roomId = 0){
  // TOOO: Use forks or workers to handle different channels
    this.id = userId;
    this.number = 0;
    this.room = roomId;
    return this;
}

exports.User = User;

exports.listen = function(io){
  
  io.on('connection', function(socket) {
    console.log('New connection, creating new user');
    var user = new User(socket.id, 0);
    roomHandler.findRoom(user, (roomId)=>{
      console.log('New users playerNumber: '+ user.number);
      users.push(user);
      startingDirection = {
        'x': 20, 
        'y': 20
      }
      socket.emit('creationResponse', {'user':user, 'startingBallDirection': startingDirection});
      console.log(users);
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

function getOtherPlayerId(roomId, playerNumber){
  return _.find(users, user => user.room === roomId && user.number !== playerNumber).id;
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