  
var ready = false;
var game = this;

Pong.Preloader = function(game){
}

Pong.Preloader.prototype = {

    preload: function(){
        // Eventually load preloader screen stuff

        if(typeof game.user != 'undefined'){
            ready = true;
            return;
        }

        game.status = this.add.text(this.game.world.centerX, this.game.world.centerY * (4/3), 'Establishing connection to server...');
        game.status.anchor.setTo(0.5);
        game.status.fontWeight = 'normal';
        game.stage.backgroundColor = '#87CEEB';
        
        game.load.audio('loseMusic', "../Resources/lose-music.wav");
        game.load.audio('winMusic', "../Resources/win-music.wav");
        game.load.audio('enemyScoredSound', "../Resources/enemy-scored.wav");
        game.load.audio('scoredSound', "../Resources/scored.wav");
        game.load.audio('ballHitSound', "../Resources/ball-hit.wav");

        game.load.spritesheet('restartButton', "../Resources/RestartButton.png")
        game.socket = io();
        game.socket.on('ballStart', function(serverData){
            if(typeof game.user == 'undefined'){
                game.user = serverData.user;
                game.startingBallDirection = serverData.startingBallDirection;
                game.roomNumber = game.user.room;
                game.playerNumber = game.user.number;
                game.status.destroy();
                ready = true;
            }
        });
    },

    update: function(){
        if(ready){ 
            playerNumber = game.playerNumber;
            game.state.start('Game');
        }
    }
}
