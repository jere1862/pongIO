var _ = require('underscore');
var RoomHandler = require('./RoomHandler');
var Communication = require('./Communication');

users = [];
var roomHandler;

var User = function(userId, roomId = 0){
    this.id = userId;
    this.number = 0;
    this.room = roomId;
    this.ready = false;
    this.lastBallPosition;

    this.setNumber = function(number){
      this.number = number;
    }
    return this;
}

exports.User = User;

exports.start = function(io){
  initiateConnectonToClient(io, function(socket){
    Communication.onPositionUpdate(socket, function(clientData){
      var otherPlayer = getOtherPlayer(clientData.user);
      if(typeof otherPlayer != 'undefined'){
        var message = {
          'name': 'positionUpdate',
          'content': clientData.position
        }
        Communication.toClient(otherPlayer.id, message);
      }
    });
  });
}

function initiateConnectonToClient(io, callback){
  roomHandler = new RoomHandler(2);
  Communication.initiate(io, function(socket){
        var user = new User(socket.id, 0);
        roomHandler.findRoom(user, (room)=>{
          user.setNumber(room.users.length);
          user.room = room.id;
          users.push(user);
          startingDirection = {
            'x': 20, 
            'y': 20
          }
          var message = {
            'name': 'creationResponse',
            'content': {'user':user, 'startingBallDirection': startingDirection}
          }
          onBallPosition(socket, room, function(data){
            setBallPosition(user);
          });
          Communication.toClient(socket.id, message)
          Communication.onReady(socket, function(){
            user.ready = true;
            var otherPlayer = getOtherPlayer(user);
            if(typeof otherPlayer != 'undefined'){
              if(otherPlayer.ready){
                startGame(user.id);
                startGame(otherPlayer.id);
              }
            }
          });
      });
    callback(socket);
  });
}

function getUserFromId(id, room){
  return _.findWhere(room.users, {id: id});
}

// TODO: Change to only look in a given user's room
function getOtherPlayer(user){
  var room = _.findWhere(roomHandler.rooms, {id: user.room});
  if(room.spaceRemaining()){
    return undefined;
  }
  return _.find(room.users, u => u.number !== user.number);
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

function startGame(userId){
  var message = {
    "name": "start" 
  }
  Communication.toClient(userId, message);
}

function onBallPosition(socket, room, callback){
  Communication.onBallPositionUpdate(socket, function(ballPosition){
    var user = getUserFromId(socket.id, room);
    user.lastBallPosition = ballPosition;
    callback(ballPosition);
  });
}

function setBallPosition(user){
  var otherPlayer = getOtherPlayer(user);
  if(typeof user == 'undefined' || typeof otherPlayer == 'undefined'){
    return;
  }
  if(typeof otherPlayer.lastBallPosition != 'undefined' && typeof user.lastBallPosition != 'undefined'){
    var player1;
    var player2;
    if(user.number == 1){
      player1 = user;
      player2 = otherPlayer;
    }else{
      player1 = otherPlayer;
      player2 = user;
    }
    var nextPos = {'x': player1.lastBallPosition.x, 'y': player1.lastBallPosition.y};
    // Send this separately
    var message = {
      "name": "ballPositionUpdate",
      "content": nextPos
    }
    Communication.toClient(player2.id, message);
  }
}