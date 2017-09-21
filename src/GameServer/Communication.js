var Communication = function(){
}

//Todo make on... same as toClient

Communication.prototype.onPositionUpdate = function(socket, callback){
    socket.on('positionUpdate', function(clientData){
        callback(clientData);
    });
}

Communication.prototype.onBallPositionUpdate = function(socket, callback){
    socket.on('ballPositionUpdate', function(clientData){
        callback(clientData);
    });
}

Communication.prototype.onReady = function(socket, callback){
    socket.on('ready', function(){
        callback();
    })
};

Communication.prototype.toClient = function(clientId, message){
    this.io.to(clientId).emit(message.name, message.content);
}

Communication.prototype.onDisconnect = function(socket, callback){
    socket.on('disconnect', function(socket){
        callback(socket.id);
    });
}
Communication.prototype.initiate = function(io, callback){
    this.io = io;
    io.on('connection', function(socket) {
        callback(socket)
    });
}

module.exports = new Communication();