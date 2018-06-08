/*global require, console */
const jQuery = require('jquery');
jQuery.fn.queueFadeOut = function (theme) {
	'use strict';
	const element = this,
		removeElement = () => {
			if (element.is(':focus')) {
				element.parents('[tabindex]').focus();
			}
			console.log('removing');
			return element.remove();
		};
	if (!theme || theme.noAnimations()) {
		console.log('not fading');
		return removeElement();
	}
	console.log('fading');
	return element
	.on('transitionend', removeElement)
	.css('opacity', 0);

};

