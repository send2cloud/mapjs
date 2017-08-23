/*global require, window, document */
const jQuery = require('jquery');
jQuery.fn.placeCaretAtEnd = function () {
	'use strict';
	const el = this[0];
	let range, sel, textRange;
	if (window.getSelection && document.createRange) {
		range = document.createRange();
		range.selectNodeContents(el);
		range.collapse(false);
		sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	} else if (document.body.createTextRange) {
		textRange = document.body.createTextRange();
		textRange.moveToElementText(el);
		textRange.collapse(false);
		textRange.select();
	}
};

