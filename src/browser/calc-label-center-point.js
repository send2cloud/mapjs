/*global module, require */
const defaultTheme = require('../core/theme/default-theme'),
	createSVG = require('./create-svg'),
	pathElement = createSVG('path');
module.exports = function calcLabelCenterPoint(connectionPosition, toBox, d, labelTheme) {
	'use strict';
	labelTheme = labelTheme || defaultTheme.connector.default.label;
	pathElement.attr('d', d);
	if (labelTheme.position.ratio) {
		return pathElement[0].getPointAtLength(pathElement[0].getTotalLength() * labelTheme.position.ratio);
	}
	return {
		x: toBox.left + (toBox.width / 2) - connectionPosition.left,
		y: toBox.top - connectionPosition.top - labelTheme.position.aboveEnd
	};
};

