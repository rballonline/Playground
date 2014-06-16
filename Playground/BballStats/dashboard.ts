import ko = require('knockout');
import _ = require('lodash');
import moment = require('moment');
import gameService = require('modules/gameService');

export class PlayerStatViewModel {
    name: string;
    playerNumber: number;
    clientId: string;
    serverId: string;
    playing = ko.observable<boolean>(false);

    active = ko.observable<boolean>(false);

    fieldGoalAttempts = ko.observable<number>(0);
    twoPointersMade = ko.observable<number>(0);
    threePointersMade = ko.observable<number>(0);
    effectiveFieldGoalPercentage = ko.computed<string>(() => {
        if (this.fieldGoalAttempts() == 0) return '0%';
        return (parseFloat(((this.twoPointersMade() + (1.5 * this.threePointersMade())) / this.fieldGoalAttempts()).toFixed(2)) * 100).toString() + '%';
    });
    freeThrowAttempts = ko.observable<number>(0);
    freeThrowsMade = ko.observable<number>(0);
    freeThrowPercentage = ko.computed<string>(() => {
        if (this.freeThrowAttempts() == 0) return '0%';
        return (parseFloat((this.freeThrowsMade() / this.freeThrowAttempts()).toFixed(2)) * 100).toString();
    });
    defensiveRebounds = ko.observable<number>(0);
    offensiveRebounds = ko.observable<number>(0);
    committedFouls = ko.observable<number>(0);
    forcedFouls = ko.observable<number>(0);
    passTurnover = ko.observable<number>(0);
    stealTurnovers = ko.observable<number>(0);

    constructor(name: string, num: number, clientId: string, serverId: string) {
        this.name = name;
        this.playerNumber = num;
        this.clientId = clientId;
        this.serverId = serverId;
    }
}

export class DashBoardViewModel {
    private GameService = new gameService.GameService();

    clientId;
    currentPeriod = ko.observable<number>(1);
    editPlayersMode = ko.observable<boolean>(false);
    makingSubstitutions = ko.observable<boolean>(false);
    activeButton = ko.observable<string>('');
    activeAwayButton = ko.observable<string>('');
    homeScore = ko.observable<number>(0);
    awayScore = ko.observable<number>(0);
    activePlayer: PlayerStatViewModel = null;
    coords: Array<number> = null;

    plays = ko.observableArray<Action>();
    playerStats = ko.observableArray<PlayerStatViewModel>();

    homeFieldGoalAttempts = ko.observable<number>(0);
    awayFieldGoalAttempts = ko.observable<number>(0);
    diffFieldGoalAttempts = ko.computed<number>(() => {
        return this.homeFieldGoalAttempts() - this.awayFieldGoalAttempts();
    });
    homeTwoPointersMade = ko.observable<number>(0);
    awayTwoPointersMade = ko.observable<number>(0);
    diffTwoPointersMade = ko.computed<number>(() => {
        return this.homeFieldGoalAttempts() - this.awayFieldGoalAttempts();
    });
    homeThreePointersMade = ko.observable<number>(0);
    awayThreePointersMade = ko.observable<number>(0);
    diffThreePointersMade = ko.computed<number>(() => {
        return this.homeThreePointersMade() - this.awayThreePointersMade();
    });
    homeEffectiveFieldGoalPercentage = ko.computed<string>(() => {
        if (this.homeFieldGoalAttempts() == 0) return '0%';
        return (parseFloat(((this.homeTwoPointersMade() + (1.5 * this.homeThreePointersMade())) / this.homeFieldGoalAttempts()).toFixed(2)) * 100).toString() + '%';
    });
    awayEffectiveFieldGoalPercentage = ko.computed<string>(() => {
        if (this.awayFieldGoalAttempts() == 0) return '0%';
        return (parseFloat(((this.awayTwoPointersMade() + (1.5 * this.awayThreePointersMade())) / this.awayFieldGoalAttempts()).toFixed(2)) * 100).toString() + '%';
    });
    diffEffectiveFieldGoalPercentage = ko.computed<number>(() => {
        return parseInt(this.homeEffectiveFieldGoalPercentage()) - parseInt(this.awayEffectiveFieldGoalPercentage());
    });
    homeFreeThrowAttempts = ko.observable<number>(0);
    awayFreeThrowAttempts = ko.observable<number>(0);
    diffFreeThrowAttempts = ko.computed<number>(() => {
        return this.homeFreeThrowAttempts() - this.awayFreeThrowAttempts();
    });
    homeFreeThrowsMade = ko.observable<number>(0);
    awayFreeThrowsMade = ko.observable<number>(0);
    diffFreeThrowsMade = ko.computed<number>(() => {
        return this.homeFreeThrowsMade() - this.awayFreeThrowsMade();
    });

    homeFreeThrowPercentage = ko.computed<string>(() => {
        if (this.homeFreeThrowAttempts() == 0) return '0%';
        return (parseFloat((this.homeFreeThrowsMade() / this.homeFreeThrowAttempts()).toFixed(2)) * 100).toString() + '%';
    });
    awayFreeThrowPercentage = ko.computed<string>(() => {
        if (this.awayFreeThrowAttempts() == 0) return '0%';
        return (parseFloat((this.awayFreeThrowsMade() / this.awayFreeThrowAttempts()).toFixed(2)) * 100).toString() + '%';
    });
    diffFreeThrowPercentage = ko.computed<string>(() => {
        return (parseInt(this.homeFreeThrowPercentage()) - parseInt(this.awayFreeThrowPercentage())) +  '%';
    });

    homeDefensiveRebounds = ko.observable<number>(0);
    awayDefensiveRebounds = ko.observable<number>(0);
    diffDefensiveRebounds = ko.computed<number>(() => { return this.homeDefensiveRebounds() - this.awayDefensiveRebounds() });
    homeOffensiveRebounds = ko.observable<number>(0);
    awayOffensiveRebounds = ko.observable<number>(0);
    
    homeOffensiveReboundPercentage = ko.computed<string>(() => {
        if (this.homeOffensiveRebounds() == 0) return '0%';
        else if (this.awayDefensiveRebounds() == 0) return '100%';
        return (parseFloat((this.homeOffensiveRebounds() / (this.homeOffensiveRebounds() + this.awayDefensiveRebounds())).toFixed(2)) * 100).toString() + '%';
    });
    awayOffensiveReboundPercentage = ko.computed<string>(() => {
        if (this.awayOffensiveRebounds() == 0) return '0%';
        else if (this.homeDefensiveRebounds() == 0) return '100%';
        return (parseFloat((this.awayOffensiveRebounds() / (this.awayOffensiveRebounds() + this.homeDefensiveRebounds())).toFixed(2)) * 100).toString() + '%';
    });
    diffOffensiveReboundPercentage = ko.computed<string>(() => { return (parseInt(this.homeOffensiveReboundPercentage()) - parseInt(this.awayOffensiveReboundPercentage())) + '%' });

    homeDefensiveReboundPercentage = ko.computed<string>(() => {
        if (this.homeDefensiveRebounds() == 0) return '0%';
        else if (this.awayOffensiveRebounds() == 0) return '100%';
        return (parseFloat((this.homeDefensiveRebounds() / (this.homeDefensiveRebounds() + this.awayOffensiveRebounds())).toFixed(2)) * 100).toString() + '%';
    });
    awayDefensiveReboundPercentage = ko.computed<string>(() => {
        if (this.awayDefensiveRebounds() == 0) return '0%';
        else if (this.homeOffensiveRebounds() == 0) return '100%';
        return (parseFloat((this.awayDefensiveRebounds() / (this.awayDefensiveRebounds() + this.homeOffensiveRebounds())).toFixed(2)) * 100).toString() + '%';
    });
    diffDefensiveReboundPercentage = ko.computed<string>(() => { return (parseInt(this.homeDefensiveReboundPercentage()) - parseInt(this.awayDefensiveReboundPercentage())) + '%' });

    homeCommittedFouls = ko.observable<number>(0);
    awayCommittedFouls = ko.observable<number>(0);
    diffCommittedFouls = ko.computed<number>(() => { return this.homeCommittedFouls() - this.awayCommittedFouls() });
    homeForcedFouls = ko.observable<number>(0);
    awayForcedFouls = ko.observable<number>(0);
    diffForcedFouls = ko.computed<number>(() => { return this.homeForcedFouls() - this.awayForcedFouls() });
    homePassTurnover = ko.observable<number>(0);
    awayPassTurnover = ko.observable<number>(0);
    diffPassTurnover = ko.computed<number>(() => { return this.homePassTurnover() - this.awayPassTurnover() });
    homeStealTurnovers = ko.observable<number>(0);
    awayStealTurnovers = ko.observable<number>(0);
    diffStealTurnovers = ko.computed<number>(() => { return this.homeStealTurnovers() - this.awayStealTurnovers() });

    benchedPlayers = ko.computed(() => {
        var playerStats = new Array<PlayerStatViewModel>();
        _.each(this.playerStats(), (player) => {
            if (!player.playing()) {
                playerStats.push(player);
            }
        });
        return playerStats;
    });

    currentPlayers = ko.computed(() => {
        var playerStats = new Array<PlayerStatViewModel>();
        _.each(this.playerStats(), (player) => {
            if (player.playing()) {
                playerStats.push(player);
            }
        });
        return playerStats;
    });

    constructor() {
    }

    homeRecordEnabled = ko.computed<boolean>(() => {
        var buttonActive = false;
        if (this.activeButton() != '') {
            buttonActive = true;
            var playerActive = false;

            _.each<PlayerStatViewModel>(this.currentPlayers(), (player) => {
                if (player.active()) {
                    playerActive = true;
                    return;
                }
            });
        }
        /*if (this.activeButton() == '2ptMade' || this.activeButton() == '2ptMiss' || this.activeButton() == '3ptMade' || this.activeButton() == '3ptMiss') {
            return this.coords != null && buttonActive && playerActive;
        }
        else {*/
            return buttonActive && playerActive;
        //}
    }, this);

    awayRecordEnabled = ko.computed<boolean>(() => {
        return this.activeAwayButton() != '';
    });

    choosePlayer = (player: PlayerStatViewModel) => {
        _.each<PlayerStatViewModel>(this.currentPlayers(), (player) => {
            player.active(false);
        });
        player.active(true);
        this.activePlayer = player;
    }

    addPlayer = (player: PlayerStatViewModel) => {
        player.playing(true);
    }

    removePlayer = (player:PlayerStatViewModel) => {
        player.playing(false);
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

    activateAwayButton(buttonToActivate: string) {
        this.activeAwayButton(buttonToActivate);
    }

    save() {
        var game = { plays: this.plays(), playerStats: this.playerStats() };
        this.GameService.saveGame(game);
        localStorage.setItem('game-' + this.clientId, ko.toJSON(game));
    }

    recordAway() {
        this.plays.unshift(new Action(this.activeAwayButton(), this.currentPeriod()));

        switch (this.activeAwayButton()) {
            case 'made 2 pointer':
                this.awayScore(this.awayScore() + 2);
                this.awayFieldGoalAttempts(this.awayFieldGoalAttempts() + 1);
                this.awayTwoPointersMade(this.awayTwoPointersMade() + 1);
                break;
            case 'missed 2 pointer':
                this.awayFieldGoalAttempts(this.awayFieldGoalAttempts() + 1);
                break;
            case 'made 3 pointer':
                this.awayScore(this.awayScore() + 3);
                this.awayFieldGoalAttempts(this.awayFieldGoalAttempts() + 1);
                this.awayThreePointersMade(this.awayThreePointersMade() + 1);
                break;
            case 'missed 3 pointer':
                this.awayFieldGoalAttempts(this.awayFieldGoalAttempts() + 1);
                break;
            case 'made free throw':
                this.awayScore(this.awayScore() + 1);
                this.awayFreeThrowAttempts(this.awayFreeThrowAttempts() + 1);
                this.awayFreeThrowsMade(this.awayFreeThrowsMade() + 1);
                break;
            case 'missed free throw':
                this.awayFreeThrowAttempts(this.awayFreeThrowAttempts() + 1);
                break;
            case 'made an offensive rebound':
                this.awayOffensiveRebounds(this.awayOffensiveRebounds() + 1);
                break;
            case 'made an defensive rebound':
                this.awayDefensiveRebounds(this.awayDefensiveRebounds() + 1);
                break;
            case 'committed a foul':
                this.awayCommittedFouls(this.awayCommittedFouls() + 1);
                break;
            case 'was forced to make a foul':
                this.awayForcedFouls(this.awayForcedFouls() + 1);
                break;
            case 'intercepted a pass':
                this.awayPassTurnover(this.awayPassTurnover() + 1);
                break;
            case 'stole the ball':
                this.awayStealTurnovers(this.awayStealTurnovers() + 1);
                break;
        }

        this.save();

        this.activeAwayButton('');
    }

    recordHome() {
        this.plays.unshift(new Action(this.activeButton(), this.currentPeriod(), this.activePlayer.playerNumber, this.activePlayer.name, this.coords));

        switch (this.activeButton()) {
            case 'made 2 pointer':
                this.homeScore(this.homeScore() + 2);
                this.activePlayer.fieldGoalAttempts(this.activePlayer.fieldGoalAttempts() + 1);
                this.activePlayer.twoPointersMade(this.activePlayer.twoPointersMade() + 1);
                this.homeFieldGoalAttempts(this.homeFieldGoalAttempts() + 1);
                this.homeTwoPointersMade(this.homeTwoPointersMade() + 1);
                break;
            case 'missed 2 pointer':
                this.activePlayer.fieldGoalAttempts(this.activePlayer.fieldGoalAttempts() + 1);
                this.homeFieldGoalAttempts(this.homeFieldGoalAttempts() + 1);
                break;
            case 'made 3 pointer':
                this.homeScore(this.homeScore() + 3);
                this.activePlayer.fieldGoalAttempts(this.activePlayer.fieldGoalAttempts() + 1);
                this.activePlayer.threePointersMade(this.activePlayer.threePointersMade() + 1);
                this.homeFieldGoalAttempts(this.homeFieldGoalAttempts() + 1);
                this.homeThreePointersMade(this.homeThreePointersMade() + 1);
                break;
            case 'missed 3 pointer':
                this.activePlayer.fieldGoalAttempts(this.activePlayer.fieldGoalAttempts() + 1);
                this.homeFieldGoalAttempts(this.homeFieldGoalAttempts() + 1);
                break;
            case 'made free throw':
                this.homeScore(this.homeScore() + 1);
                this.activePlayer.freeThrowAttempts(this.activePlayer.freeThrowAttempts() + 1);
                this.activePlayer.freeThrowsMade(this.activePlayer.freeThrowsMade() + 1);
                this.homeFreeThrowAttempts(this.homeFreeThrowAttempts() + 1);
                this.homeFreeThrowsMade(this.homeFreeThrowsMade() + 1);
                break;
            case 'missed free throw':
                this.activePlayer.freeThrowAttempts(this.activePlayer.freeThrowAttempts() + 1);
                this.homeFreeThrowAttempts(this.homeFreeThrowAttempts() + 1);
                break;
            case 'made an offensive rebound':
                this.activePlayer.offensiveRebounds(this.activePlayer.offensiveRebounds() + 1);
                this.homeOffensiveRebounds(this.homeOffensiveRebounds() + 1);
                break;
            case 'made an defensive rebound':
                this.activePlayer.defensiveRebounds(this.activePlayer.defensiveRebounds() + 1);
                this.homeDefensiveRebounds(this.homeDefensiveRebounds() + 1);
                break;
            case 'committed a foul':
                this.activePlayer.committedFouls(this.activePlayer.committedFouls() + 1);
                this.homeCommittedFouls(this.homeCommittedFouls() + 1);
                break;
            case 'was forced to make a foul':
                this.activePlayer.forcedFouls(this.activePlayer.forcedFouls() + 1);
                this.homeForcedFouls(this.homeForcedFouls() + 1);
                break;
            case 'intercepted a pass':
                this.activePlayer.passTurnover(this.activePlayer.passTurnover() + 1);
                this.homePassTurnover(this.homePassTurnover() + 1);
                break;
            case 'stole the ball':
                this.activePlayer.stealTurnovers(this.activePlayer.stealTurnovers() + 1);
                this.homeStealTurnovers(this.homeStealTurnovers() + 1);
                break;
        }

        this.save();

        this.activeButton('');
        _.each(this.currentPlayers(), (player) => {
            player.active(false);
        });
    }

    fillPlayers(players) {
        _.each(players, (player: any) => {
            this.playerStats.push(new PlayerStatViewModel(player.name, player.playerNumber, player.clientId, player.serverId));
        });
    }

    fillPlays(plays) {
        _.each(plays, (play: any) => {
            this.plays.push(new Action(play.action, play.qtr, play.playerNumber, play.playerName));
        });
    }

    fillPlayerStats(playerStats) {
        _.each(playerStats, (playerStat: any) => {
            var vm = new PlayerStatViewModel(playerStat.name, playerStat.playerNumber, playerStat.clientId, playerStat.serverId);

            vm.committedFouls(playerStat.committedFouls);
            vm.defensiveRebounds(playerStat.defensiveRebounds);
            vm.fieldGoalAttempts(playerStat.fieldGoalAttempts);
            vm.forcedFouls(playerStat.forcedFouls);
            vm.freeThrowAttempts(playerStat.freeThrowAttempts);
            vm.freeThrowsMade(playerStat.freeThrowsMade);
            vm.offensiveRebounds(playerStat.offensiveRebounds);
            vm.passTurnover(playerStat.passTurnover);
            vm.playing(playerStat.playing);
            vm.stealTurnovers(playerStat.stealTurnovers);
            vm.threePointersMade(playerStat.threePointersMade);
            vm.twoPointersMade(playerStat.twoPointersMade);

            this.playerStats.push(vm);
        });
    }

    activate = (clientId, serverId) => {
        this.clientId = clientId;

        this.plays([]);
        this.playerStats([]);

        this.GameService.getGame(serverId).done((response) => {
            this.fillPlays(response.plays);
            this.fillPlayerStats(response.playerStats);
        }).fail(() => {
            if (localStorage.getItem('game-' + clientId)) {
                this.fillPlays(JSON.parse(localStorage.getItem('game-' + clientId)).plays);
                this.fillPlayerStats(JSON.parse(localStorage.getItem('game-' + clientId)).playerStats);
            }
            else {
                this.GameService.getPlayers().done((response) => {
                    this.fillPlayers(response.players);
                }).fail(() => {
                    if (localStorage.getItem('players')) {
                        this.fillPlayers(JSON.parse(localStorage.getItem('players')));
                    }
                });
            }
        });
    }

    setCurrentPeriod = (period : number) => {
        this.currentPeriod(period);
    }
}

export class Action {
    time: number;
    action: string;
    quarter: number;
    playerNumber: number;
    playerName: string;
    coords: Array<number>;

    constructor(action: string, qtr: number, playerNumber?: number, playerName?: string, coords?: Array<number>) {
        this.action = action;
        this.quarter = qtr;
        this.playerNumber = playerNumber;
        this.playerName = playerName;
        this.coords = coords;
        this.time = moment().valueOf();
    }

    explain = () => {
        if (this.playerNumber && this.playerName) {
            return '<b>#' + this.playerNumber + ' ' + this.playerName + '</b> ' + this.action;
        }
        else {
            return '<b>Opponents</b> ' + this.action; 
        }
    }
}
return new DashBoardViewModel();