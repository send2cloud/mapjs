/*global module, require */
const defaultTheme = require('../theme/default-theme');
module.exports = function calcLabelCenterPoint(connectionPosition, toBox, pathDOM, labelTheme) {
	'use strict';
	labelTheme = labelTheme || defaultTheme.connector.default.label;

	if (labelTheme.position.ratio) {
		return pathDOM.getPointAtLength(pathDOM.getTotalLength() * labelTheme.position.ratio);
	}
	return {
		x: toBox.left + (toBox.width / 2) - connectionPosition.left,
		y: toBox.top - connectionPosition.top - labelTheme.position.aboveEnd
	};
};

