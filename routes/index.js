var express = require('express');
var router = express.Router();
var app = require('./../app.js');
var io = require('socket.io')(app);

roomsHolder = [];


module.exports = function(io){
  /* GET home page. */
  io.on('connection', function(socket){
    findRoom(()=>{});
  });

  io.on('disconnect', function(socket){
    console.log('A user disconnected.');
  })

  router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  return router;
}

function findRoom(callback){
  if(roomsHolder.length == 0){
    return createRoom(function(id){
      callback(id);
    });
  }
  for(var room in roomsHolder){
    if(roomsHolder[room].players < 2){
      roomsHolder[room].players++;
      return callback(room.id);
    }
  }
    createRoom(function(id){
     return callback(id);
    });
}

function Room(id){
  this.id = id;
  this.players = 0;
}

function createRoom(callback){
  id = new Date().getTime();
  var room = new Room(id);
  roomsHolder.push(room)
  room.players++;
  return callback(id);
}