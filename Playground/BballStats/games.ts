import ko = require('knockout');
import _ = require('lodash');
import moment = require('moment');

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
    activate = () => {
    }
}
return new GamesViewModel();