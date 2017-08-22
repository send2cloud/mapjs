/*global require, module */
const jQuery = require('jquery'),
	DOMRender = {
		svgPixel: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
		dummyTextBox: jQuery('<div>').addClass('mapjs-node').css({position: 'absolute', visibility: 'hidden'}),
		fixedLayout: false
	};

module.exports = DOMRender;
