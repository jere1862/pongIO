var Pong = {
    paddleSpeed: 600,
    maxBallVelocity: 1000
};

var leftPaddle;
var rightPaddle;
var ball;
var wasd;
var keys;

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

    leftPaddle = game.add.sprite(20, game.world.centerY, 'paddle');
    leftPaddle.anchor.set(0.5, 0.5);

    rightPaddle = game.add.sprite(game.world.width-20, game.world.centerY, 'otherPaddle');
    rightPaddle.anchor.set(0.5, 0.5);

    // Add physics to ball 
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    game.physics.enable(leftPaddle, Phaser.Physics.ARCADE);
    game.physics.enable(rightPaddle, Phaser.Physics.ARCADE);

    ball.body.velocity.setTo(-400, 400);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1.05, 1.05);

    leftPaddle.body.collideWorldBounds = true;
    rightPaddle.body.collideWorldBounds = true;
    leftPaddle.body.immovable = true;
    rightPaddle.body.immovable = true;

    // Set keys
    keys = game.input.keyboard.createCursorKeys();
    wasd = game.input.keyboard.addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D } );
}

// Called each frame
function update(){
    leftPaddle.body.velocity.y = 0;
    rightPaddle.body.velocity.y = 0;

    checkKeyInputs();
    verifyMaxBallSpeed();

    game.physics.arcade.collide(leftPaddle, ball);
    game.physics.arcade.collide(rightPaddle, ball);
}

function checkKeyInputs(){
    if(wasd.up.isDown){
        leftPaddle.body.velocity.y -= Pong.paddleSpeed;
    }
    if(keys.up.isDown){
        rightPaddle.body.velocity.y -= Pong.paddleSpeed;
    }
    if(wasd.down.isDown){
        leftPaddle.body.velocity.y += Pong.paddleSpeed;
    }
    if(keys.down.isDown){
        rightPaddle.body.velocity.y += Pong.paddleSpeed;
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