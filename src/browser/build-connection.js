/*global module, require*/
const themeConnector = require('../core/theme/connector');
module.exports = function buildConnection(element, optional) {
	'use strict';
	const applyInnerRect = (shape, box) => {
			const innerRect = shape.data().innerRect;
			if (innerRect) {
				box.left += innerRect.dx;
				box.top += innerRect.dy;
				box.width = innerRect.width;
				box.height = innerRect.height;
			}
		},
		connectorBuilder = optional && optional.connectorBuilder || themeConnector,
		shapeFrom = element.data('nodeFrom'),
		shapeTo = element.data('nodeTo'),
		theme = optional && optional.theme,
		connectorAttr = element.data('attr'),
		fromBox = shapeFrom && shapeFrom.getDataBox(),
		toBox = shapeTo && shapeTo.getDataBox();
	if (!shapeFrom || !shapeTo || shapeFrom.length === 0 || shapeTo.length === 0) {
		// element.hide();
		return;
	}

	applyInnerRect(shapeFrom, fromBox);
	applyInnerRect(shapeTo, toBox);
	fromBox.styles = shapeFrom.data('styles');
	toBox.styles = shapeTo.data('styles');

	return  Object.assign(connectorBuilder(fromBox, toBox, theme), connectorAttr);

};
