var myApp = angular.module('myApp');

myApp.service('dfsSvc', function($http) {

	this.getFpData = function(){

		$http.get('/api/scrape')
	}


});