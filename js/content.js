/* global chrome */

class ExtensionContent {
	constructor() {
		this.ghostElement = null;
		this.gCoords = null;
		this.startPos = null;
		this.startY = null;

		this.browser = chrome || browser;

		this.gotMessage = this.gotMessage.bind(this);
		this.startScreenshot = this.startScreenshot.bind(this);
		this.sendMessage = this.sendMessage.bind(this);
		this.cancelScreenshot = this.cancelScreenshot.bind(this);
		this.endScreenshot = this.endScreenshot.bind(this);
		this.keyDown = this.keyDown.bind(this);
		this.mouseDown = this.mouseDown.bind(this);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseUp = this.mouseUp.bind(this);

		this.browser.runtime.onMessage.addListener(this.gotMessage);
	}

	startScreenshot() {
		document.body.style.cursor = 'crosshair';

		document.addEventListener('mousedown', this.mouseDown, false);
		document.addEventListener('keydown', this.keyDown, false);
	}

	gotMessage(request, sender, sendResponse) {
		if (request.type == 'start-screenshots') this.startScreenshot();

		sendResponse({});
	}

	sendMessage(msg) {
		document.body.style.cursor = 'default';

		this.browser.runtime.sendMessage(msg, response => {});
	}

	cancelScreenshot() {
		document.removeEventListener('mousemove', this.mouseMove, false);
		document.removeEventListener('mouseup', this.mouseUp, false);
		
		this.ghostElement.parentNode.removeChild(this.ghostElement);

		document.removeEventListener('mousedown', this.mouseDown, false);

		document.body.style.cursor = 'default';
	}

	endScreenshot(coords) {
		document.removeEventListener('mousedown', this.mouseDown, false);
		
		this.sendMessage({type: 'coords', coords: coords});
	}

	keyDown(e) {
		const { keyCode } = e;
		
		// Hit: Enter
		if ( keyCode == 13 && this.gCoords ) {
			e.preventDefault();
			e.stopPropagation();
			
			this.endScreenshot(this.gCoords);
			
			return false;
		} else if (keyCode == 27) {
			e.preventDefault();
			e.stopPropagation();

			this.cancelScreenshot();

			return false;
		}
	}

	mouseDown(e) {
		e.preventDefault();
	 
		this.startPos = {x: e.pageX, y: e.pageY};
		this.startY = e.y;
		
		this.ghostElement = document.createElement('div');
		this.ghostElement.style.background = 'blue';
		this.ghostElement.style.opacity = '0.1';
		this.ghostElement.style.position = 'absolute';
		this.ghostElement.style.left = e.pageX + 'px';
		this.ghostElement.style.top = e.pageY + 'px';
		this.ghostElement.style.width = "0px";
		this.ghostElement.style.height = "0px";
		this.ghostElement.style.zIndex = "1000000";
		this.ghostElement.style.borderColor = '#343a40';
		this.ghostElement.style.borderStyle = 'dashed';
		this.ghostElement.style.borderWidth = '1px';
		document.body.appendChild(this.ghostElement);
		
		document.addEventListener('mousemove', this.mouseMove, false);
		document.addEventListener('mouseup', this.mouseUp, false);
		
		return false;
	}

	mouseMove(e) {
		e.preventDefault();
	 
		var nowPos = {x: e.pageX, y: e.pageY};
		var diff = {x: nowPos.x - this.startPos.x, y: nowPos.y - this.startPos.y};
		
		this.ghostElement.style.width = diff.x + 'px';
		this.ghostElement.style.height = diff.y + 'px';
		
		return false;
	}

	mouseUp(e) {
		e.preventDefault();
		
		const nowPos = {x: e.pageX, y: e.pageY};
		const diff = {x: nowPos.x - this.startPos.x, y: nowPos.y - this.startPos.y};
	 
		document.removeEventListener('mousemove', this.mouseMove, false);
		document.removeEventListener('mouseup', this.mouseUp, false);
		
		this.ghostElement.parentNode.removeChild(this.ghostElement);
		
		setTimeout(() => {
			var coords = {
				w: diff.x,
				h: diff.y,
				x: this.startPos.x,
				y: this.startY
			};
			this.gCoords = coords;
			this.endScreenshot(coords);
		}, 50);
		
		return false;
	}
}

const extensionContent = new ExtensionContent();
