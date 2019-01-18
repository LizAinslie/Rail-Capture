/* global Image */

class ImgWarp { // eslint-disable-line
	constructor (options) {
		this._color = options.color || '#dd4535';
		this.width = options.width || 500;
		this.height = options.height || 250;
		this.canvas = options.canvas || {};
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.c = this.canvas.getContext("2d") || null;
		
		this.mouseX = 0;
		this.mouseY = 0;
	}
  
	loadFromDataUri(uri, callback) {
		var eventObj = this;

		var img = new Image();
		img.src = uri;

		img.onload = function () {
			eventObj.c.drawImage(img, 0, 0);
			callback();
		};
	}

	setColor(newColor) {
		this._color = newColor;
	}

	line(x1, y1, x2, y2, color, lineWidth) {
		this.c.beginPath();
		this.c.moveTo(x1, y1);
		this.c.lineTo(x2, y2);
		this.c.strokeStyle = color || this._color || 'black';
		this.c.lineWidth = lineWidth || 1;
		this.c.stroke();
	}
	
	blur(x, y, width, height, hex, resolution) {
    	for (var i = 0; i < width; i += resolution) {
    		this.c.beginPath();
    		this.c.rect(x + i, y, resolution, height);
    		this.c.fillStyle = hex + (Math.round(Math.random() * 99));
    	}
	}
}



class Editor {
	constructor(options) {
		
	}
}