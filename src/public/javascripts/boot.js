// Eventually, adjust the settings for desktop vs mobile
var Pong = {};

Pong.Boot = function(game){
    //
}

Pong.Boot.prototype = {
    init: function(){
        // Eventually put Windows or mobile stuff here

        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.stage.disableVisibilityChange = true; // To disable pause on lost focus
    },
    preload: function(){
        // Load preloader assets

    },
    create: function(){
        this.state.start('Preloader');
    }
}