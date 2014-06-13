define(["require", "exports", 'modules/gameService', 'modules/guid', 'knockout'], function(require, exports, gameService, guid, ko) {
    var PlayersViewModel = (function () {
        function PlayersViewModel() {
            var _this = this;
            this.GameService = new gameService.GameService();
            this.Guid = new guid.Guid();
            this.players = ko.observableArray();
            this.newPlayerNumber = ko.observable();
            this.newPlayerName = ko.observable();
            this.removePlayer = function (player) {
                if (player.serverId) {
                    _this.GameService.removePlayer(player);
                }
                _this.players.remove(player);
                localStorage.setItem('players', ko.toJSON(_this.players));
            };
        }
        PlayersViewModel.prototype.addPlayer = function () {
            var player = { clientId: this.Guid.newGuid(), serverId: null, playerNumber: this.newPlayerNumber(), name: this.newPlayerName() };
            this.players.push(player);

            this.GameService.newPlayer(player).done(function (response) {
                player.serverId = response.id;
            }).fail(function () {
                // show offline status
            });
            localStorage.setItem('players', ko.toJSON(this.players));
        };

        PlayersViewModel.prototype.activate = function () {
            var _this = this;
            this.GameService.getPlayers().done(function (response) {
                _this.players(response.players);
            }).fail(function () {
                if (localStorage.getItem('players')) {
                    _this.players(JSON.parse(localStorage.getItem('players')));
                }
            });
        };
        return PlayersViewModel;
    })();
    return new PlayersViewModel();
});
//# sourceMappingURL=players.js.map
