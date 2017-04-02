const sinon = require('sinon');
const chai = require('chai');
const RoomHandler = require('../../src/GameServer/RoomHandler');
const gameServer = require('../../src/GameServer/GameServer');

const expect = chai.expect;

before(function(){
});

describe("Room module", function(){
    const MAX_USERS = 2;
    const USER_ID = 1;
    const user = sinon.stub();
    var roomHandler = new RoomHandler(MAX_USERS);

    it("finds a room for the first user.", function() {
        var result = roomHandler.findRoom(user, function(id) {
            var rooms = roomHandler.rooms;
            expect(rooms.length).to.equal(1);
            expect(rooms[0].usersCount).to.equal(1);
            expect(rooms[0].maxUsers).to.equal(MAX_USERS);
            expect(id).to.not.be.null;
        });
    })

    it("finds a room for a second user", function(){
        roomHandler.findRoom(user, () => {});
        var result = roomHandler.findRoom(user, function(id){
            var rooms = roomHandler.rooms;
            expect(rooms.length).to.equal(1);
            expect(rooms[0].usersCount).to.equal(2);
            expect(rooms[0].maxUsers).to.equal(2);
            expect(id).to.not.be.null;
        });
    })

    it("finds a room for more than two users.", function(){
        roomHandler.findRoom(user, () => {});
        roomHandler.findRoom(user, () => {});
        roomHandler.findRoom(user, function(id){
            var rooms = roomHandler.rooms;
            expect(rooms.length).to.equal(2);
            expect(rooms[0].usersCount).to.equal(MAX_USERS);
            expect(rooms[0].maxUsers).to.equal(MAX_USERS);
            expect(rooms[1]).usersCount.to.equal(1);
            expect(id).to.not.be.null;
        });
    })

    it("deletes a room.", function(){
        roomHandler.findRoom(user, function(id){
            var rooms = roomHandler.rooms;
            expect(rooms.length).to.equal(1);
            expect(id).to.not.be.null;
            roomHandler.deleteRoom(id, function(){
                expect(roomHandler.rooms.length).to.equal(0);
            });
        });  
    })
})