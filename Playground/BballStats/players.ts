import _ = require('lodash');
import gameService = require('modules/gameService');
import guid = require('modules/guid');
import ko = require('knockout');

class PlayersViewModel {
    private GameService = new gameService.GameService();
    private Guid = new guid.Guid();

    players = ko.observableArray();
    newPlayerNumber = ko.observable();
    newPlayerName = ko.observable();

    addPlayer() {
        var player = { clientId: this.Guid.newGuid(), serverId: null, playerNumber: this.newPlayerNumber(), name: this.newPlayerName() };
        this.players.push(player);

        this.GameService.newPlayer(player).done((response) => {
            player.serverId = response.id;
        }).fail(() => {
            // show offline status
        });
        localStorage.setItem('players', ko.toJSON(this.players));
    }

    removePlayer = (player) => {
        if (player.serverId) {
            this.GameService.removePlayer(player);
        }
        this.players.remove(player);
        localStorage.setItem('players', ko.toJSON(this.players));
    }

    activate() {
        this.GameService.getPlayers().done((response) => {
            this.players(response.players);
        }).fail(() => {
            if (localStorage.getItem('players')) {
                this.players(JSON.parse(localStorage.getItem('players')));
            }
        });
    }
}
return new PlayersViewModel();