/*global module, require, __dirname*/
const path = require('path');
module.exports = function (fontFile) {
	'use strict';
	return path.resolve(__dirname, '..', 'fonts', fontFile);
};
