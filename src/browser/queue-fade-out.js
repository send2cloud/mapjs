/*global require */
const jQuery = require('jquery'),
	_ = require('underscore');
jQuery.fn.queueFadeOut = function (options) {
	'use strict';
	const element = this;
	return element.fadeOut(_.extend({
		complete: function () {
			if (element.is(':focus')) {
				element.parents('[tabindex]').focus();
			}
			element.remove();
		}
	}, options));
};

