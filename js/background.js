/* global chrome, Image, Blob, atob, $ */

const Constants = {
	w: 500,
	h: 500,
	x: 200,
	y: 200,
	services: [
		{
			url: 'https://i.railrunner16.me/sharex',
			name: 'i.railrunner16.me',
		},
		{
			url: 'https://api.imgur.com/3/image',
			name: 'Imgur',
		},
		{
			url: 'https://s-ul.eu/api/v1/upload',
			name: 'S-ul',
		},
		{
			url: 'https://vgy.me/upload',
			name: 'vgy.me',
		},
	],
};

let contentURL = '';

class ExtensionBackground {
	constructor() {
		this.browser = chrome || browser;

		this.capture = this.capture.bind(this);
		this.cropData = this.cropData.bind(this);
		this.saveFile = this.saveFile.bind(this);
		this.gotMessage = this.gotMessage.bind(this);
		this.initEvents = this.initEvents.bind(this);
		this.createNotif = this.createNotif.bind(this);
		this.sendMessage = this.sendMessage.bind(this);
		this.openInNewTab = this.openInNewTab.bind(this);
		this.copyToClipboard = this.copyToClipboard.bind(this);
		this.getUploadedFileName = this.getUploadedFileName.bind(this);

		this.initEvents();
	}

	getUploadedFileName() {
		const formattedTime = dateFormat(new Date, 'mm-dd-yyyy_HH-MM-ss-L', true)
		return `rail-caputure_upload_${formattedTime}`;
	}

	initEvents() {
		this.browser.commands.onCommand.addListener(command => {
			if (command == 'take-screenshot') this.browser.tabs.getSelected(null, function(tab) {
				contentURL = tab.url;
	
				this.sendMessage({
					type: 'start-screenshots',
				}, tab);
			});
		});

		this.browser.runtime.onMessage.addListener(this.gotMessage);

		this.browser.browserAction.onClicked.addListener(tab => {
			contentURL = tab.url;

			this.sendMessage({
				type: 'start-screenshots',
			}, tab);
		});
	}

	capture(coords) {
		this.browser.tabs.captureVisibleTab(null, {
			format: 'png'
		}, data => {
			this.cropData(data, coords, croppedData => {
				this.browser.tabs.create({url : "/views/editor.view.html"}, tab => {
					setTimeout(() => {
						this.sendMessage({
							type: 'edit',
							data: croppedData.dataUri,
						}, tab);
					}, 2000)
				});
			});
		});
	}

	cropData(str, coords, callback) {
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

	gotMessage(request, sender, sendResponse) {
		console.log(request, sender);
		if (request.type == 'coords') this.capture(request.coords);
		else if (request.type == 'save-img') this.saveFile(request.data);
	
		sendResponse({});
	}

	sendMessage(msg, tab) {
		this.browser.tabs.sendMessage(tab.id, msg, response => {});
	}

	createNotif(dataUri) {
		this.browser.notifications.create(this.url, {
			type: 'image',
			iconUrl: dataUri,
			title: 'Screenshot Taken',
			message: 'Click to view it at ' + this.url + '!',
			imageUrl: dataUri,
		});
	
		this.browser.notifications.onClicked.addListener(notifId => {
			this.openInNewTab(notifId);
		})
	}

	openInNewTab(url) {
		this.browser.tabs.create({
			url,
		});
	}

	copyToClipboard(text) {
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
			alert(this.browser.i18n.getMessage('error_clipboard', e.toString()));
		}
	}

	saveFile(dataURI) {
		const byteString = atob(dataURI.split(',')[1]);
		const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

		const ab = new ArrayBuffer(byteString.length);
		const ia = new Uint8Array(ab);
		for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		
		// create a blob for writing to a file
		const blob = new Blob([ab], {
			type: mimeString
		});
		
		const formData = new FormData();
		
		this.browser.storage.sync.get({
			username: '',
			password: '',
			service: '1',
			apiKey: '',
		}, items => {
			this.service = items.service;
	
			switch (this.service) {
				case '0':
					if (!items.username || !items.password) return alert(this.browser.i18n.getMessage('error_no_auth', 'i.railrunner16.me'));
					formData.append('user', items.username);
					formData.append('pass', items.password);
					formData.append('file', blob, this.getUploadedFileName());
					break;
				case '1':
					formData.append('image', blob, this.getUploadedFileName());
					break;
				case '2':
					if (!items.apiKey) return alert(this.browser.i18n.getMessage('error_no_api_key', 's-ul.eu'));
					formData.append('wizard', true);
					formData.append('key', items.apiKey);
					formData.append('file', blob, this.getUploadedFileName());
					break;
				case '3':
					if (!!items.apiKey) formData.append('userkey', items.apiKey);
					formData.append('file', blob, this.getUploadedFileName())
					break;
				default:
					break;
			}
	
			const uploader = Constants.services[this.service];
		
			$.ajax({
				type: 'POST',
				url: uploader.url,
				data: formData,
				contentType: false,
				processData: false,
				beforeSend: xhr => {
					switch (this.service) {
						case '1':
							xhr.setRequestHeader('Authorization', 'Client-ID 77574c7ca6bd774');
							break;
						default:
							break;
					}
				},
				success: res => {
					switch (this.service) {
						case '0':
							this.url = 'https://i.railrunner16.me/' + res.file;
							break;
						case '1':
							this.url = res.data.link;
							break;
						case '2':
							this.url = res.url;
							break;
						case '3':
							this.url = res.image;
							break;
						default:
							break;
					}
	
					this.copyToClipboard(this.url);
					this.createNotif(dataURI);
				},
				error: xhr => {
					alert(this.browser.i18n.getMessage('error_generic', xhr.status + ' ' + xhr.statusText));
				}
			});
		});
	}
}

const extensionBackground = new ExtensionBackground();
