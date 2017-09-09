/* global module, require */
const URLHelper = require('../util/url-helper');
module.exports = function formatNoteToHtml(noteText) {
	'use strict';
	if (!noteText) {
		return '';
	}
	if (typeof noteText !== 'string') {
		throw 'invalid-args';
	}
	const safeString = noteText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return URLHelper.formatLinks(safeString);
};
