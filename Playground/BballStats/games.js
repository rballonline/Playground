define(["require", "exports", 'knockout', 'modules/guid', 'modules/gameService'], function(require, exports, ko, guid, gameService) {
    var GameViewModel = (function () {
        function GameViewModel(id, name) {
            this.name = ko.observable();
            this.id = id;
            this.name(name);
        }
        GameViewModel.prototype.createNew = function () {
        };
        return GameViewModel;
    })();

    var GamesViewModel = (function () {
        function GamesViewModel() {
            var _this = this;
            this.Guid = new guid.Guid();
            this.GameService = new gameService.GameService();
            this.newGameName = ko.observable();
            this.games = ko.observableArray();
            this.removeGame = function (game) {
                if (game.serverId) {
                    _this.GameService.removeGame(game);
                }
                _this.games.remove(game);
                localStorage.setItem('games', ko.toJSON(_this.games));
            };
        }
        GamesViewModel.prototype.addGame = function () {
            var game = { name: this.newGameName(), clientId: this.Guid.newGuid(), date: new Date(), serverId: null };
            this.GameService.newGame(game).done(function (response) {
                game.serverId = response.id;
            }).fail(function () {
                // show offline status
            });
            this.games.push(game);
            localStorage.setItem('games', ko.toJSON(this.games));
        };

        GamesViewModel.prototype.activate = function () {
            var _this = this;
            this.GameService.getGames().done(function (response) {
                _this.games(response.games);
            }).fail(function () {
                if (localStorage.getItem('games')) {
                    _this.games(JSON.parse(localStorage.getItem('games')));
                }
            });
        };
        return GamesViewModel;
    })();
    return new GamesViewModel();
});
//# sourceMappingURL=games.js.map
