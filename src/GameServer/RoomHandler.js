_ = require('underscore');

var RoomHandler = function(roomMaxUsers){
    this.maxUsers = roomMaxUsers;
    this.rooms = [];
}

RoomHandler.prototype.findRoom = function(user, callback){
    findRoom(this, function(room){
        user.number = room.usersCount+1;
        room.addUser(user);
        callback(room.id);
    });
}

RoomHandler.prototype.deleteRoom = function(roomId, callback){
    users = findRoomById(this.rooms, roomId, function(room){
        return room.users;
    });
    if(users.length === 0){
        var err = new Error("Room: " + roomId + "was empty at deletion.");
        return callback(err, users);
    }
    this.rooms = this.rooms.filter(function(room){
        return room.id !== roomId;
    });
    callback();
}

module.exports = RoomHandler;

function Room(id, maxUsers){
  this.id = id;
  this.maxUsers = maxUsers;
  this.usersCount = 0;
  this.users = [];

  this.spaceRemaining = function(){
      return this.usersCount < maxUsers;
  }
  
  this.addUser = function(user){
      this.users.push(user);
      this.usersCount++;
  }
}

function findRoomById(rooms, roomId, callback){
   return _.findWhere(rooms, {id: roomId});
}

function createRoom(self, callback){
    id = new Date().getTime();
    var room = new Room(id, self.maxUsers);
    self.rooms.push(room);
    callback(room);
}

function findRoom(self, callback){
  if(self.rooms.length === 0){
      return createRoom(self, function(room){
        return callback(room);
      });
  }
  _.filter(self.rooms, room => room.spaceRemaining(), function(room){
    if(typeof room != undefined){
        // Todo test if value is changed in the array
        return callback(room);
    }else{
        return createRoom(self, function(room){
            return callback(room);
        });
    }
  });
}