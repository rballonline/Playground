import ko = require('knockout');
import _ = require('lodash');
import moment = require('moment');

export class PlayerViewModel {
    name: string;
    playerNumber: number;
    active = ko.observable<boolean>(false);

    constructor(name: string, num: number) {
        this.name = name;
        this.playerNumber = num;
    }
}

export class DashBoardViewModel {
    currentPeriod = ko.observable<number>(1);
    editPlayersMode = ko.observable<boolean>(false);
    makingSubstitutions = ko.observable<boolean>(false);
    activeButton = ko.observable<string>('');
    homeScore = ko.observable<number>(0);
    awayScore = ko.observable<number>(0);
    activePlayer: PlayerViewModel = null;
    coords : Array<number> = null;

    game = new Game();

    benchedPlayers = ko.observableArray<PlayerViewModel>();
    currentPlayers = ko.observableArray<PlayerViewModel>();

    constructor() {
        this.currentPlayers.push(new PlayerViewModel('Ian', 5));
        this.currentPlayers.push(new PlayerViewModel('Noah', 55));
        this.currentPlayers.push(new PlayerViewModel('Jared', 35));
        this.currentPlayers.push(new PlayerViewModel('Eric', 15));
        this.currentPlayers.push(new PlayerViewModel('Kyren', 45));
        this.benchedPlayers.push(new PlayerViewModel('Kameron', 95));
        this.benchedPlayers.push(new PlayerViewModel('Dominic', 105));
    }

    homeRecordEnabled = ko.computed<boolean>(() => {
        var buttonActive = false;
        if (this.activeButton() != '') {
            buttonActive = true;
            var playerActive = false;

            _.each<PlayerViewModel>(this.currentPlayers(), (player) => {
                if (player.active()) {
                    playerActive = true;
                    return;
                }
            });
        }
        if (this.activeButton() == '2ptMade' || this.activeButton() == '2ptMiss' || this.activeButton() == '3ptMade' || this.activeButton() == '3ptMiss') {
            return this.coords != null && buttonActive && playerActive;
        }
        else {
            return buttonActive && playerActive;
        }
    }, this);

    choosePlayer = (player: PlayerViewModel) => {
        _.each<PlayerViewModel>(this.currentPlayers(), (player) => {
            player.active(false);
        });
        player.active(true);
        this.activePlayer = player;
    }

    addPlayer = (player: PlayerViewModel) => {
        this.currentPlayers.push(player);
        this.benchedPlayers.remove(player);
    }

    removePlayer = (player:PlayerViewModel) => {
        this.currentPlayers.remove(player);
        this.benchedPlayers.push(player);
    }

    makeSubtitutions =()=> {
        this.makingSubstitutions(true);
    }

    doneMakingSubstitutions=()=> {
        this.makingSubstitutions(false);
    }

    activateButton(buttonToActivate: string) {
        this.activeButton(buttonToActivate);
    }

    recordHome() {
        this.game.newAction(new Action(this.activeButton(), this.currentPeriod(), this.activePlayer, this.coords));

        this.activeButton('');
        _.each(this.currentPlayers(), (player) => {
            player.active(false);
        });
    }

    activate = () => {
    }

    setCurrentPeriod = (period : number) => {
        this.currentPeriod(period);
    }
} 

export class Game {
    private actions = new Array<Action>();

    newAction(action) {
        this.actions.push(action);
    }
}

export class Action {
    time: number;
    action: string;
    quarter: number;
    player: PlayerViewModel;
    coords: Array<number>;

    constructor(action: string, qtr: number, player: PlayerViewModel, coords?: Array<number>) {
        this.action = action;
        this.quarter = qtr;
        this.player = player;
        this.coords = coords;
        this.time = moment().valueOf();
    }
}
return new DashBoardViewModel();