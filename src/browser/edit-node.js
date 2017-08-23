/*global require */
const jQuery = require('jquery');

require('./inner-text');
require('./place-caret-at-end');
require('./select-all');
require('./hammer-draggable');


jQuery.fn.editNode = function (shouldSelectAll) {
	'use strict';
	const node = this,
		textBox = this.find('[data-mapjs-role=title]'),
		unformattedText = this.data('title'),
		originalText = textBox.text(),
		result = jQuery.Deferred(),
		clear = function () {
			detachListeners(); //eslint-disable-line no-use-before-define
			textBox.css('word-break', '');
			textBox.removeAttr('contenteditable');
			node.shadowDraggable();
		},
		finishEditing = function () {
			const content = textBox.innerText();
			if (content === unformattedText) {
				return cancelEditing(); //eslint-disable-line no-use-before-define
			}
			clear();
			result.resolve(content);
		},
		cancelEditing = function () {
			clear();
			textBox.text(originalText);
			result.reject();
		},
		keyboardEvents = function (e) {
			const ENTER_KEY_CODE = 13,
				ESC_KEY_CODE = 27,
				TAB_KEY_CODE = 9,
				S_KEY_CODE = 83,
				Z_KEY_CODE = 90;
			if (e.shiftKey && e.which === ENTER_KEY_CODE) {
				return; // allow shift+enter to break lines
			} else if (e.which === ENTER_KEY_CODE) {
				finishEditing();
				e.stopPropagation();
			} else if (e.which === ESC_KEY_CODE) {
				cancelEditing();
				e.stopPropagation();
			} else if (e.which === TAB_KEY_CODE || (e.which === S_KEY_CODE && (e.metaKey || e.ctrlKey) && !e.altKey)) {
				finishEditing();
				e.preventDefault(); /* stop focus on another object */
			} else if (!e.shiftKey && e.which === Z_KEY_CODE && (e.metaKey || e.ctrlKey) && !e.altKey) { /* undo node edit on ctrl+z if text was not changed */
				if (textBox.text() === unformattedText) {
					cancelEditing();
				}
				e.stopPropagation();
			}
		},
		attachListeners = function () {
			textBox.on('blur', finishEditing).on('keydown', keyboardEvents);
		},
		detachListeners = function () {
			textBox.off('blur', finishEditing).off('keydown', keyboardEvents);
		};
	attachListeners();
	if (unformattedText !== originalText) { /* links or some other potential formatting issues */
		textBox.css('word-break', 'break-all');
	}
	textBox.text(unformattedText).attr('contenteditable', true).focus();
	if (shouldSelectAll) {
		textBox.selectAll();
	} else if (unformattedText) {
		textBox.placeCaretAtEnd();
	}
	node.shadowDraggable({disable: true});
	return result.promise();
};

