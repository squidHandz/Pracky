var app = angular.module('myApp');

myApp.

config(function($stateProvider, $urlRouterProvider, $locationProvider) {

$urlRouterProvider.otherwise('/');

	$stateProvider

		.state('excel', {
			url: '/excelplus',
			templateUrl: '/views/excel.html',
			controller: 'excelCtrl'
		})

		.state('dfs', {
			url: '/dfs',
			templateUrl: '/views/dfs.html',
			controller: 'dfsCtrl'
		})

		.state('todo', {
			url: '/todoApp',
			templateUrl: '/views/todo.html',
			controller: 'todoCtrl'
		})

			.state('/', {
			url: '/'
		})

$locationProvider.html5Mode(true);

});