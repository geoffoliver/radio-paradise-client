'use strict';

let _templateBase = './dist/templates';

let app = angular.module('app', [
	'ngRoute',
	'ui.bootstrap'
]);

app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: _templateBase + '/index.html',
		controller: 'AppController'
	});
	$routeProvider.otherwise({ redirectTo: '/' });
}]);
