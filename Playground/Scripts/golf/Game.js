var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Golf;
(function (Golf) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this, 800, 600, Phaser.AUTO, 'content');

            this.state.add('Boot', Golf.Boot, false);
            this.state.add('Preloader', Golf.Preloader, false);
            this.state.add('MainMenu', Golf.MainMenu, false);
            this.state.add('Level1', Golf.Level1, false);

            this.state.start('Boot');
        }
        return Game;
    })(Phaser.Game);
    Golf.Game = Game;

    window.onload = function () {
        var game = new Golf.Game();
    };
})(Golf || (Golf = {}));
//# sourceMappingURL=Game.js.map
