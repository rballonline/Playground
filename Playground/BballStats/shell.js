define(function (require) {
	var router = require('plugins/router');

	return {
		router: router,
		activate: function () {
			router.map([
				{ route: '', title: 'Games', moduleId: 'games', nav: false },
				{ route: 'players', title: 'Players', moduleId: 'players', nav: true },
				{ route: 'game/:clientId/:serverId', title: 'Game', moduleId: 'dashboard', nav: false },
			]).buildNavigationModel();
			return router.activate();
		}
	};
});