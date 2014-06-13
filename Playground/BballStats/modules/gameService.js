define(["require", "exports", 'jquery'], function(require, exports, $) {
    var GameService = (function () {
        function GameService() {
        }
        GameService.prototype.newPlayer = function (player) {
            return $.post('/bball/new/player', player);
        };

        GameService.prototype.getPlayers = function () {
            return $.getJSON('/bball/players');
        };

        GameService.prototype.removePlayer = function (player) {
            return $.post('/bball/remove/player', player.serverId);
        };

        GameService.prototype.newGame = function (game) {
            return $.post('/bball/new/game', game);
        };

        GameService.prototype.getGames = function () {
            return $.getJSON('/bball/games');
        };

        GameService.prototype.removeGame = function (game) {
            return $.post('/bball/remove/game', game.serverId);
        };

        GameService.prototype.getGame = function (id) {
            return $.getJSON('/bball/game/' + id);
        };

        GameService.prototype.saveGame = function (game) {
            return $.post('/bball/save/game', game);
        };
        return GameService;
    })();
    exports.GameService = GameService;
});
//# sourceMappingURL=gameService.js.map
