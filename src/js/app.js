'use strict';

let _templateBase = '/dist/templates';

let app = angular.module('app', [
	'ngRoute',
	'ui.bootstrap',
	'ngAudio',
	'ngCookies'
]);

app.config(($routeProvider, $httpProvider) => {
	$routeProvider.when('/', {
		templateUrl: _templateBase + '/index.html',
		controller: 'AppController',
		controllerAs: 'controller'
	});

	$routeProvider.otherwise({ redirectTo: '/' });

	$httpProvider.defaults.withCredentials = true;

	$httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

});
