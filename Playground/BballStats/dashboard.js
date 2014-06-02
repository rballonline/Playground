define(["require", "exports", 'knockout', 'lodash', 'moment'], function(require, exports, ko, _, moment) {
    var PlayerViewModel = (function () {
        function PlayerViewModel(name, num) {
            this.active = ko.observable(false);
            this.name = name;
            this.playerNumber = num;
        }
        return PlayerViewModel;
    })();
    exports.PlayerViewModel = PlayerViewModel;

    var DashBoardViewModel = (function () {
        function DashBoardViewModel() {
            var _this = this;
            this.currentPeriod = ko.observable(1);
            this.editPlayersMode = ko.observable(false);
            this.makingSubstitutions = ko.observable(false);
            this.activeButton = ko.observable('');
            this.homeScore = ko.observable(0);
            this.awayScore = ko.observable(0);
            this.activePlayer = null;
            this.coords = null;
            this.game = new Game();
            this.benchedPlayers = ko.observableArray();
            this.currentPlayers = ko.observableArray();
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
                if (_this.activeButton() == '2ptMade' || _this.activeButton() == '2ptMiss' || _this.activeButton() == '3ptMade' || _this.activeButton() == '3ptMiss') {
                    return _this.coords != null && buttonActive && playerActive;
                } else {
                    return buttonActive && playerActive;
                }
            }, this);
            this.choosePlayer = function (player) {
                _.each(_this.currentPlayers(), function (player) {
                    player.active(false);
                });
                player.active(true);
                _this.activePlayer = player;
            };
            this.addPlayer = function (player) {
                _this.currentPlayers.push(player);
                _this.benchedPlayers.remove(player);
            };
            this.removePlayer = function (player) {
                _this.currentPlayers.remove(player);
                _this.benchedPlayers.push(player);
            };
            this.makeSubtitutions = function () {
                _this.makingSubstitutions(true);
            };
            this.doneMakingSubstitutions = function () {
                _this.makingSubstitutions(false);
            };
            this.activate = function () {
            };
            this.setCurrentPeriod = function (period) {
                _this.currentPeriod(period);
            };
            this.currentPlayers.push(new PlayerViewModel('Ian', 5));
            this.currentPlayers.push(new PlayerViewModel('Noah', 55));
            this.currentPlayers.push(new PlayerViewModel('Jared', 35));
            this.currentPlayers.push(new PlayerViewModel('Eric', 15));
            this.currentPlayers.push(new PlayerViewModel('Kyren', 45));
            this.benchedPlayers.push(new PlayerViewModel('Kameron', 95));
            this.benchedPlayers.push(new PlayerViewModel('Dominic', 105));
        }
        DashBoardViewModel.prototype.activateButton = function (buttonToActivate) {
            this.activeButton(buttonToActivate);
        };

        DashBoardViewModel.prototype.recordHome = function () {
            this.game.newAction(new Action(this.activeButton(), this.currentPeriod(), this.activePlayer, this.coords));

            this.activeButton('');
            _.each(this.currentPlayers(), function (player) {
                player.active(false);
            });
        };
        return DashBoardViewModel;
    })();
    exports.DashBoardViewModel = DashBoardViewModel;

    var Game = (function () {
        function Game() {
            this.actions = new Array();
        }
        Game.prototype.newAction = function (action) {
            this.actions.push(action);
        };
        return Game;
    })();
    exports.Game = Game;

    var Action = (function () {
        function Action(action, qtr, player, coords) {
            this.action = action;
            this.quarter = qtr;
            this.player = player;
            this.coords = coords;
            this.time = moment().valueOf();
        }
        return Action;
    })();
    exports.Action = Action;
    return new DashBoardViewModel();
});
//# sourceMappingURL=dashboard.js.map
