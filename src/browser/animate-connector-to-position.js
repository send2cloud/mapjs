/*global require */
const jQuery = require('jquery');

require('./get-box');
require('./get-data-box');

jQuery.fn.animateConnectorToPosition = function (animationOptions, tolerance) {
	'use strict';
	const element = jQuery(this),
		shapeFrom = element.data('nodeFrom'),
		shapeTo = element.data('nodeTo'),
		fromBox = shapeFrom && shapeFrom.getDataBox(),
		toBox = shapeTo && shapeTo.getDataBox(),
		oldBox = {
			from: shapeFrom && shapeFrom.getBox(),
			to: shapeTo && shapeTo.getBox()
		};
	tolerance = tolerance || 1;
	if (fromBox && toBox && oldBox && oldBox.from.width === fromBox.width &&
		oldBox.to.width   === toBox.width   &&
		oldBox.from.height  === fromBox.height    &&
		oldBox.to.height  === toBox.height    &&
		Math.abs(oldBox.from.top - oldBox.to.top - (fromBox.top - toBox.top)) < tolerance &&
		Math.abs(oldBox.from.left - oldBox.to.left - (fromBox.left - toBox.left)) < tolerance) {

		element.animate({
			left: Math.round(Math.min(fromBox.left, toBox.left)),
			top: Math.round(Math.min(fromBox.top, toBox.top))
		}, animationOptions);
		return true;
	}
	return false;
};


