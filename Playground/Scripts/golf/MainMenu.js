var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Golf;
(function (Golf) {
    var MainMenu = (function (_super) {
        __extends(MainMenu, _super);
        function MainMenu() {
            _super.apply(this, arguments);
        }
        //background: Phaser.Sprite;
        //logo: Phaser.Sprite;
        MainMenu.prototype.create = function () {
            this.stage.backgroundColor = 0xffffff;

            /*
            this.background = this.add.sprite(0, 0, 'titlepage');
            this.background.alpha = 0;
            
            this.logo = this.add.sprite(this.world.centerX, -300, 'logo');
            this.logo.anchor.setTo(0.5, 0.5);
            
            this.add.tween(this.background).to({ alpha: 1}, 2000, Phaser.Easing.Bounce.InOut, true);
            this.add.tween(this.logo).to({ y: 220 }, 2000, Phaser.Easing.Elastic.Out, true, 2000);
            */
            this.game.add.text(this.game.world.centerX, 10, 'Golf', { font: '45px Arial' });
            var start = this.game.add.text(this.game.world.centerX, 50, 'Start', { font: '25px Arial' });
            start.inputEnabled = true;
            start.events.onInputDown.add(this.startGame, this);
            //this.input.onDown.addOnce(this.startGame, this);
        };

        MainMenu.prototype.fadeOut = function () {
            /*
            this.add.tween(this.background).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true);
            var tween = this.add.tween(this.logo).to({ y: 800 }, 2000, Phaser.Easing.Linear.None, true);
            
            tween.onComplete.add(this.startGame, this);
            */
        };

        MainMenu.prototype.startGame = function () {
            this.game.state.start('Level1', true, false);
        };
        return MainMenu;
    })(Phaser.State);
    Golf.MainMenu = MainMenu;
})(Golf || (Golf = {}));
//# sourceMappingURL=MainMenu.js.map
