requirejs.config({
	paths: {
		'text': '../../Scripts/text',
		'durandal': '../../Scripts/durandal',
		'plugins': '../../Scripts/durandal/plugins',
		'transitions': '../../Scripts/durandal/transitions',
		'knockout': '../../Scripts/knockout-3.1.0',
		'koPunches': '../../Scripts/knockout.punches',
		'moment': '../../Scripts/moment',
		'jquery': '../../Scripts/jquery-1.9.1',
		'lodash': '../../Scripts/lodash'
	}
});
define(function (require) {
	var system = require('durandal/system'),
			app = require('durandal/app');

	system.debug(true);
	app.title = 'Durandal Starter Kit';
	app.configurePlugins({
		router: true,
		dialog: true
	});
	app.start().then(function () {
		app.setRoot('shell');
	});
});