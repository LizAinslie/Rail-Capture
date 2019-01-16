/* global chrome, Image, Blob, atob, $ */

var Constants = {
	w: 500,
	h: 500,
	x: 200,
	y: 200,
	urls: [
		'https://i.railrunner16.me/sharex',
		'https://api.imgur.com/3/image',
	],
};

var contentURL = '';
 
function cropData(str, coords, callback) {
	var img = new Image();
	
	img.onload = function() {
		var canvas = document.createElement('canvas');
		canvas.width = coords.w;
		canvas.height = coords.h;
	
		var ctx = canvas.getContext('2d');
	
		ctx.drawImage(img, coords.x, coords.y, coords.w, coords.h, 0, 0, coords.w, coords.h);
		
		callback({dataUri: canvas.toDataURL()});
	};
	
	img.src = str;
}
 
function capture(coords) {
	chrome.tabs.captureVisibleTab(null, {format: "png"}, function(data) {
		cropData(data, coords, function(data) {
			saveFile(data.dataUri);
		});
	});
}
 
chrome.browserAction.onClicked.addListener(function(tab) {
	contentURL = tab.url;

	sendMessage({type: 'start-screenshots'}, tab);
});

chrome.extension.onMessage.addListener(gotMessage);
 
function gotMessage(request, sender, sendResponse) {
	if (request.type == "coords") capture(request.coords);
 
	sendResponse({}); // snub them.
}
 
function sendMessage(msg, tab) {
	chrome.tabs.sendMessage(tab.id, msg, function(response) {});
}

function saveFile(dataURI) {
	// convert base64 to raw binary data held in a string
	// doesn't handle URLEncoded DataURIs
	var byteString = atob(dataURI.split(',')[1]);

	// separate out the mime component
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	// write the bytes of the string to an ArrayBuffer
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	
	// create a blob for writing to a file
	var blob = new Blob([ab], {
		type: mimeString
	});
	
	var formData = new FormData(), service;
	
	chrome.storage.sync.get({
		username: null,
		password: null,
		service: '1',
	}, function(items) {
		service = items.service;

		switch (service) {
			case '0':
				if (!items.username || !items.password) return alert(chrome.i18n.getMessage('errNoAuth', 'i.railrunner16.me'));
				formData.append('user', items.username);
				formData.append('pass', items.password);
				formData.append('file', blob);
				break;
			case '1':
				formData.append('image', blob);
				break;
			default:
				break;
		}

		var uploadUrl = Constants.urls[service];
	
		$.ajax({
			type: 'POST',
			url: uploadUrl,
			data: formData,
			contentType: false,
			processData: false,
			beforeSend(xhr) {
				switch (service) {
					case '0':
						break;
					case '1':
						console.log('imgur');
						xhr.setRequestHeader('Authorization', 'Client-ID 77574c7ca6bd774');
						break;
				}
			},
			success(res) {
				var url;
				switch (service) {
					case '0':
						url = 'https://i.railrunner16.me/' + res.file;
						break;
					case '1':
						url = res.data.link;
						break;
					default:
						break;
				}

				copyToClipboard(url);
				openInNewTab(url);
			},
			error(xhr) {
				alert(chrome.i18n.getMessage('errGenric', xhr.status + ' ' + xhr.statusText));
			}
		});
	});
}

function copyToClipboard(text) {
	try {
		const input = document.createElement('input');
		input.style.position = 'fixed';
		input.style.opacity = 0;
		input.value = text;
		document.body.appendChild(input);
		input.select();
		document.execCommand('Copy');
		document.body.removeChild(input);
	} catch (e) {
		alert(chrome.i18n.getMessage('errClipboard', e.toString()));
	}
}

function openInNewTab(url) {
	chrome.tabs.create({
		url,
	});
}
