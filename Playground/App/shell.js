define(function (require) {
	var router = require('plugins/router');

	return {
		router: router,
		activate: function () {
			router.map([
				{ route: '', title: 'Home', moduleId: 'dashboard', nav: true }
			]).buildNavigationModel();
			return router.activate();
		}
	};
});