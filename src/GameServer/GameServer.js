var _ = require('underscore');
var RoomHandler = require('./RoomHandler');
var Communication = require('./Communication');

users = [];

var User = function(userId, roomId = 0){
    this.id = userId;
    this.number = 0;
    this.room = roomId;
    this.ready = false;

    this.setNumber = function(number){
      this.number = number;
    }
    return this;
}

exports.User = User;

exports.start = function(io){
  initiateConnectonToClient(io, function(socket){
    Communication.onPositionUpdate(socket, function(clientData){
      var otherPlayer = getOtherPlayer(clientData.user.room, clientData.user.number);
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
          Communication.toClient(socket.id, message)
          Communication.onReady(socket, function(){
            user.ready = true;
            var otherPlayer = getOtherPlayer(room.id, user.number);
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

function getUserFromId(id, room, callback){
  return _.findWhere(room.users, {id: id});
}

function getOtherPlayer(roomId, playerNumber, callback){
  return _.find(users, user => user.room === roomId && user.number !== playerNumber);
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
