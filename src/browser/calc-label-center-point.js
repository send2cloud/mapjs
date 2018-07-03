/*global module, require */
const defaultTheme = require('../core/theme/default-theme'),
	createSVG = require('./create-svg'),
	pathElement = createSVG('path');
module.exports = function calcLabelCenterPoint(connectionPosition, toBox, d, labelTheme) {
	'use strict';
	labelTheme = labelTheme || defaultTheme.connector.default.label;
	const labelPosition = labelTheme.position || {};

	pathElement.attr('d', d);
	if (labelPosition.ratio) {
		return pathElement[0].getPointAtLength(pathElement[0].getTotalLength() * labelTheme.position.ratio);
	}
	if (labelPosition.aboveEnd) {
		return {
			x: toBox.left + (toBox.width / 2) - connectionPosition.left,
			y: toBox.top - connectionPosition.top - labelPosition.aboveEnd
		};
	}

	return pathElement[0].getPointAtLength(pathElement[0].getTotalLength() * 0.5);

};

