/*global require */
const jQuery = require('jquery'),
	createSVG = require('./create-svg'),
	linkKey = require('../core/util/link-key');

jQuery.fn.createLink = function (l) {
	'use strict';
	const stage = this.parent('[data-mapjs-role=stage]');
	return createSVG('g')
		.attr({
			'id': linkKey(l),
			'data-mapjs-role': 'link'
		})
		.data({
			'nodeFrom': stage.nodeWithId(l.ideaIdFrom),
			'nodeTo': stage.nodeWithId(l.ideaIdTo),
			attr: l.attr && l.attr.style
		})
		.appendTo(this);
};

