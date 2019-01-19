/* global chrome, angular */

const app = angular.module('railCapture', []);

app.controller('configPage', function($scope) {
	$scope.browser = chrome || browser;
	$scope.values = {
		username: '',
		password: '',
		service: '1',
		apiKey: '',
	};
	$scope.showMsg = false;
	
	$scope.translations = {
		service: $scope.browser.i18n.getMessage('ui_options_label_service'),
		username: $scope.browser.i18n.getMessage('ui_options_label_username'),
		password: $scope.browser.i18n.getMessage('ui_options_label_password'),
		apiKey: $scope.browser.i18n.getMessage('ui_options_label_api_key'),
		save: $scope.browser.i18n.getMessage('ui_options_button_save'),
		messageHeader: $scope.browser.i18n.getMessage('ui_options_message_header'),
		messageText: $scope.browser.i18n.getMessage('ui_options_message_text'),
		menu: {
			optionsLink: $scope.browser.i18n.getMessage('ui_menu_options_link'),
		},
		uploaderTypes: {
			apiKey: $scope.browser.i18n.getMessage('ui_options_uploadertype_apikey'),
			user: $scope.browser.i18n.getMessage('ui_options_uploadertype_user'),
			anonymous: $scope.browser.i18n.getMessage('ui_options_uploadertype_anonymous'),
		}
	};
	
	$scope.hideMsg = () => {
		$scope.showMsg = false;
	};
	
	$scope.save = () => {
		console.log($scope.values.apiKey);
		$scope.browser.storage.sync.set($scope.values, function() {
			$scope.showMsg = true;
		});
	};

	$scope.restore = () => {
		$scope.browser.storage.sync.get({
			username: '',
			password: '',
			service: '1',
			apiKey: '',
		}, items => {
			$scope.values = items;
		});
	};

	$scope.restore();
});