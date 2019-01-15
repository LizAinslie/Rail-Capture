var Constants = {
	w: 500,
	h: 500,
	x: 200,
	y: 200,
	Commands: {
		TAKE_SCREENSHOT: 'take_screenshot',
	},
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

chrome.commands.onCommand.addListener(function(command) {
	if (command === Constants.Commands.TAKE_SCREENSHOT) chrome.tabs.getCurrent(function(tab) {
		sendMessage({type: 'start-screenshots'}, tab);
	});
	else return;
});

chrome.extension.onMessage.addListener(gotMessage);
 
function gotMessage(request, sender, sendResponse) {
	if (request.type == "coords")
		capture(request.coords);
 
	sendResponse({}); // snub them.
}
 
function sendMessage(msg, tab) {
	console.log('sending message');

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
    var blob = new Blob([ab], {type: mimeString});
    
    var formData = new FormData();
	
	formData.append('user', 'RailRunner16');
	formData.append('pass', '01101100l');
	formData.append('file', blob);
	
	$.ajax({
		type: 'POST',
		url: 'https://i.railrunner16.me/sharex',
		data: formData,
		contentType: false,
		processData: false,
		success: function(res) {
			const url = 'https://i.railrunner16.me/' + res.file;
			copyToClipboard(url);
			openInNewTab(url);
		},
		error: function(xhr) {
			alert("An error occured: " + xhr.status + " " + xhr.statusText);
		}
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
		alert('Error copying to clipboard: ' + e.toString());
	}
}

function openInNewTab(url) {
	chrome.tabs.create({
		url,
	});
}