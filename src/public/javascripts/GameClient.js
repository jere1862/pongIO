var Config = {
    paddleSpeed: 700,
    maxBallVelocity: 1000,
    initialBallSpeed: 300,
    clientPaddleColor: 0xBAEBAE,
    enemyPaddleColor: 0xF6546A,
    worldBoundColor: 0x000000,
    ballColor: 0xFFFFFF,
    paddleSize: {'x': 20, 'y': 80},
    ballRadius: 15,
    paddlePadding: 20
};

var clientPaddle;
var enemyPaddle;
var newEnemyPaddlePosition;
var oldClientPaddlePosition;
var nextBallPosition;
var startingBallDirection;
var ball;
var wasd;
var keys;
var tweenA;

var leftText;
var rightText;

var user;

Pong.Game = function(game){
}

Pong.Game.prototype = {
    // Called first
    preload: function() {
        user = game.user;
        startingBallDirection = game.startingBallDirection;
        roomNumber = game.roomNumber;
    },

    // Called after preload 
    create: function(){
        // Create some text in the middle of the game area
        //game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.disableVisibilityChange = true; // To disable pause on lost focus
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = '#87CEEB';

        //Add game objects to the scene
        addBall();
        addWorldBounds();
        leftText = leftScore();
        rightText= rightScore();
        scoreLeft = 0;
        scoreRight = 0;

        createPaddles();
        newEnemyPaddlePosition = game.world.centerY;
        receivePaddleData();
        receiveBallData();
        onScoreUpdate();
        onBallStart();
        // For debugging purposes
        //addRoomNumber(user.room);
        game.socket.on('positionUpdate', function(position){
            newEnemyPaddlePosition = position;
        });

        // Add keyboard inputs
        keys = game.input.keyboard.createCursorKeys();
        wasd = game.input.keyboard.addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D } );

        onReadyFromServer();
        sendReadyToServer();
        onWinUpdate();
    },

    // Called each frame
    update: function(){
            clientPaddle.body.velocity.y = 0;
            enemyPaddle.body.position.y = newEnemyPaddlePosition;
            checkKeyInputs();
            verifyMaxBallSpeed();

            game.physics.arcade.collide(clientPaddle, ball);
            game.physics.arcade.collide(enemyPaddle, ball); 
            game.physics.arcade.collide(ball, upperBound);
            game.physics.arcade.collide(ball, lowerBound);

            if(typeof nextBallPosition != 'undefined'){
                game.physics.arcade.moveToXY(
                    ball,
                    nextBallPosition,
                    15
                )
                ball.body.position = nextBallPosition;
            }

            if(oldClientPaddlePosition != clientPaddle.body.position.y){
                oldClientPaddlePosition = clientPaddle.body.position.y;
                sendPaddleData(clientPaddle.body.position.y);
            }
            sendBallPositionUpdate();
    }

}

function checkKeyInputs(){
    if(wasd.up.isDown || keys.up.isDown){
        clientPaddle.body.velocity.y -= Config.paddleSpeed;
    }
    if(wasd.down.isDown || keys.down.isDown){
        clientPaddle.body.velocity.y += Config.paddleSpeed;
    }
}

function verifyMaxBallSpeed(){
    if(ball.body.velocity.x > Config.maxBallVelocity){
        ball.body.velocity.x = Config.maxBallVelocity;
    }
    if(ball.body.velocity.y > Config.maxBallVelocity){
        ball.body.velocity.y = Config.maxBallVelocity;
    }
}

function addText(text){
    var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

    //  The Text is positioned at 0, 100
    var text = game.add.text(0, 0, text, style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

    //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
    text.setTextBounds(0, 400, 800, 100);
}

function createPaddleGraphics(color, size){
    var graphics = game.add.graphics();
    graphics.beginFill(color, 1);
    graphics.drawRect(0, 0, size.x, size.y);
    graphics.endFill();
    graphics.boundsPadding = 0;
    return graphics;
}

function createCircleGraphcis(radius){
    var graphics = game.add.graphics();
    graphics.beginFill(Config.ballColor, 1);
    graphics.drawCircle(0, 0, radius);
    graphics.endFill();
    return graphics;
}

function createPaddles(){
    if(user.number == 1){
        // Client paddle is on the left
        clientPaddle = addPaddle(Config.clientPaddleColor, Config.paddlePadding);
        enemyPaddle = addPaddle(Config.enemyPaddleColor, game.world.width - Config.paddlePadding);
    }else{
        // Client paddle is on the right
        clientPaddle = addPaddle(Config.clientPaddleColor, game.world.width - Config.paddlePadding);
        enemyPaddle = addPaddle(Config.enemyPaddleColor, Config.paddlePadding);
    }
}

function addPaddle(color, position){
    paddleGraphics = createPaddleGraphics(color, Config.paddleSize);
    paddleSprite = game.add.sprite(position, game.world.centerY, paddleGraphics.generateTexture());
    paddleGraphics.destroy();
    game.physics.enable(paddleSprite, Phaser.Physics.ARCADE);
    paddleSprite.body.collideWorldBounds = true;
    paddleSprite.body.immovable = true;
    paddleSprite.anchor.set(0.5, 0.5);
    return paddleSprite;
}

function addBall(){
    var ballGraphics = createCircleGraphcis(Config.ballRadius);
    ball = game.add.sprite(game.world.centerX, game.world.centerY, ballGraphics.generateTexture());
    ballGraphics.destroy();
    ball.anchor.set(0.5, 0.5);

    // Add physics to ball 
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = false;
    ball.body.bounce.set(1.05, 1.05);
}

function addWorldBounds(){
    boundGraphics = createPaddleGraphics(Config.worldBoundColor, {'x': game.world.width, 'y': 20});
    upperBound = game.add.sprite(0, -20, boundGraphics.generateTexture());
    lowerBound = game.add.sprite(0, game.world.height, boundGraphics.generateTexture());
    boundGraphics.destroy();

    game.physics.enable(upperBound, Phaser.Physics.ARCADE);
    game.physics.enable(lowerBound, Phaser.Physics.ARCADE);
    
    lowerBound.body.immovable = true;
    upperBound.body.immovable = true;
}

function sendPaddleData(position){
    game.socket.emit('positionUpdate', {'user':user, 'position':position});
}

function sendReadyToServer(){
    game.socket.emit('ready');
}

function onReadyFromServer(){
    game.socket.on('start', function(){
         ball.body.velocity.setTo(startingBallDirection.x * Config.initialBallSpeed, startingBallDirection.y * Config.initialBallSpeed);
    });
}

function receivePaddleData(){
    game.socket.on('positionUpdate', function(position){
        newEnemyPaddlePosition = position;
    });
}

function sendBallPositionUpdate(){
    game.socket.emit('ballPositionUpdate', ball.body.position);
}

function receiveBallData(){
    game.socket.on('ballPositionUpdate', function(pos){
        nextBallPosition = pos;
    });
}

function leftScore(){
    var style = { font: "bold 80px Arial", fill: "#fff" , boundsAlignH: "center", boundsAlignV: "middle" };

    //  The Text is positioned at 0, 100
    var text = game.add.text(0, 0, 0, style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

    //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
    return text.setTextBounds(-70, 50, 800, 100);
}

function rightScore(){  
    var style = { font: "bold 80px Arial", fill: "#fff" , boundsAlignH: "center", boundsAlignV: "middle" };

    //  The Text is positioned at 0, 100
    var text = game.add.text(0, 0, 0, style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

    //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
    return text.setTextBounds(70, 50, 800, 100);
}

function resetBall(){
    ball.destroy();
    addBall();
}

function onScoreUpdate(callback){
    game.socket.on('scoreUpdate', function(message){
        resetBall();
        leftText.text = message.player1;
        rightText.text = message.player2;
    });
}

function onBallStart(callback){
    game.socket.on('ballStart', function(serverData){
        var startingBallDirection = serverData.startingBallDirection;
        ball.body.velocity.setTo(startingBallDirection.x * Config.initialBallSpeed, startingBallDirection.y * Config.initialBallSpeed);
    });
}

function onWinUpdate(){
    game.socket.on('winUpdate', function(serverData){
        game.paused = true;
        if(serverData.winner === 1){
            leftText.text = 10;
            addText("Winner: Player "+1);
        }
        if(serverData.winner === 2){
            rightText.text = 10;
            addText("Winner: Player "+2);
        }
    });
}