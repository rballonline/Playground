import ko = require('knockout');
import _ = require('lodash');
import moment = require('moment');
import guid = require('modules/guid');
import gameService = require('modules/gameService');

class GameViewModel {

    id: string;
    name = ko.observable<string>();

    constructor(id: string, name: string) {
        this.id = id;
        this.name(name);
    }
    createNew() {

    }
}

class GamesViewModel {
    Guid = new guid.Guid();
    GameService = new gameService.GameService();

    newGameName = ko.observable();

    games = ko.observableArray();

    addGame() {
        var game = { name: this.newGameName(), clientId: this.Guid.newGuid(), date: new Date(), serverId: null };
        this.GameService.newGame(game).done((response) => {
            game.serverId = response.id;
        }).fail(() => {
            // show offline status
        });
        this.games.push(game);
        localStorage.setItem('games', ko.toJSON(this.games));
    }

    removeGame = (game) => {
        if (game.serverId) {
            this.GameService.removeGame(game);
        }
        this.games.remove(game);
        localStorage.setItem('games', ko.toJSON(this.games));
    }
    
    activate() {
        this.GameService.getGames().done((response) => {
            this.games(response.games);
        }).fail(() => {
            if (localStorage.getItem('games')) {
                this.games(JSON.parse(localStorage.getItem('games')));
            }
        });
    }
}
return new GamesViewModel();