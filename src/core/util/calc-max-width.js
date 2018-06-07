/*global module*/

module.exports = function calcMaxWidth(attr, nodeTheme, options) {
	'use strict';
	const maxWidth = (attr && attr.style && attr.style.width) || (nodeTheme && nodeTheme.text && nodeTheme.text.maxWidth),
		margin = (nodeTheme && nodeTheme.margin) || (nodeTheme && nodeTheme.text && nodeTheme.text.margin) || 0;
	if (options && options.substractMarginFromMaxWidth && margin) {
		return  maxWidth - (2 * margin);
	}
	return maxWidth;
};
