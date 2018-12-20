/*global require, module, __dirname, window */
const path = require('path'),
	templateDir = path.join(__dirname, '..', 'assets'),
	indexFile = path.resolve(templateDir, 'index.html');
module.exports = function mapjsFixture(mapJson/*, additionalOptions*/) {
	'use strict';
	return {
		url: `file://${indexFile}`,
		beforeScreenshotArgs: [mapJson],
		beforeScreenshot: function (mapjsonContent) {
			window.postMessage({content: mapjsonContent, theme: mapjsonContent && mapjsonContent.theme}, '*');
		}
	};
};
