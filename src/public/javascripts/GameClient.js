var Config = {
    paddleSpeed: 450,
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

// Pseudo game states
var over = false;
var idle = false;

var loseMusic;
var winMusic;
var enemyScoredSound;
var scoredSound;
var ballHitSound;

// Score texts
var leftText;
var rightText;
var restartText;

var searchingForGameText;

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
        onLose();
        onWin();

        // Add sounds
        loseMusic = game.add.audio('loseMusic');
        winMusic =  game.add.audio('winMusic');
        enemyScoredSound = game.add.audio('enemyScoredSound', 0.2);
        scoredSound = game.add.audio('scoredSound', 0.2);
        ballHitSound = game.add.audio('ballHitSound');

        game.sound.volume = 0.1;

        game.socket.on('positionUpdate', function(position){
            newEnemyPaddlePosition = position;
        });

        // Add keyboard inputs
        keys = game.input.keyboard.createCursorKeys();
        wasd = game.input.keyboard.addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D } );

        searchingForGameText = addText("Searching for game...")


        sendReadyToServer();
        onReadyFromServer(() => {
            game.paused = true;
            searchingForGameText.setText("Found game \n Get ready!", );
            setTimeout(() =>{
                searchingForGameText.destroy();
                game.paused = false;
            },
            3000);
        });
    },

    // Called each frame
    update: function(){
        if(!over){
            clientPaddle.body.velocity.y = 0;
            enemyPaddle.body.position.y = newEnemyPaddlePosition;
            checkKeyInputs();
            verifyMaxBallSpeed();

            game.physics.arcade.collide(clientPaddle, ball, () => ballHitSound.play());
            game.physics.arcade.collide(enemyPaddle, ball, () => ballHitSound.play()); 
            game.physics.arcade.collide(ball, upperBound, () => ballHitSound.play());
            game.physics.arcade.collide(ball, lowerBound, () => ballHitSound.play());

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
            checkBoundaries();
        }
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
    text.setTextBounds(0, 300, 800, 100);
    return text;
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

function onReadyFromServer(callback){
    game.socket.on('start', function(){
         ball.body.velocity.setTo(startingBallDirection.x * Config.initialBallSpeed, startingBallDirection.y * Config.initialBallSpeed);
         callback();
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
        idle = false;
    });
}

function onBallStart(callback){
    game.socket.on('ballStart', function(serverData){
        var startingBallDirection = serverData.startingBallDirection;
        if(ball.alive){
            ball.body.velocity.setTo(startingBallDirection.x * Config.initialBallSpeed, startingBallDirection.y * Config.initialBallSpeed);
        }
    });
}

function onLose(){
    game.socket.on('lose', function(){
        addText("You lose...");
        if(user.number === 1){
            rightText.setText(10);
        }else{
            leftText.setText(10);
        }
        over = true;
        ball.destroy();
        loseMusic.play();
        onGameEnd();
    });
}

function onWin(){
    game.socket.on('win', function(){
        addText("You win!");
        if(user.number === 1){
            leftText.setText(10);
        }else{
            rightText.setText(10);
        }
        over = true;
        ball.destroy();
        winMusic.play();
        onGameEnd();
    });
}

function checkBoundaries(){
    if(ball.body.position.x > (game.world.width - ball.body.width)){
        if(user.number === 1){
            playOnce(scoredSound);
        }else{
            playOnce(enemyScoredSound);
        }
    }else if(ball.body.position.x < ball.width){
        if(user.number === 1){
            playOnce(enemyScoredSound);
        }else{
            playOnce(scoredSound);
        }
    }
}

function playOnce(sound){
    if(!idle){
        sound.play();
        idle = true;
    }
}

function onGameEnd(){
    restartButton = game.add.button(game.width/2, 500, 'restartButton', onRestart, this, 2, 1, 0);
    restartButton.anchor.setTo(0.5,0.5);
}

function onRestart(){
    location.reload();
    game.socket.emit('quit', {'user':user});
}