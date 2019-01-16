/* global chrome */

function save_options() {
	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;
	var service = parseInt(document.getElementById('service').value, 10);

	chrome.storage.sync.set({
		username,
		password,
		service,
	}, function() {
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';

		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}

function restore_options() {
	chrome.storage.sync.get({
		username: '',
		password: '',
		service: 0,
	}, function(items) {
		document.getElementById('username').value = items.username;
		document.getElementById('password').value = items.password;
		document.getElementById('service').value = items.service;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);