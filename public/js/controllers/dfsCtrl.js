var myApp =  angular.module('myApp');

myApp.controller('dfsCtrl', function($scope, dfsSvc){



$scope.getFpData = dfsSvc.getFpData;




});