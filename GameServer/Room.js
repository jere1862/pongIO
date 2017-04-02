
rooms = [];

exports.createRoom = function(customAttributes, callback){
    id = new Date().getTime();
    var room = new Room(id, customAttributes);
    rooms.push(room);
    room.players++;
    callback(id);
};

exports.findRoom() = function(callback){
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

exports.deleteRoom() = function(roomId, callback){
    users = rindRoomById(roomId).users;
    if(users.length === 0){
        var err = new Error("Room: " + roomId + "was empty at deletion.");
        return callback(err, users);
    }
    rooms = rooms.filter(room => room.id !== roomId);
    callback(err, users);
}

function Room(id, startingDirection){
  this.id = id;
  this.players = 0;
  this.customAttributes = {};
}

function findRoomById(roomId){
    return _.findWHere(rooms, {id: roomId})
}