requirejs.config({
	paths: {
		'text': '../../Scripts/text',
		'durandal': '../../Scripts/durandal',
		'plugins': '../../Scripts/durandal/plugins',
		'transitions': '../../Scripts/durandal/transitions',
		'knockout': '../../Scripts/knockout-3.1.0',
		'koPunches': '../../Scripts/knockout.punches',
		'moment': '../../Scripts/moment'
		, 'jquery': '../Scripts/jquery-1.9.1.min'
		, 'lodash': '../../Scripts/lodash'
	}/*,
	shim: {
		"amplify": {
			deps: ['jquery'],
			exports: "amplify"
		}
	}*/
});
define(function (require) {
	require([], function () { // load global libraries
		var system = require('durandal/system'),
				app = require('durandal/app');

		system.debug(true);
		app.title = 'Basketball Stats';
		app.configurePlugins({
			router: true
		});
		app.start().then(function () {
			app.setRoot('shell');
		});
	});
});