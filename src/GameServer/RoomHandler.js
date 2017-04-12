'use strict';

var _ = require('underscore');

var RoomHandler = function(roomMaxUsers){
    this.maxUsers = roomMaxUsers;
    this.rooms = [];
}

RoomHandler.prototype.findRoom = function(user, cb){
    var self = this;
    innerFindRoom(self, function(room){
        room.addUser(user);
        cb(room);
    });
}

RoomHandler.prototype.deleteRoom = function(roomId, callback){
    var self = this;
    innerDeleteRoom(self.rooms, roomId, function(rooms){
        self.rooms = rooms;
        callback();
    });
}

function innerDeleteRoom(rooms, roomId, callback){
    callback(_.filter(rooms, function(room){
        return room.id !== roomId;
    }));
}

module.exports = RoomHandler;

function Room(id, maxUsers){
  this.id = id;
  this.maxUsers = maxUsers;
  this.users = [];

  this.spaceRemaining = function(){
      return this.users.length < maxUsers;
  }
  
  this.addUser = function(user){
      this.users.push(user);
  }
}

function findRoomById(rooms, roomId, callback){
    callback(_.findWhere(rooms, {id: roomId}));
}

function createRoom(self, callback){
    var id = new Date().getTime();
    var room = new Room(id, self.maxUsers);
    self.rooms.push(room);
    callback(room);
}

function innerFindRoom(self, callback){
  findEmptyRooms(self.rooms, function(rooms){
    if(rooms.length === 0){
      return createRoom(self, function(room){
        return callback(room);
      });
    }
    return callback(rooms[0]);
  });
}

function findEmptyRooms(rooms, callback){
  callback(_.filter(rooms, function(room){
        return room.spaceRemaining();
  }));
}