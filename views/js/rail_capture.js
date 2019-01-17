/* global chrome, angular, $ */

var app = angular.module('railCapture', []);

app.controller('configPage', function($scope) {
	$scope.username = '';
	$scope.password = '';
	$scope.service = '1';
	$scope.showMsg = false;
	
	$scope.hideMsg = function() {
		$scope.showMsg = false;
	};
	
	$scope.save = function() {
		chrome.storage.sync.set({
			username: $scope.username,
			password: $scope.password,
			service: $scope.service,
		}, function() {
			$scope.showMsg = true;
		});
	};

	$scope.restore = function() {
		chrome.storage.sync.get({
			username: '',
			password: '',
			service: '1',
		}, function(items) {
			$scope.username = items.username;
			$scope.password = items.password;
			$scope.service = items.service;
		});
	};

	$scope.restore();
});