var Pong = {
    paddleSpeed: 700,
    maxBallVelocity: 100000000,
    initialBallSpeed: 600,
    clientPaddleColor: 0xBAEBAE,
    enemyPaddleColor: 0xF6546A,
    paddleSize: {'x': 20, 'y': 80},
    paddlePadding: 20
};

var clientPaddle;
var enemyPaddle;
var ball;
var wasd;
var keys;

var roomNumber = 0;
var playerNumber;
var connectionEstablished = false;

// Create a new Phaser game object with a single state
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-holder', {
    preload: preload,
    create: create,
    update: update
});

// Called first
function preload() {
    game.load.image('ball', '../images/ball.png');  
    game.load.image('paddle', '../images/paddle.png');
    game.load.image('otherPaddle', '../images/other_paddle.png');
}

// Called after preload
function create(){
    // Create some text in the middle of the game area
    //game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    
    game.stage.backgroundColor = '#87CEEB';

    // Start physics engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //Add game objects to the scene
    ball = game.add.sprite(game.world.centerX, game.world.centerY, 'ball');
    ball.anchor.set(0.5, 0.5);

    // Add physics to ball 
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1.05, 1.05);

    placeBall();
    
    var socket = io();
    socket.on('creationResponse', function(user){
		var scoreText
        console.log(user);
        roomNumber = user.room;
		scoreText = score()
        playerNumber = user.playerNumber;
        createPaddles();
        connectionEstablished = true;
        //Debug
        addRoomNumber(roomNumber);
    });
    
    socket.on('update', function(a){
        console.log(a.test);
    });

    // Add keyboard inpugs
    keys = game.input.keyboard.createCursorKeys();
    wasd = game.input.keyboard.addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D } );
}

// Called each frame
function update(){
    // TODO: establish connection before handling the sprites
    if(connectionEstablished){
        clientPaddle.body.velocity.y = 0;
        enemyPaddle.body.velocity.y = 0;

        checkKeyInputs();
        verifyMaxBallSpeed();

        game.physics.arcade.collide(clientPaddle, ball);
        game.physics.arcade.collide(enemyPaddle, ball);
    }
}

function render(){
    game.debug.bodyInfo(clientPaddle, 32, 32);
    game.debug.body(clientPaddle);
    game.debug.body(enemyPaddle);
}

function checkKeyInputs(){
    if(wasd.up.isDown || keys.up.isDown){
        clientPaddle.body.velocity.y -= Pong.paddleSpeed;
    }
    if(wasd.down.isDown || keys.down.isDown){
        clientPaddle.body.velocity.y += Pong.paddleSpeed;
    }
}

function verifyMaxBallSpeed(){
    if(ball.body.velocity.x > Pong.maxBallVelocity){
        ball.body.velocity.x = Pong.maxBallVelocity;
    }
    if(ball.body.velocity.y > Pong.maxBallVelocity){
        ball.body.velocity.y = Pong.maxBallVelocity;
    }
}

function placeBall(){
    xDirection = Math.random() - 0.5;
    yDirection=  (Math.random() * (1 - 0.2) + 0.2);   
    yScale = Math.random() > 0.5 ? -1 : 1;
    if(xDirection > 0 ){
        xDirection = 1;
    }else{
        xDirection = -1;
    }
    ball.body.velocity.setTo(xDirection * Pong.initialBallSpeed, yDirection * yScale * Pong.initialBallSpeed);
}

function addRoomNumber(roomNumber){
    var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };

    //  The Text is positioned at 0, 100
    text = game.add.text(0, 0, "Room: "+roomNumber, style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

    //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
    text.setTextBounds(0, 40, 800, 100);
}

function createColoredRectangle(color, size){
    var graphics = game.add.graphics();
    graphics.beginFill(color, 1);
    graphics.drawRect(0, 0, size.x, size.y);
    graphics.endFill();
    graphics.boundsPadding = 0;
    return graphics;
}

function createPaddles(){
    if(playerNumber == 1){
        // Client paddle is on the left
        clientPaddle = addPaddle(Pong.clientPaddleColor, Pong.paddlePadding);
        enemyPaddle = addPaddle(Pong.enemyPaddleColor, game.world.width - Pong.paddlePadding);
    }else{
        // Client paddle is on the right
        clientPaddle = addPaddle(Pong.clientPaddleColor, game.world.width - Pong.paddlePadding);
        enemyPaddle = addPaddle(Pong.enemyPaddleColor, Pong.paddlePadding);
    }
}

function addPaddle(color, position){
    paddleGraphics = createColoredRectangle(color, Pong.paddleSize);
    paddleSprite = game.add.sprite(position, game.world.centerY, paddleGraphics.generateTexture());
    paddleGraphics.destroy();
    game.physics.enable(paddleSprite, Phaser.Physics.ARCADE);
    paddleSprite.body.collideWorldBounds = true;
    paddleSprite.body.immovable = true;
    paddleSprite.anchor.set(0.5, 0.5);
    return paddleSprite;
}

// function playerScored){
// //if ball touch right wall
	// //+1 to left player 
// //if  ball touch left wall	
	// //+1 to right player 
	// if(ball.body)	
// }

function score(score){
    var style = { font: "bold 40px Arial", fill: "#fff" , boundsAlignH: "center", boundsAlignV: "middle" };

    //  The Text is positioned at 0, 100
    text = game.add.text(0, 0, score, style);
    text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);

    //  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
    text.setTextBounds(0, 10, 800, 100);
}
