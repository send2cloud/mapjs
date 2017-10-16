/*global require */
const $ = require('jquery'),
	ThemeProcessor = require('../core/theme/theme-processor');
$.fn.themeCssWidget = function (mapThemeModel, optional) {
	'use strict';
	if (!mapThemeModel) {
		throw 'invalid-args';
	}
	const element = $(this),
		themeProcessor = (optional && optional.themeProcessor) || new ThemeProcessor(),
		activateTheme = (themeJson) => element.text(themeProcessor.process(themeJson).css);

	mapThemeModel.addEventListener('themeJSONChanged', activateTheme);
	return element;
};

