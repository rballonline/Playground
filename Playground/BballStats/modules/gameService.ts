import _ = require('lodash');
import $ = require('jquery');

export class GameService {
    newPlayer(player) {
        return $.post('/bball/new/player', player);
    }

    getPlayers() {
        return $.getJSON('/bball/players');
    }

    removePlayer(player) {
        return $.post('/bball/remove/player', player.serverId);
    }

    newGame(game) {
        return $.post('/bball/new/game', game);
    }

    getGames() {
        return $.getJSON('/bball/games');
    }

    removeGame(game) {
        return $.post('/bball/remove/game', game.serverId);
    }

    getGame(id: string) {
        return $.getJSON('/bball/game/' + id);
    }

    saveGame(game) {
        return $.post('/bball/save/game', game);
    }
} 