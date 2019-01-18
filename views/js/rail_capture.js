/* global chrome, angular */

var app = angular.module('railCapture', []);

app.controller('configPage', function($scope) {
	$scope.values = {
		username: '',
		password: '',
		service: '1',
		apiKey: '',
	};
	$scope.showMsg = false;
	
	$scope.translations = {
		service: chrome.i18n.getMessage('ui_options_label_service'),
		username: chrome.i18n.getMessage('ui_options_label_username'),
		password: chrome.i18n.getMessage('ui_options_label_password'),
		apiKey: chrome.i18n.getMessage('ui_options_label_api_key'),
		save: chrome.i18n.getMessage('ui_options_button_save'),
		messageHeader: chrome.i18n.getMessage('ui_options_message_header'),
		messageText: chrome.i18n.getMessage('ui_options_message_text'),
		menu: {
			optionsLink: chrome.i18n.getMessage('ui_menu_options_link'),
		},
	};
	
	$scope.hideMsg = function() {
		$scope.showMsg = false;
	};
	
	$scope.save = function() {
		console.log($scope.values.apiKey);
		chrome.storage.sync.set($scope.values, function() {
			$scope.showMsg = true;
		});
	};

	$scope.restore = function() {
		chrome.storage.sync.get({
			username: '',
			password: '',
			service: '1',
			apiKey: '',
		}, function(items) {
			$scope.values = items;
		});
	};

	$scope.restore();
});