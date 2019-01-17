/* global chrome, angular, $ */

var app = angular.module('railCapture', []);

app.controller('configPage', function($scope) {
	$scope.username = '';
	$scope.password = '';
	$scope.service = '1';
	$scope.apiKey = '';
	$scope.showMsg = false;
	
	$scope.hideMsg = function() {
		$scope.showMsg = false;
	};
	
	$scope.save = function() {
		switch ($scope.service) {
			case '0':
				chrome.storage.sync.set({
					username: $scope.username,
					password: $scope.password,
					service: $scope.service,
				}, function() {
					$scope.showMsg = true;
				});
				break;
			case '1':
				chrome.storage.sync.set({
					service: $scope.service,
				}, function() {
					$scope.showMsg = true;
				});
				break;
			case '2':
				chrome.storage.sync.set({
					apiKey: $scope.apiKey,
					service: $scope.service,
				}, function() {
					$scope.showMsg = true;
				});
				break;
			default:
				break;
		}
	};

	$scope.restore = function() {
		chrome.storage.sync.get({
			username: '',
			password: '',
			service: '1',
			apiKey: '',
		}, function(items) {
			$scope.username = items.username;
			$scope.password = items.password;
			$scope.apiKey = items.apiKey
			$scope.service = items.service;
		});
	};

	$scope.restore();
});