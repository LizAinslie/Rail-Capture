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
		save: $scope.browser.i18n.getMessage('ui_actions_save'),
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

app.controller('editorPage', function($scope) {
	$scope.browser = chrome || browser;
	$scope.color = '#dd4535';
	$scope.lineWidth = 10;
	$scope.editor = new Editor({
		renderDiv: 'editor',
		defaults: {
			color: $scope.color,
			width: $scope.lineWidth,
		},
		height: 600,
	});

	$scope.saveColor = () => {
		$scope.editor.setColor($scope.color);
	};

	$scope.saveLineWidth = () => {
		$scope.editor.setLineWidth($scope.lineWidth);
	};

	$scope.translations = {
		colorPlaceholder:  $scope.browser.i18n.getMessage('ui_editor_input_color'),
		lineWidthPlaceholder:  $scope.browser.i18n.getMessage('ui_editor_input_linewidth'),
		save: $scope.browser.i18n.getMessage('ui_actions_save'),
	};

	$scope.browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if(request.type = 'edit') $scope.editor.loadImageFromDataUri(request.data);

		sendResponse({});
	});
	
	$scope.save = () => {
		$scope.browser.runtime.sendMessage({type: 'save-img', data: $scope.editor.toDataUri()}, response => {});
		$scope.exit();
	};

	$scope.exit = () => {
		$scope.browser.tabs.query({
			currentWindow: true,
			active: true
		}, tabs => {
			$scope.browser.tabs.discard(tabs[0].id);
		});
	};

	document.addEventListener('keydown', e => {
		e.preventDefault();
		e.stopPropagation();

		if (e.keyCode == 13) $scope.save();
		else if (e.keyCode == 27) $scope.exit();
		else return true;

		return false;
	});
});