Filters = {};

// Object version
Filters.version = "Filters 1.0.2";

Filters.isLock = false;

Filters.resetImage = function(img, canvas){
	this.isLock = true;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	this.isLock = false;
};

Filters.invertColor = function(img, canvas){
	this.isLock = true;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	// invert colors
    for (var i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255 - imgData.data[i];
        imgData.data[i+1] = 255 - imgData.data[i+1];
        imgData.data[i+2] = 255 - imgData.data[i+2];
        imgData.data[i+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    this.isLock = false;
};

// Mirror effect.
Filters.centralMirror = function(img, canvas){
	this.isLock = true;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	// compute mirror effect
	for(var rowIndex = 0; rowIndex < canvas.height; rowIndex++){
		for(var colIndex = 0; colIndex < canvas.width; colIndex++){
			if(colIndex < Math.floor(canvas.width / 2)){
				var pixelIndex = (colIndex + canvas.width * rowIndex) * 4;
				var mirrorIndex = ((canvas.width - 1 - colIndex) + canvas.width * rowIndex) * 4;

				var r = imgData.data[mirrorIndex];
				var g = imgData.data[mirrorIndex + 1];
				var b = imgData.data[mirrorIndex + 2];

				imgData.data[pixelIndex] = r;
				imgData.data[pixelIndex + 1] = g;
				imgData.data[pixelIndex + 2] = b;
			}
		}
	}
    ctx.putImageData(imgData, 0, 0);
    this.isLock = false;
};

Filters.grayscale = function(img, canvas){
	this.isLock = true;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	// compute gray color
    for (var i = 0; i < imgData.data.length; i += 4) {
        var r = imgData.data[i];
        var g = imgData.data[i+1];
        var b = imgData.data[i+2];
        var fV = g;//(0.2126*r + 0.7152*g + 0.0722*b >= 255) ? 255 : 0;
        imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = fV;
    }
    ctx.putImageData(imgData, 0, 0);
    this.isLock = false;
};

Filters.modernGray = function(img, canvas, offsetRX, offsetRY, offsetGX, offsetGY, offsetBX, offsetBY){
	this.isLock = true;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	// get index based on col & row
	for(var rowIndex = 0; rowIndex < canvas.height; rowIndex++){
		for(var colIndex = 0; colIndex < canvas.width; colIndex++){
			var pixelIndex = (colIndex + canvas.width * rowIndex) * 4;
			var offsetRIndex = (((colIndex + offsetRX) >= canvas.width ? canvas.width - 1 : (colIndex + offsetRX)) + canvas.width * ((rowIndex + offsetRY) >= canvas.height ? canvas.height - 1 : (rowIndex + offsetRY))) * 4;
			var offsetGIndex = (((colIndex + offsetGX) >= canvas.width ? canvas.width - 1 : (colIndex + offsetGX)) + canvas.width * ((rowIndex + offsetGY) >= canvas.height ? canvas.height - 1 : (rowIndex + offsetGY))) * 4;
			var offsetBIndex = (((colIndex + offsetBX) >= canvas.width ? canvas.width - 1 : (colIndex + offsetBX)) + canvas.width * ((rowIndex + offsetBY) >= canvas.height ? canvas.height - 1 : (rowIndex + offsetBY))) * 4;
			
			// New gray color will be based on green channel
			var r = imgData.data[pixelIndex];
			var g = imgData.data[pixelIndex + 1];
			var b = imgData.data[pixelIndex + 2];

			// Get RGB from offset pixel
			var oR = imgData.data[offsetRIndex];
			var oG = imgData.data[offsetGIndex + 1];
			var oB = imgData.data[offsetBIndex + 2];

			// Compute final RGB
			var fR = g + Math.floor(oR * 0.5);
			var fG = g * 0.7 + Math.floor(oB * 0.4);
			var fB = g * 0.4 + Math.floor(oB * 0.6);

			// Write final color value back
			imgData.data[pixelIndex] = fR;
			imgData.data[pixelIndex + 1] = fG;
			imgData.data[pixelIndex + 2] = fB;
		}
	}
    ctx.putImageData(imgData, 0, 0);
    this.isLock = false;
};


Filters.shattered = function(img, canvas){
	this.isLock = true;

	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	// Now create "pieces"

	// Many fracture lines: Divide into 10 (even angles), center point is (width * 1.5, height)
	var angleFromTR = Math.atan2(canvas.height, -0.5 * canvas.width);
	var angleFromTL = Math.atan2(canvas.height, -1.5 * canvas.width);

	var prevCrossX1 = canvas.width;
	var prevCrossY1 = 0;
	var prevCrossX2 = canvas.width;
	var prevCrossY2 = 0;

	

	for(var fIndex = 1; fIndex < 15; fIndex++){
		var fRadius = angleFromTR + (Math.PI - angleFromTR) * fIndex / 14;
		var pt1X = 0;
		var pt1Y = 0;
		var pt2X = 0;
		var pt2Y = 0;

		if(fIndex == 10){
			// point 1 is BL, point 2 is BR
			pt1X = 0;
			pt1Y = canvas.height;

			pt2X = canvas.width;
			pt2Y = canvas.height;
		}
		else if(fRadius < angleFromTL){
			// point 1 at top border, point 2 at right border
			pt1X = 1.5 * canvas.width - canvas.height * Math.tan(fRadius - Math.PI / 2);
			pt1Y = 0;

			pt2X = canvas.width;
			pt2Y = canvas.height - canvas.width / 2 * Math.tan(Math.PI - fRadius);
		}
		else{
			// point 1 at left border, point 2 at right border
			pt1X = 0;
			pt1Y = canvas.height - canvas.width * 1.5 * Math.tan(Math.PI - fRadius);

			pt2X = canvas.width;
			pt2Y = canvas.height - canvas.width / 2 * Math.tan(Math.PI - fRadius);
		}

		ctx.save();
		ctx.beginPath();

		ctx.moveTo(pt1X, pt1Y);
		ctx.lineTo(prevCrossX1, prevCrossY1);
		ctx.lineTo(prevCrossX2, prevCrossY2);
		ctx.lineTo(pt2X, pt2Y);
		ctx.lineTo(pt1X, pt1Y);

		// now "clip!"
		
		ctx.clip();
		var clipScale = 1 + Math.abs(Math.sin(Math.PI / 18 * fIndex)) * 0.2;
		var clipWidth = canvas.width * clipScale;
		var clipHeight = canvas.height * clipScale;

		var pasteX = fIndex / 2 == 0 ? 0 : canvas.width - clipWidth;
		var pasteY = fIndex / 2 == 0 ? 0 : canvas.height - clipHeight;

		ctx.drawImage(img, fIndex / 2 == 0 ? 0 : pasteX, fIndex / 2 == 0 ? 0 : pasteY, fIndex / 2 == 0 ? canvas.width : clipWidth, fIndex / 2 == 0 ? canvas.height : clipHeight);

		ctx.closePath();
		ctx.restore();

		prevCrossX1 = pt1X;
		prevCrossY1 = pt1Y;
		prevCrossX2 = pt2X;
		prevCrossY2 = pt2Y;
	}

	// when the "fraction" is completed, add patches:
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(canvas.width / 6, 0);
	ctx.lineTo(canvas.width / 7, canvas.height / 4);
	ctx.lineTo(0, canvas.height / 5);
	ctx.lineTo(0, 0);
	ctx.clip();
	ctx.drawImage(img, (canvas.width / 7 - canvas.width / 6) / 2, 0);
	ctx.closePath();
	ctx.restore();

	//---
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(canvas.width / 7 * 4, canvas.height / 9 * 1);
	ctx.lineTo(canvas.width / 7 * 6, canvas.height / 9 * 3);
	ctx.lineTo(canvas.width / 7 * 5, canvas.height / 9 * 5);
	ctx.lineTo(canvas.width / 7 * 3, canvas.height / 9 * 4);
	ctx.lineTo(canvas.width / 7 * 4, canvas.height / 9 * 1);
	ctx.clip();
	ctx.drawImage(img, (-1 * canvas.width / 7 * 3) / 2, 0);
	ctx.closePath();
	ctx.restore();

	//---
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(canvas.width / 5 * 4, canvas.height / 10 * 1);
	ctx.lineTo(canvas.width / 7 * 6, canvas.height / 15 * 3);
	ctx.lineTo(canvas.width / 9 * 5, canvas.height / 7 * 5);
	ctx.lineTo(canvas.width / 7 * 3, canvas.height / 7 * 4);
	ctx.lineTo(canvas.width / 5 * 4, canvas.height / 10 * 1);
	ctx.clip();
	ctx.drawImage(img, (-1 * canvas.width / 7 * 2) / 2, (-1 * canvas.height / 5 * 3)  / 2);
	ctx.closePath();
	ctx.restore();

	//---
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(0, canvas.height / 2);
	ctx.lineTo(canvas.width / 9 * 7, canvas.height / 9 * 8);
	ctx.lineTo(canvas.width / 7 * 5, canvas.height / 10 * 9);
	ctx.lineTo(0, canvas.height / 9 * 6);
	ctx.lineTo(0, canvas.height / 2);
	ctx.clip();
	ctx.drawImage(img, (-1 * canvas.width / 9 * 2) / 2, (1 * canvas.height / 10 * 5)  / 2);
	ctx.closePath();
	ctx.restore();

	//---
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(canvas.width / 10 * 9, canvas.height / 5 * 3);
	ctx.lineTo(canvas.width, canvas.height / 3 * 2);
	ctx.lineTo(canvas.width, canvas.height);
	ctx.lineTo(canvas.width / 10 * 8, canvas.height);
	ctx.lineTo(canvas.width / 10 * 9, canvas.height / 5 * 3);
	ctx.clip();
	ctx.drawImage(img, (canvas.width / 5 * 3), (canvas.height / 9 * 2));
	ctx.closePath();
	ctx.restore();


    this.isLock = false;
};
