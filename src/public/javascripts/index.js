var game;
window.onload = function(){
    // Create a new Phaser game object with a single state
    game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-holder');

    game.state.add('Boot', Pong.    Boot);
    game.state.add('Preloader', Pong.Preloader);
    game.state.add('Game', Pong.Game);
    game.state.add('Options', Pong.Options);

    game.state.start('Boot');
}