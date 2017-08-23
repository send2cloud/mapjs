/*global require */
const $ = require('jquery'),
	Theme = require('../core/theme/theme');
$.fn.themeCssWidget = function (themeProvider, themeProcessor, mapModel, domMapController) {
	'use strict';
	const element = $(this),
		activateTheme =	function (theme) {
			const themeJson = themeProvider[(theme || 'default')];
			if (!themeJson) {
				return;
			}
			domMapController.setTheme(new Theme(themeJson));
			element.text(themeProcessor.process(themeJson).css);
		};
	activateTheme('default');
	mapModel.addEventListener('themeChanged', activateTheme);
	return element;
};

