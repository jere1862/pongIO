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
    var user = new gameServer.User(1);
    var secondUser = new gameServer.User(2);
    var thirdUser = new gameServer.User(3);
    var roomHandler = new RoomHandler(MAX_USERS);
    
    afterEach(function(){
        roomHandler.rooms.length = 0;
    });


    it("finds a room for the first user.", function(done) {
        var result = roomHandler.findRoom(user, function(id) {
            var rooms = roomHandler.rooms;
            try{
                expect(rooms.length).to.equal(1);
                expect(rooms[0].users.length).to.equal(1);
                expect(rooms[0].maxUsers).to.equal(MAX_USERS);
                expect(id).to.not.be.null;
                done();
            }catch(e){
                done(e)
            }
        });
    })

    it("finds a room for a second user", function(done){
        roomHandler.findRoom(user, () => {
            var result = roomHandler.findRoom(user, function(id){
                var rooms = roomHandler.rooms;
                expect(rooms.length).to.equal(1);
                expect(rooms[0].users.length).to.equal(2);
                expect(rooms[0].maxUsers).to.equal(2);
                expect(id).to.not.be.null;
                done();
            });
        });
    })

    it("finds a room for more than two users.", function(done){
        try{
            roomHandler.findRoom(user, () => {
                roomHandler.findRoom(secondUser, () => { 
                    roomHandler.findRoom(thirdUser, function(id){
                        var rooms = roomHandler.rooms;
                        expect(rooms.length).to.equal(2);
                        expect(rooms[0].users.length).to.equal(MAX_USERS);
                        expect(rooms[0].maxUsers).to.equal(MAX_USERS);
                        expect(rooms[1].users.length).to.equal(1);
                        expect(id).to.not.be.null;
                        done();
                    })
                });
            });
        }catch(e){
            done(e);
        }
    })

    it("deletes a room.", function(){
        roomHandler.findRoom(user, function(room){
            var rooms = roomHandler.rooms;
            expect(rooms.length).to.equal(1);
            expect(room.id).to.not.be.null;
            roomHandler.deleteRoom(room.id, function(){
                expect(roomHandler.rooms.length).to.equal(0);
            });
        });  
    })
})