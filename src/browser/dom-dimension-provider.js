/*global require, document, module */
const jQuery = require('jquery'),
	_ = require('underscore'),
	nodeCacheMark = require('./node-cache-mark'),
	DOMRender = require('./dom-render');

require('./node-with-id');
require('./update-node-content');

module.exports = function domDimensionProvider(idea, level) {
	'use strict'; /* support multiple stages? */
	const translateToPixel = function () {
		return DOMRender.svgPixel;
	};
	let result = false,
		textBox = jQuery(document).nodeWithId(idea.id);
	if (textBox && textBox.length > 0) {
		if (_.isEqual(textBox.data('nodeCacheMark'), nodeCacheMark(idea, {level: level, theme: DOMRender.theme}))) {
			return _.pick(textBox.data(), 'width', 'height');
		}
	}
	textBox = DOMRender.dummyTextBox;
	textBox.appendTo('body').updateNodeContent(
		idea,
		{resourceTranslator: translateToPixel, level: level, theme: DOMRender.theme}
	);
	result = {
		width: textBox.outerWidth(true),
		height: textBox.outerHeight(true)
	};
	textBox.detach();
	return result;
};

