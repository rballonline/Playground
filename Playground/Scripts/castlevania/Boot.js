var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Castlevania;
(function (Castlevania) {
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            _super.apply(this, arguments);
        }
        Boot.prototype.preload = function () {
            this.load.image('preloadBar', 'Content/castlevania/loader.png');
        };

        Boot.prototype.create = function () {
            //  Unless you specifically need to support multitouch I would recommend setting this to 1
            this.input.maxPointers = 1;

            this.game.state.start('Preloader', true, false);
        };
        return Boot;
    })(Phaser.State);
    Castlevania.Boot = Boot;
})(Castlevania || (Castlevania = {}));
//# sourceMappingURL=Boot.js.map
