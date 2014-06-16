define(["require", "exports", 'knockout', 'lodash', 'moment', 'modules/gameService'], function(require, exports, ko, _, moment, gameService) {
    var PlayerStatViewModel = (function () {
        function PlayerStatViewModel(name, num, clientId, serverId) {
            var _this = this;
            this.playing = ko.observable(false);
            this.active = ko.observable(false);
            this.fieldGoalAttempts = ko.observable(0);
            this.twoPointersMade = ko.observable(0);
            this.threePointersMade = ko.observable(0);
            this.effectiveFieldGoalPercentage = ko.computed(function () {
                if (_this.fieldGoalAttempts() == 0)
                    return '0%';
                return (parseFloat(((_this.twoPointersMade() + (1.5 * _this.threePointersMade())) / _this.fieldGoalAttempts()).toFixed(2)) * 100).toString() + '%';
            });
            this.freeThrowAttempts = ko.observable(0);
            this.freeThrowsMade = ko.observable(0);
            this.freeThrowPercentage = ko.computed(function () {
                if (_this.freeThrowAttempts() == 0)
                    return '0%';
                return (parseFloat((_this.freeThrowsMade() / _this.freeThrowAttempts()).toFixed(2)) * 100).toString();
            });
            this.defensiveRebounds = ko.observable(0);
            this.offensiveRebounds = ko.observable(0);
            this.committedFouls = ko.observable(0);
            this.forcedFouls = ko.observable(0);
            this.passTurnover = ko.observable(0);
            this.stealTurnovers = ko.observable(0);
            this.name = name;
            this.playerNumber = num;
            this.clientId = clientId;
            this.serverId = serverId;
        }
        return PlayerStatViewModel;
    })();
    exports.PlayerStatViewModel = PlayerStatViewModel;

    var DashBoardViewModel = (function () {
        function DashBoardViewModel() {
            var _this = this;
            this.GameService = new gameService.GameService();
            this.currentPeriod = ko.observable(1);
            this.editPlayersMode = ko.observable(false);
            this.makingSubstitutions = ko.observable(false);
            this.activeButton = ko.observable('');
            this.activeAwayButton = ko.observable('');
            this.homeScore = ko.observable(0);
            this.awayScore = ko.observable(0);
            this.activePlayer = null;
            this.coords = null;
            this.plays = ko.observableArray();
            this.playerStats = ko.observableArray();
            this.homeFieldGoalAttempts = ko.observable(0);
            this.awayFieldGoalAttempts = ko.observable(0);
            this.diffFieldGoalAttempts = ko.computed(function () {
                return _this.homeFieldGoalAttempts() - _this.awayFieldGoalAttempts();
            });
            this.homeTwoPointersMade = ko.observable(0);
            this.awayTwoPointersMade = ko.observable(0);
            this.diffTwoPointersMade = ko.computed(function () {
                return _this.homeFieldGoalAttempts() - _this.awayFieldGoalAttempts();
            });
            this.homeThreePointersMade = ko.observable(0);
            this.awayThreePointersMade = ko.observable(0);
            this.diffThreePointersMade = ko.computed(function () {
                return _this.homeThreePointersMade() - _this.awayThreePointersMade();
            });
            this.homeEffectiveFieldGoalPercentage = ko.computed(function () {
                if (_this.homeFieldGoalAttempts() == 0)
                    return '0%';
                return (parseFloat(((_this.homeTwoPointersMade() + (1.5 * _this.homeThreePointersMade())) / _this.homeFieldGoalAttempts()).toFixed(2)) * 100).toString() + '%';
            });
            this.awayEffectiveFieldGoalPercentage = ko.computed(function () {
                if (_this.awayFieldGoalAttempts() == 0)
                    return '0%';
                return (parseFloat(((_this.awayTwoPointersMade() + (1.5 * _this.awayThreePointersMade())) / _this.awayFieldGoalAttempts()).toFixed(2)) * 100).toString() + '%';
            });
            this.diffEffectiveFieldGoalPercentage = ko.computed(function () {
                return parseInt(_this.homeEffectiveFieldGoalPercentage()) - parseInt(_this.awayEffectiveFieldGoalPercentage());
            });
            this.homeFreeThrowAttempts = ko.observable(0);
            this.awayFreeThrowAttempts = ko.observable(0);
            this.diffFreeThrowAttempts = ko.computed(function () {
                return _this.homeFreeThrowAttempts() - _this.awayFreeThrowAttempts();
            });
            this.homeFreeThrowsMade = ko.observable(0);
            this.awayFreeThrowsMade = ko.observable(0);
            this.diffFreeThrowsMade = ko.computed(function () {
                return _this.homeFreeThrowsMade() - _this.awayFreeThrowsMade();
            });
            this.homeFreeThrowPercentage = ko.computed(function () {
                if (_this.homeFreeThrowAttempts() == 0)
                    return '0%';
                return (parseFloat((_this.homeFreeThrowsMade() / _this.homeFreeThrowAttempts()).toFixed(2)) * 100).toString() + '%';
            });
            this.awayFreeThrowPercentage = ko.computed(function () {
                if (_this.awayFreeThrowAttempts() == 0)
                    return '0%';
                return (parseFloat((_this.awayFreeThrowsMade() / _this.awayFreeThrowAttempts()).toFixed(2)) * 100).toString() + '%';
            });
            this.diffFreeThrowPercentage = ko.computed(function () {
                return (parseInt(_this.homeFreeThrowPercentage()) - parseInt(_this.awayFreeThrowPercentage())) + '%';
            });
            this.homeDefensiveRebounds = ko.observable(0);
            this.awayDefensiveRebounds = ko.observable(0);
            this.diffDefensiveRebounds = ko.computed(function () {
                return _this.homeDefensiveRebounds() - _this.awayDefensiveRebounds();
            });
            this.homeOffensiveRebounds = ko.observable(0);
            this.awayOffensiveRebounds = ko.observable(0);
            this.homeOffensiveReboundPercentage = ko.computed(function () {
                if (_this.homeOffensiveRebounds() == 0)
                    return '0%';
                else if (_this.awayDefensiveRebounds() == 0)
                    return '100%';
                return (parseFloat((_this.homeOffensiveRebounds() / (_this.homeOffensiveRebounds() + _this.awayDefensiveRebounds())).toFixed(2)) * 100).toString() + '%';
            });
            this.awayOffensiveReboundPercentage = ko.computed(function () {
                if (_this.awayOffensiveRebounds() == 0)
                    return '0%';
                else if (_this.homeDefensiveRebounds() == 0)
                    return '100%';
                return (parseFloat((_this.awayOffensiveRebounds() / (_this.awayOffensiveRebounds() + _this.homeDefensiveRebounds())).toFixed(2)) * 100).toString() + '%';
            });
            this.diffOffensiveReboundPercentage = ko.computed(function () {
                return (parseInt(_this.homeOffensiveReboundPercentage()) - parseInt(_this.awayOffensiveReboundPercentage())) + '%';
            });
            this.homeDefensiveReboundPercentage = ko.computed(function () {
                if (_this.homeDefensiveRebounds() == 0)
                    return '0%';
                else if (_this.awayOffensiveRebounds() == 0)
                    return '100%';
                return (parseFloat((_this.homeDefensiveRebounds() / (_this.homeDefensiveRebounds() + _this.awayOffensiveRebounds())).toFixed(2)) * 100).toString() + '%';
            });
            this.awayDefensiveReboundPercentage = ko.computed(function () {
                if (_this.awayDefensiveRebounds() == 0)
                    return '0%';
                else if (_this.homeOffensiveRebounds() == 0)
                    return '100%';
                return (parseFloat((_this.awayDefensiveRebounds() / (_this.awayDefensiveRebounds() + _this.homeOffensiveRebounds())).toFixed(2)) * 100).toString() + '%';
            });
            this.diffDefensiveReboundPercentage = ko.computed(function () {
                return (parseInt(_this.homeDefensiveReboundPercentage()) - parseInt(_this.awayDefensiveReboundPercentage())) + '%';
            });
            this.homeCommittedFouls = ko.observable(0);
            this.awayCommittedFouls = ko.observable(0);
            this.diffCommittedFouls = ko.computed(function () {
                return _this.homeCommittedFouls() - _this.awayCommittedFouls();
            });
            this.homeForcedFouls = ko.observable(0);
            this.awayForcedFouls = ko.observable(0);
            this.diffForcedFouls = ko.computed(function () {
                return _this.homeForcedFouls() - _this.awayForcedFouls();
            });
            this.homePassTurnover = ko.observable(0);
            this.awayPassTurnover = ko.observable(0);
            this.diffPassTurnover = ko.computed(function () {
                return _this.homePassTurnover() - _this.awayPassTurnover();
            });
            this.homeStealTurnovers = ko.observable(0);
            this.awayStealTurnovers = ko.observable(0);
            this.diffStealTurnovers = ko.computed(function () {
                return _this.homeStealTurnovers() - _this.awayStealTurnovers();
            });
            this.benchedPlayers = ko.computed(function () {
                var playerStats = new Array();
                _.each(_this.playerStats(), function (player) {
                    if (!player.playing()) {
                        playerStats.push(player);
                    }
                });
                return playerStats;
            });
            this.currentPlayers = ko.computed(function () {
                var playerStats = new Array();
                _.each(_this.playerStats(), function (player) {
                    if (player.playing()) {
                        playerStats.push(player);
                    }
                });
                return playerStats;
            });
            this.homeRecordEnabled = ko.computed(function () {
                var buttonActive = false;
                if (_this.activeButton() != '') {
                    buttonActive = true;
                    var playerActive = false;

                    _.each(_this.currentPlayers(), function (player) {
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
            this.awayRecordEnabled = ko.computed(function () {
                return _this.activeAwayButton() != '';
            });
            this.choosePlayer = function (player) {
                _.each(_this.currentPlayers(), function (player) {
                    player.active(false);
                });
                player.active(true);
                _this.activePlayer = player;
            };
            this.addPlayer = function (player) {
                player.playing(true);
            };
            this.removePlayer = function (player) {
                player.playing(false);
            };
            this.makeSubtitutions = function () {
                _this.makingSubstitutions(true);
            };
            this.doneMakingSubstitutions = function () {
                _this.makingSubstitutions(false);
            };
            this.activate = function (clientId, serverId) {
                _this.clientId = clientId;

                _this.plays([]);
                _this.playerStats([]);

                _this.GameService.getGame(serverId).done(function (response) {
                    _this.fillPlays(response.plays);
                    _this.fillPlayerStats(response.playerStats);
                }).fail(function () {
                    if (localStorage.getItem('game-' + clientId)) {
                        _this.fillPlays(JSON.parse(localStorage.getItem('game-' + clientId)).plays);
                        _this.fillPlayerStats(JSON.parse(localStorage.getItem('game-' + clientId)).playerStats);
                    } else {
                        _this.GameService.getPlayers().done(function (response) {
                            _this.fillPlayers(response.players);
                        }).fail(function () {
                            if (localStorage.getItem('players')) {
                                _this.fillPlayers(JSON.parse(localStorage.getItem('players')));
                            }
                        });
                    }
                });
            };
            this.setCurrentPeriod = function (period) {
                _this.currentPeriod(period);
            };
        }
        DashBoardViewModel.prototype.activateButton = function (buttonToActivate) {
            this.activeButton(buttonToActivate);
        };

        DashBoardViewModel.prototype.activateAwayButton = function (buttonToActivate) {
            this.activeAwayButton(buttonToActivate);
        };

        DashBoardViewModel.prototype.save = function () {
            var game = { plays: this.plays(), playerStats: this.playerStats() };
            this.GameService.saveGame(game);
            localStorage.setItem('game-' + this.clientId, ko.toJSON(game));
        };

        DashBoardViewModel.prototype.recordAway = function () {
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
        };

        DashBoardViewModel.prototype.recordHome = function () {
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
            _.each(this.currentPlayers(), function (player) {
                player.active(false);
            });
        };

        DashBoardViewModel.prototype.fillPlayers = function (players) {
            var _this = this;
            _.each(players, function (player) {
                _this.playerStats.push(new PlayerStatViewModel(player.name, player.playerNumber, player.clientId, player.serverId));
            });
        };

        DashBoardViewModel.prototype.fillPlays = function (plays) {
            var _this = this;
            _.each(plays, function (play) {
                _this.plays.push(new Action(play.action, play.qtr, play.playerNumber, play.playerName));
            });
        };

        DashBoardViewModel.prototype.fillPlayerStats = function (playerStats) {
            var _this = this;
            _.each(playerStats, function (playerStat) {
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

                _this.playerStats.push(vm);
            });
        };
        return DashBoardViewModel;
    })();
    exports.DashBoardViewModel = DashBoardViewModel;

    var Action = (function () {
        function Action(action, qtr, playerNumber, playerName, coords) {
            var _this = this;
            this.explain = function () {
                if (_this.playerNumber && _this.playerName) {
                    return '<b>#' + _this.playerNumber + ' ' + _this.playerName + '</b> ' + _this.action;
                } else {
                    return '<b>Opponents</b> ' + _this.action;
                }
            };
            this.action = action;
            this.quarter = qtr;
            this.playerNumber = playerNumber;
            this.playerName = playerName;
            this.coords = coords;
            this.time = moment().valueOf();
        }
        return Action;
    })();
    exports.Action = Action;
    return new DashBoardViewModel();
});
//# sourceMappingURL=dashboard.js.map
