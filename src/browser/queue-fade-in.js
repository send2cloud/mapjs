/*global require */
const jQuery = require('jquery'),
	_ = require('underscore');
jQuery.fn.queueFadeIn = function (options) {
	'use strict';
	const element = this;
	return element
		.css('opacity', 0)
		.animate(
			{'opacity': 1},
			_.extend({ complete: function () {
				element.css('opacity', '');
			}}, options)
		);
};

