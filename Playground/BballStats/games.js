define(["require", "exports", 'knockout'], function(require, exports, ko) {
    var GameViewModel = (function () {
        function GameViewModel(id, name) {
            this.name = ko.observable();
            this.id = id;
            this.name(name);
        }
        return GameViewModel;
    })();

    var GamesViewModel = (function () {
        function GamesViewModel() {
            this.activate = function () {
            };
        }
        return GamesViewModel;
    })();
    return new GamesViewModel();
});
//# sourceMappingURL=games.js.map
