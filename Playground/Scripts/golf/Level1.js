var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Golf;
(function (Golf) {
    var Level1 = (function (_super) {
        __extends(Level1, _super);
        function Level1() {
            _super.apply(this, arguments);
        }
        Level1.prototype.create = function () {
            this.stage.backgroundColor = 0x4488cc;
        };
        return Level1;
    })(Phaser.State);
    Golf.Level1 = Level1;
})(Golf || (Golf = {}));
//# sourceMappingURL=Level1.js.map
